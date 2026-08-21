"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePreference } from "@/lib/schemas/preference";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { MusicPreference } from "@/types/music";

/**
 * 마지막으로 파싱한 문자열과 그 결과.
 *
 * `parsePreference` 는 순수 함수지만 **렌더마다 새 객체를 만든다** —
 * `JSON.parse` + Zod + `computePreference` 를 다시 돌기 때문이다. 그러면
 * New Search 를 누를 때마다 `Verdict` 과 `RetakeCta` 가 새 prop 을 받고,
 * 값이 하나도 안 바뀌었는데도 아래 트리가 통째로 다시 그려진다.
 * `RadarChart` 가 배열을 문자열로 join 해서 의존성을 붙드는 코드를 이미
 * 갖고 있는데, **그게 이 문제를 우회하려던 것이다.** 우회를 늘리지 말고
 * 여기서 끊는다.
 *
 * `useMemo` 가 아니라 모듈 스코프 캐시다. 훅 하나에 값 하나뿐이고
 * (`STORAGE_KEYS.preference`), 이 값을 보는 컴포넌트가 여럿이라
 * **모두가 같은 객체를 봐야** 신원이 실제로 안정된다.
 */
let cachedRaw: string | null = null;
let cachedResult: MusicPreference | null = null;

function parseOnce(raw: string | null): MusicPreference | null {
  if (raw === cachedRaw) return cachedResult;
  cachedRaw = raw;
  cachedResult = parsePreference(raw);
  return cachedResult;
}

/**
 * 저장된 성향 검사 결과. 없거나 깨졌으면 `null`.
 *
 * `serverRaw` 는 서버가 쿠키에서 읽어 넘긴 같은 문자열이다. 넘어오면 **서버가
 * 그린 첫 HTML 에 이미 결과가 들어 있고**, 하이드레이션이 같은 값을 그려서
 * 화면이 안 바뀐다. 안 넘어오면(쿠키가 없거나 이 앱을 쓰기 전부터 Local
 * Storage 만 갖고 있던 브라우저) 예전처럼 하이드레이션 직후에 나타난다.
 *
 * 검증은 어느 쪽이든 똑같이 한 번 더 돈다. 쿠키도 사용자가 고칠 수 있는
 * 값이라 서버에서 통과한 것이 클라이언트에서 면제되지 않는다.
 */
export function usePreference(serverRaw: string | null = null): MusicPreference | null {
  return parseOnce(useStoredValue(STORAGE_KEYS.preference, serverRaw));
}
