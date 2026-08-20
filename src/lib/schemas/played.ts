import { z } from "zod";

import { CATALOG } from "@/data/catalog";
import type { CatalogTrack } from "@/types/music";

/**
 * 최근 재생 몇 곡까지 남길지.
 *
 * "빠른 선곡" 이라 목록이 길면 빠르지 않고, **여섯 곡이 한 줄에 딱 떨어진다** —
 * 6열 격자에서 셀이 186px 이고 그게 썸네일 원본(320×180)을 정사각으로 자른
 * 180px 과 거의 같다. 이보다 크게 그리면 늘려서 뭉갠다.
 */
export const PLAYED_LIMIT = 6;

/** 저장된 것은 곡 id 뿐이다. 제목·아티스트는 카탈로그가 갖고 있다 */
const storedSchema = z.array(z.string());

/**
 * 저장된 최근 재생 목록을 읽는다. **Local Storage 는 신뢰 경계 밖이다.**
 *
 * id 만 저장하는 것이 검증을 겸한다 — 카탈로그에 없는 id 는 그냥 빠진다.
 * 곡 정보를 통째로 저장했다면 제목이 바뀌었을 때 옛 제목이 화면에 남고,
 * 손댄 값이 그대로 렌더된다.
 *
 * 형식이 깨졌으면 빈 목록이다. 재생 이력은 없어도 되는 값이라
 * 여기서 화면을 세울 이유가 없다.
 */
export function parsePlayed(raw: string | null): CatalogTrack[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const ids = storedSchema.safeParse(parsed);
  if (!ids.success) return [];

  return ids.data
    .map((id) => CATALOG.find((track) => track.id === id))
    .filter((track): track is CatalogTrack => track !== undefined)
    .slice(0, PLAYED_LIMIT);
}
