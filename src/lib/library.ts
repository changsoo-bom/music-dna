import { parseRawIds } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { readStoredValue, writeStoredValue } from "@/lib/stored-value";

/**
 * 보관함에 몇 곡까지 남길지.
 *
 * **상한이 없으면 안 된다.** 브라우저 저장소는 오리진당 한도가 있고, 여기는
 * 사람이 지우기 전에는 안 없어지는 목록이다. 카탈로그 크기(지금 109곡, 목표
 * 300곡)를 넉넉히 넘는 값이라 정상적으로 쓰는 사람은 이 벽에 안 닿는다.
 *
 * 한때는 저장할 때 카탈로그로 걸러서 카탈로그 자체가 상한 노릇을 했는데,
 * 그 방식이 곡 목록이 바뀔 때 남의 보관함을 지웠다 → `parseRawIds`
 */
export const LIBRARY_LIMIT = 500;

/**
 * 보관함에 담거나 뺀다. **같은 버튼이 두 방향을 한다** — 담은 곡을 빼려고
 * 다른 화면까지 가야 하면, 잘못 담은 것 하나가 계속 남는다.
 *
 * 최근 재생(`recordPlayed`)과 나누는 기준은 **누가 넣었는가** 다.
 * 저기는 튼 곡이 저절로 쌓이고 오래된 것이 밀려 나가지만, 여기는 사람이
 * 넣은 것이라 지우기 전에는 안 없어진다.
 *
 * 새로 담은 곡이 맨 앞이다. 목록을 열었을 때 방금 담은 것이 먼저 보여야
 * 담긴 게 맞는지 확인이 된다.
 *
 * **읽을 때 `parseRawIds` 다.** 카탈로그로 거른 결과를 다시 저장하면 지금
 * 목록에 없는 id 가 클릭 한 번에 사라진다. 저장된 값은 저장된 대로 두고,
 * 화면에 뭘 그릴지는 읽는 쪽이 정한다.
 */
export function toggleLibrary(trackId: string) {
  const ids = parseRawIds(readStoredValue(STORAGE_KEYS.library));
  const next = ids.includes(trackId)
    ? ids.filter((id) => id !== trackId)
    : [trackId, ...ids].slice(0, LIBRARY_LIMIT);

  writeStoredValue(STORAGE_KEYS.library, JSON.stringify(next));
}
