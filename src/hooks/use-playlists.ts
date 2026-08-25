"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { Playlist } from "@/types/music";

/**
 * 사람이 만든 리스트. 없으면 빈 배열.
 *
 * `useLibrary` 와 같은 구조고 같은 대가를 치른다 — 서버는 Local Storage 를
 * 못 보므로 첫 렌더는 항상 빈 목록이다.
 */
export function usePlaylists(): Playlist[] {
  return parsePlaylists(useStoredValue(STORAGE_KEYS.playlists));
}

/**
 * 어느 리스트엔가 담긴 곡 id. **`+` 가 체크로 바뀌는 기준이다.**
 *
 * 곡 줄은 어느 리스트에 담겼는지까지는 말하지 않는다 — 줄 오른쪽 끝의
 * 아이콘 하나가 리스트 이름을 셋씩 이고 있을 수는 없고, 그건 열어 보면
 * 알 수 있다 → `PlaylistPickerPop`
 *
 * **부모가 한 번 부르고 줄마다 내려준다.** 줄에서 부르면 아홉 줄이면
 * 구독이 아홉 개고, 한 번 담을 때마다 아홉 번의 `JSON.parse` 가 돈다.
 */
export function useSavedTrackIds(): ReadonlySet<string> {
  return new Set(usePlaylists().flatMap((list) => list.trackIds));
}
