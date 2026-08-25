import { readStoredValue, writeStoredValue } from "@/lib/stored-value";
import { PLAYED_LIMIT, parseRawIds } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * 방금 튼 곡을 최근 재생 맨 앞에 놓는다.
 *
 * **이미 맨 앞이면 아무것도 안 한다.** 재생 이벤트는 일시정지를 풀 때마다
 * 다시 오는데, 그때마다 쓰면 같은 값을 저장하고 구독자를 깨운다.
 *
 * 같은 곡을 다시 틀면 앞으로 당겨진다 — 목록이 "최근 순" 이라는 약속이
 * 곡마다 하나씩만 있다는 약속보다 강하다.
 *
 * **읽을 때 `parseRawIds` 다.** 한때 `parsePlayed` 로 읽어 그 결과를 되썼는데,
 * 저쪽은 카탈로그로 한 번 거른 값이라 **지금 카탈로그가 모르는 id 가 곡 한
 * 번 틀 때마다 영구 삭제됐다.** 카탈로그는 배치로 채워지는 중이고 없는 id 는
 * "틀린 값" 이 아니라 "아직 안 들어온 값" 이다. 저장된 값은 저장된 대로 두고,
 * 화면에 뭘 그릴지는 읽는 쪽이 정한다 → `parseRawIds` 에 같은 말이 적혀 있다.
 */
export function recordPlayed(trackId: string) {
  const current = parseRawIds(readStoredValue(STORAGE_KEYS.playlist));
  if (current[0] === trackId) return;

  const next = [trackId, ...current.filter((id) => id !== trackId)];
  writeStoredValue(STORAGE_KEYS.playlist, JSON.stringify(next.slice(0, PLAYED_LIMIT)));
}
