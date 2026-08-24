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
import { parsePlayed, parseRawIds } from "@/lib/schemas/played";
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

console.log("check-library: ok");

