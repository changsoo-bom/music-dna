"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePlayed } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CatalogTrack } from "@/types/music";

/**
 * 최근에 튼 곡. 없으면 빈 배열.
 *
 * 재생 상태는 Zustand 가 들고 있는데 이력은 Local Storage 다. 나누는 기준은
 * **새로고침 뒤에도 남아야 하는가** 다 — 지금 무엇을 트는가는 세션의 일이고,
 * 무엇을 들었는가는 그렇지 않다. → `.claude/rules/state.md`
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 빈 목록이다.
 * `usePreference` 와 같은 구조고 같은 대가를 치른다.
 */
export function usePlayedTracks(): CatalogTrack[] {
  return parsePlayed(useStoredValue(STORAGE_KEYS.playlist));
}
