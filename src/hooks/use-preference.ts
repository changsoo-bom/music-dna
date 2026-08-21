"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePreference } from "@/lib/schemas/preference";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { MusicPreference } from "@/types/music";

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
  return parsePreference(useStoredValue(STORAGE_KEYS.preference, serverRaw));
}
