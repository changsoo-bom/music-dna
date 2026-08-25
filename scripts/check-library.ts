/**
 * 보관함 검증.
 *
 * 브라우저 없이 돌아간다 — `toggleLibrary` 는 저장소를 읽고 배열을 고쳐 다시
 * 쓰는 순수한 일이고, 필요한 건 `localStorage` 흉내 하나뿐이다.
 *
 * **여기서 막고 싶은 것은 조용한 데이터 유실이다.** 카탈로그는 배치로 채워지는
 * 파일이라 저장된 id 가 지금 목록에 없을 수 있는데, 그 상태에서 다른 곡을
 * 담았다고 남의 곡이 사라지면 화면에는 아무 표시도 안 난다 —
 * 읽기 경로가 어차피 그 id 를 숨기기 때문이다.
 */
import assert from "node:assert/strict";

import { CATALOG } from "@/data/catalog";
import { LIBRARY_LIMIT, toggleLibrary } from "@/lib/library";
import {
  PLAYLIST_LIMIT,
  createPlaylist,
  deletePlaylist,
  removePlaylistTracks,
  renamePlaylist,
  togglePlaylistTrack,
} from "@/lib/playlists";
import { parsePlayed, parseRawIds } from "@/lib/schemas/played";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/** `window.localStorage` 최소 흉내. 이 파일이 브라우저를 필요로 하는 유일한 지점이다 */
const store = new Map<string, string>();
Object.defineProperty(globalThis, "window", {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => void store.set(key, value),
    },
    dispatchEvent: () => true,
  },
});

const KEY = STORAGE_KEYS.library;
const saved = () => parseRawIds(store.get(KEY) ?? null);
const seed = (ids: string[]) => store.set(KEY, JSON.stringify(ids));

// 담으면 맨 앞에 온다
store.clear();
toggleLibrary("t001");
toggleLibrary("t002");
assert.deepEqual(saved(), ["t002", "t001"], "새로 담은 곡이 맨 앞이 아니다");

// 다시 누르면 빠진다
toggleLibrary("t002");
assert.deepEqual(saved(), ["t001"], "다시 눌렀는데 안 빠졌다");

// 깨진 값은 빈 목록이다. **여기가 신뢰 경계다** — 저장소는 사람이 고칠 수 있고,
// 던지면 `getSnapshot` 안에서 렌더 도중에 죽는다
store.set(KEY, "{ 망가진 값");
assert.deepEqual(saved(), [], "JSON 이 아닌 값이 안 걸러졌다");
store.set(KEY, JSON.stringify({ a: 1 }));
assert.deepEqual(saved(), [], "배열이 아닌 값이 안 걸러졌다");
store.set(KEY, JSON.stringify(["t001", 42]));
assert.deepEqual(saved(), [], "문자열이 아닌 원소가 섞였는데 안 걸러졌다");

// 저장된 값에 중복이 섞여 있어도 한 줄로 접힌다.
// 안 접히면 목록에 같은 곡이 두 줄 생기고 React 의 key 가 겹친다
seed(["t001", "t001", "t002"]);
assert.deepEqual(saved(), ["t001", "t002"], "중복 id 가 안 접혔다");

/**
 * **카탈로그에 없는 id 는 살아남는다.**
 *
 * 쓰기 경로가 카탈로그로 정규화하면(`parseTrackIds`) 여기서 `ghost` 가 사라진다.
 * 곡 목록이 배치로 갈릴 때마다 남의 보관함을 지우는 버그가 정확히 이 모양이었다.
 */
seed(["ghost-track", "t001"]);
toggleLibrary("t002");
assert.ok(saved().includes("ghost-track"), "카탈로그에 없는 id 가 저장소에서 지워졌다");

// 상한이 있다. 없으면 저장소 한도까지 자란다
store.clear();
seed(Array.from({ length: LIBRARY_LIMIT }, (_, i) => `x${i}`));
toggleLibrary("t001");
assert.equal(saved().length, LIBRARY_LIMIT, "보관함이 상한을 넘었다");
assert.equal(saved()[0], "t001", "상한에서 새로 담은 곡이 안 들어갔다");

// 최근 재생은 여전히 9개에서 잘린다. `parseTrackIds` 가 limit 인자를 받게 바뀐 자리다.
// 카탈로그에 실제로 있는 id 여야 한다 — 없는 id 는 파서가 떨어뜨려서 개수가 안 는다
const many = JSON.stringify(CATALOG.slice(0, 12).map((track) => track.id));
assert.equal(parsePlayed(many).length, 9, "최근 재생 상한이 9가 아니다");

/* ── 리스트 ───────────────────────────────────────────────────── */

const LIST_KEY = STORAGE_KEYS.playlists;
const lists = () => parsePlaylists(store.get(LIST_KEY) ?? null);
const noon = (day: number) => new Date(2026, 7, day, 12, 0, 0);

