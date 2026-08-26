import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { readStoredValue, writeStoredValue } from "@/lib/stored-value";
import type { Playlist } from "@/types/music";

/**
 * 리스트를 몇 개까지 만들 수 있는지.
 *
 * **곡 상한(`TRACK_LIMIT`, 500)과 자릿수가 다르다.** 저기는 사람이 담는
 * 속도가 한 번에 한 곡이라 넉넉해도 되지만, 리스트는 이름이 날짜라
 * 하루에 여러 개가 생기고 하나가 곡을 500개까지 이고 있을 수 있다.
 * 저장소 한도(`writeStoredValue`)에 먼저 닿는 쪽이 여기다.
 *
 * **상한에 닿으면 만들지 않는다.** 한때 새 것을 맨 앞에 넣고 뒤를 잘랐는데,
 * 그러면 만들기 버튼 한 번에 가장 오래된 리스트가 이름과 담긴 곡째로
 * 사라졌다 — 지우기는 확인 창까지 두는데(`ConfirmPop`) 만들기가 같은
 * 파괴를 말없이 한 셈이다.
 */
export const PLAYLIST_LIMIT = 50;

/**
 * 리스트 하나에 몇 곡까지 담을지.
 *
 * **상한이 없으면 안 된다.** 브라우저 저장소는 오리진당 한도가 있고, 여기는
 * 사람이 빼기 전에는 안 없어지는 목록이다. 카탈로그 목표 크기(300곡)를
 * 넉넉히 넘는 값이라 정상적으로 쓰는 사람은 이 벽에 안 닿는다.
 *
 * 한때는 저장할 때 카탈로그로 걸러서 카탈로그 자체가 상한 노릇을 했는데,
 * 그 방식이 곡 목록이 바뀔 때 남의 목록을 지웠다 → `parseRawIds`
 */
export const TRACK_LIMIT = 500;

/**
 * 만든 날짜로 이름을 짓는다. `2026-08-25` → `20260825`.
 *
 * **지역 날짜다.** `toISOString()` 은 UTC 라 한국 시각 오전 9시 전에 만든
 * 리스트가 어제 이름을 달고 나온다.
 */
function today(now: Date) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * 새 리스트를 맨 앞에 만든다. **빈 채로 만들어진다** — 곡은 나중에 담는다.
 *
 * 같은 날 두 번 만들면 이름이 겹치므로 뒤에 번호를 붙인다. 겹친 채로 두면
 * 목록에 같은 이름의 카드가 둘 서서 어느 것에 담았는지 알 수 없다.
 *
 * **상한에 닿으면 `null` 이다.** 부르는 쪽이 안내한다 → `PLAYLIST_LIMIT`
 *
 * `now` 를 인자로 받는다 — 검증 스크립트가 날짜를 고정해서 돌린다.
 */
export function createPlaylist(now = new Date()): Playlist | null {
  const lists = read();
  if (lists.length >= PLAYLIST_LIMIT) return null;

  const createdAt = today(now);
  const base = createdAt.replaceAll("-", "");

  let name = base;
  for (let n = 2; lists.some((list) => list.name === name); n += 1) {
    name = `${base} (${n})`;
  }

  // **시각이 아니라 난수다.** `getTime()` 은 같은 밀리초에 두 번 만들면
  // 겹치고, 겹치면 담기·지우기가 두 리스트를 함께 건드리고 `/library/{id}`
  // 는 앞의 하나만 연다. 이름은 번호로 겹침을 피하는데 id 만 안 그랬다
  const created: Playlist = { id: crypto.randomUUID(), name, createdAt, trackIds: [] };
  save([created, ...lists]);

  return created;
}

/**
 * 이름을 바꾼다. **빈 이름은 안 받는다** — 이름이 사라진 카드는 무엇인지
 * 알 수 없고, 되돌릴 방법도 화면에 없다. 공백만 남긴 것도 같다.
 *
 * 같은 이름이 둘 생기는 것은 막지 않는다. `createPlaylist` 가 번호를 붙이는
 * 것은 **사람이 안 고른 이름**이라서고, 여기는 직접 친 이름이다.
 */
export function renamePlaylist(id: string, name: string) {
  const next = name.trim();
  if (!next) return;

  save(read().map((list) => (list.id === id ? { ...list, name: next } : list)));
}

/**
 * 리스트에 곡을 담거나 뺀다. **같은 버튼이 두 방향을 한다** — 담은 곡을 빼려고
 * 다른 화면까지 가야 하면, 잘못 담은 것 하나가 계속 남는다.
 *
 * 새로 담은 곡이 맨 앞이다. 리스트를 열었을 때 방금 담은 것이 먼저 보여야
 * 담긴 게 맞는지 확인이 된다.
 *
 * 상한은 `TRACK_LIMIT` 이다. 리스트 하나가 저장소를 통째로 먹으면 나머지 리스트가
 * 같이 안 써진다 — 쓰기가 조용히 실패한다(`writeStoredValue`).
 */
export function togglePlaylistTrack(playlistId: string, trackId: string) {
  save(
    read().map((list) => {
      if (list.id !== playlistId) return list;
      const has = list.trackIds.includes(trackId);
      return {
        ...list,
        trackIds: has
          ? list.trackIds.filter((id) => id !== trackId)
          : [trackId, ...list.trackIds].slice(0, TRACK_LIMIT),
      };
    }),
  );
}

/**
 * 고른 곡을 리스트에서 뺀다. **한 번에 한 번만 쓴다** —
 * `togglePlaylistTrack` 을 곡 수만큼 부르면 읽기·쓰기가 그만큼 반복되고,
 * 중간에 한도에 걸려 쓰기가 조용히 실패하면 반쯤 지워진 채로 남는다.
 */
export function removePlaylistTracks(playlistId: string, trackIds: ReadonlySet<string>) {
  save(
    read().map((list) =>
      list.id === playlistId
        ? { ...list, trackIds: list.trackIds.filter((id) => !trackIds.has(id)) }
        : list,
    ),
  );
}

/** 리스트를 지운다. 곡은 카탈로그에 있으므로 곡 자체가 사라지진 않는다 */
export function deletePlaylist(id: string) {
  save(read().filter((list) => list.id !== id));
}

function read() {
  return parsePlaylists(readStoredValue(STORAGE_KEYS.playlists));
}

/**
 * **여기서 자르지 않는다.** 한때 `slice(0, PLAYLIST_LIMIT)` 이 있었는데,
 * 모든 쓰기가 이 함수를 지나므로 저장소에 상한을 넘는 값이 들어 있으면
 * **이름 한 번 바꾸는 것만으로도** 초과분이 잘렸다. 상한은 늘리는 쪽
 * 한 군데에서만 본다 → `createPlaylist`
 */
function save(lists: Playlist[]) {
  writeStoredValue(STORAGE_KEYS.playlists, JSON.stringify(lists));
}
