import { readStoredValue, writeStoredValue } from "@/lib/stored-value";
import { PLAYED_LIMIT, parsePlayed } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * 방금 튼 곡을 최근 재생 맨 앞에 놓는다.
 *
 * **이미 맨 앞이면 아무것도 안 한다.** 재생 이벤트는 일시정지를 풀 때마다
 * 다시 오는데, 그때마다 쓰면 같은 값을 저장하고 구독자를 깨운다.
 *
 * 같은 곡을 다시 틀면 앞으로 당겨진다 — 목록이 "최근 순" 이라는 약속이
 * 곡마다 하나씩만 있다는 약속보다 강하다.
 */
export function recordPlayed(trackId: string) {
  const current = parsePlayed(readStoredValue(STORAGE_KEYS.playlist));
  if (current[0]?.id === trackId) return;

  const next = [trackId, ...current.map((track) => track.id).filter((id) => id !== trackId)];
  writeStoredValue(STORAGE_KEYS.playlist, JSON.stringify(next.slice(0, PLAYED_LIMIT)));
}