// 이름은 만든 날의 **지역** 날짜다. UTC 로 지으면 오전 9시 전에 만든 것이
// 어제 이름을 달고 나온다 — 한국 시각 오전 2시로 확인한다
store.clear();
createPlaylist(new Date(2026, 7, 25, 2, 0, 0));
assert.equal(lists()[0]?.name, "20260825", "리스트 이름이 지역 날짜가 아니다");
assert.equal(lists()[0]?.createdAt, "2026-08-25", "만든 날이 지역 날짜가 아니다");
assert.deepEqual(lists()[0]?.trackIds, [], "새 리스트가 빈 채로 안 만들어졌다");

// 같은 날 두 번 만들면 이름이 겹친다. 겹친 채로 두면 어느 카드에 담았는지 모른다
createPlaylist(noon(25));
assert.equal(lists()[0]?.name, "20260825 (2)", "같은 날 두 번째 리스트 이름이 안 갈렸다");
createPlaylist(noon(25));
assert.equal(lists()[0]?.name, "20260825 (3)", "세 번째 리스트 이름이 안 갈렸다");

// 새 리스트가 맨 앞이다. 방금 만든 것이 안 보이면 만들어졌는지 확인이 안 된다
createPlaylist(noon(26));
assert.equal(lists()[0]?.name, "20260826", "새 리스트가 맨 앞이 아니다");
assert.equal(lists().length, 4, "리스트가 덮어써졌다");

// 곡을 담고 뺀다. 같은 버튼이 두 방향이라 두 번 누르면 원래대로다
const first = lists()[0]!.id;
togglePlaylistTrack(first, "t001");
togglePlaylistTrack(first, "t002");
assert.deepEqual(lists()[0]?.trackIds, ["t002", "t001"], "새로 담은 곡이 맨 앞이 아니다");
togglePlaylistTrack(first, "t002");
assert.deepEqual(lists()[0]?.trackIds, ["t001"], "다시 눌렀는데 안 빠졌다");

// 담는 것은 그 리스트에만 들어간다. 다른 리스트가 같이 움직이면 어디에
// 담았는지가 화면과 어긋난다
assert.deepEqual(lists()[1]?.trackIds, [], "다른 리스트까지 곡이 들어갔다");

// 고른 곡을 한 번에 뺀다(상세 화면의 선택 삭제). 안 고른 곡은 남고,
// 리스트에 없는 id 를 골라도 나머지가 멀쩡해야 한다 — 화면과 저장소가
// 한 프레임 어긋나면 지운 뒤에 없는 곡을 고른 채로 누르게 된다
togglePlaylistTrack(first, "t002");
togglePlaylistTrack(first, "t003");
assert.deepEqual(lists()[0]?.trackIds, ["t003", "t002", "t001"], "선택 삭제 준비가 어긋났다");
removePlaylistTracks(first, new Set(["t002", "t999"]));
assert.deepEqual(lists()[0]?.trackIds, ["t003", "t001"], "고른 곡만 빠지지 않았다");
assert.deepEqual(lists()[1]?.trackIds, [], "다른 리스트에서까지 곡이 빠졌다");
removePlaylistTracks(first, new Set(["t003"]));

// 이름을 바꾼다. 빈 이름·공백은 안 받는다 — 이름 없는 카드는 되돌릴 방법이 없다
const target = lists()[0]!.id;
renamePlaylist(target, "  드라이브  ");
assert.equal(lists()[0]?.name, "드라이브", "이름이 안 바뀌었거나 공백이 안 깎였다");
renamePlaylist(target, "   ");
assert.equal(lists()[0]?.name, "드라이브", "공백만 있는 이름이 저장됐다");

// 지우면 그것만 없어진다
const before = lists().length;
deletePlaylist(target);
assert.equal(lists().length, before - 1, "삭제로 지워진 개수가 하나가 아니다");
assert.ok(!lists().some((list) => list.id === target), "지운 리스트가 남았다");

// 깨진 값은 빈 목록이다. 여기도 신뢰 경계다
store.set(LIST_KEY, "{ 망가진 값");
assert.deepEqual(lists(), [], "JSON 이 아닌 값이 안 걸러졌다");
store.set(LIST_KEY, JSON.stringify([{ id: "1", name: "x" }]));
assert.deepEqual(lists(), [], "모양이 안 맞는 리스트가 안 걸러졌다");

// 상한이 있다
store.set(
  LIST_KEY,
  JSON.stringify(
    Array.from({ length: PLAYLIST_LIMIT }, (_, i) => ({
      id: `x${i}`,
      name: `x${i}`,
      createdAt: "2026-01-01",
      trackIds: [],
    })),
  ),
);
createPlaylist(noon(27));
assert.equal(lists().length, PLAYLIST_LIMIT, "리스트가 상한을 넘었다");
assert.equal(lists()[0]?.name, "20260827", "상한에서 새 리스트가 안 들어갔다");

console.log("check-library: ok");

