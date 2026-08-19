"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePreference } from "@/lib/schemas/preference";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { MusicPreference } from "@/types/music";

/**
 * 저장된 성향 검사 결과. 없거나 깨졌으면 `null`.
 *
 * 서버는 Local Storage 를 못 보므로 **첫 렌더는 항상 `null`** 이고
 * 하이드레이션 직후 실제 값으로 넘어간다. 화면이 한 번 바뀌는 건 이 구조의
 * 대가다 — 서버 계정을 두지 않기로 한 결정에서 따라온다. → 데이터-저장
 */
export function usePreference(): MusicPreference | null {
  return parsePreference(useStoredValue(STORAGE_KEYS.preference));
}
