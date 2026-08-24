import { readStoredValue, writeStoredValue } from "@/hooks/use-stored-value";
import { parseTrackIds } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * 보관함에 담거나 뺀다. **같은 버튼이 두 방향을 한다** — 담은 곡을 빼려고
 * 다른 화면까지 가야 하면, 잘못 담은 것 하나가 계속 남는다.
 *
 * 최근 재생(`recordPlayed`)과 나누는 기준은 **누가 넣었는가** 다.
 * 저기는 튼 곡이 저절로 쌓이고 오래된 것이 밀려 나가지만, 여기는 사람이
 * 넣은 것이라 지우기 전에는 안 없어진다 — 그래서 개수 제한도 없다.
 * 카탈로그 자체가 상한이다.
 *
 * 새로 담은 곡이 맨 앞이다. 목록을 열었을 때 방금 담은 것이 먼저 보여야
 * 담긴 게 맞는지 확인이 된다.
 */
export function toggleLibrary(trackId: string) {
  const ids = parseTrackIds(readStoredValue(STORAGE_KEYS.library)).map((track) => track.id);
  const next = ids.includes(trackId)
    ? ids.filter((id) => id !== trackId)
    : [trackId, ...ids];

  writeStoredValue(STORAGE_KEYS.library, JSON.stringify(next));
}
