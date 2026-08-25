import { LIBRARY_LIMIT } from "@/lib/library";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { readStoredValue, writeStoredValue } from "@/lib/stored-value";
import type { Playlist } from "@/types/music";

/**
 * 리스트를 몇 개까지 만들 수 있는지. 보관함과 같은 이유의 상한이다
 * → `LIBRARY_LIMIT`. 새 리스트는 이름이 날짜라 하루에 여러 개 만드는
 * 사람이 있고, 저장소 한도에 먼저 닿게 둘 이유가 없다.
 */
export const PLAYLIST_LIMIT = 50;

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
 * `now` 를 인자로 받는다 — 검증 스크립트가 날짜를 고정해서 돌린다.
 */
export function createPlaylist(now = new Date()): Playlist {
  const lists = read();
  const createdAt = today(now);
  const base = createdAt.replaceAll("-", "");

  let name = base;
  for (let n = 2; lists.some((list) => list.name === name); n += 1) {
    name = `${base} (${n})`;
  }

  const created: Playlist = { id: String(now.getTime()), name, createdAt, trackIds: [] };
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
 * 리스트에 곡을 담거나 뺀다. **같은 버튼이 두 방향을 한다** → `toggleLibrary`
 *
 * 새로 담은 곡이 맨 앞이다. 리스트를 열었을 때 방금 담은 것이 먼저 보여야
 * 담긴 게 맞는지 확인이 된다.
 *
 * 상한은 보관함과 같다. 리스트 하나가 저장소를 통째로 먹으면 나머지 리스트가
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
          : [trackId, ...list.trackIds].slice(0, LIBRARY_LIMIT),
      };
    }),
  );
}

/** 리스트를 지운다. 담긴 곡은 보관함이 따로 갖고 있으므로 곡이 사라지진 않는다 */
export function deletePlaylist(id: string) {
  save(read().filter((list) => list.id !== id));
}

function read() {
  return parsePlaylists(readStoredValue(STORAGE_KEYS.playlists));
}

function save(lists: Playlist[]) {
  writeStoredValue(STORAGE_KEYS.playlists, JSON.stringify(lists.slice(0, PLAYLIST_LIMIT)));
}
