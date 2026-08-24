"use client";

import { useStoredValue } from "@/hooks/use-stored-value";
import { parseTrackIds } from "@/lib/schemas/played";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import type { CatalogTrack } from "@/types/music";

/**
 * 보관함에 담은 곡. 없으면 빈 배열.
 *
 * `usePlayedTracks` 와 같은 구조고 같은 대가를 치른다 — 서버는 Local Storage
 * 를 못 보므로 첫 렌더는 항상 빈 목록이다.
 */
export function useLibrary(): CatalogTrack[] {
  return parseTrackIds(useStoredValue(STORAGE_KEYS.library));
}
