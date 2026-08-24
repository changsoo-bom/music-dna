import { z } from "zod";

import { CATALOG } from "@/data/catalog";
import type { CatalogTrack } from "@/types/music";

/**
 * 최근 재생 몇 곡까지 남길지.
 *
 * **3열 × 3줄.** "빠른 선곡" 이라 목록이 길면 빠르지 않고, 세 줄을 넘어가면
 * 아래 섹션이 화면 밖으로 밀린다. 넘치는 곡은 오래된 것부터 빠진다.
 *
 * 줄 수를 CSS 로 자르지 않고 개수로 막는다 — `overflow: hidden` 으로
 * 가리면 값은 저장돼 있는데 화면에만 없는 상태가 되고, 좁은 화면에서
 * 열이 줄면 무엇이 잘렸는지 아무도 모른다.
 */
export const PLAYED_LIMIT = 9;

/** 저장된 것은 곡 id 뿐이다. 제목·아티스트는 카탈로그가 갖고 있다 */
const storedSchema = z.array(z.string());

/** id → 곡. 모듈 로드 때 한 번 만든다 */
const BY_ID = new Map(CATALOG.map((track) => [track.id, track]));

/**
 * 저장된 최근 재생 목록을 읽는다. **Local Storage 는 신뢰 경계 밖이다.**
 *
 * id 만 저장하는 것이 검증을 겸한다 — 카탈로그에 없는 id 는 그냥 빠진다.
 * 곡 정보를 통째로 저장했다면 제목이 바뀌었을 때 옛 제목이 화면에 남고,
 * 손댄 값이 그대로 렌더된다.
 *
 * 형식이 깨졌으면 빈 목록이다. 재생 이력은 없어도 되는 값이라
 * 여기서 화면을 세울 이유가 없다.
 *
 * **중복을 거른다.** 쓰기 경로(`recordPlayed`)는 같은 곡을 두 번 안 넣지만
 * 여기 오는 값은 사람이 고칠 수 있다. `["t001","t001"]` 을 통과시키면 목록에
 * 같은 곡이 두 줄 생기고, `MyPlaylist` 의 `key={track.id}` 가 **중복 key** 가
 * 된다 — React 가 어느 줄이 어느 것인지 못 짝지어서 재생 표시가 엉뚱한 줄에
 * 붙는다. "id 만 저장하는 것이 검증을 겸한다" 는 이 파일의 약속에 난 구멍이었다.
 *
 * 조회는 색인으로 한다. `CATALOG.find` 를 id 마다 부르면 입력 길이 × 카탈로그
 * 크기만큼 도는데, **입력 길이는 우리가 정하는 값이 아니다.** 자르기 전에
 * 찾아야 없는 id 가 자리를 안 먹으므로, 자르는 순서 대신 조회를 싸게 만든다.
 */
export function parsePlayed(raw: string | null): CatalogTrack[] {
  return parseTrackIds(raw, PLAYED_LIMIT);
}

/**
 * 저장된 곡 id 목록을 곡으로 바꾼다. 보관함도 같은 형식이라 여기를 같이 쓴다 —
 * 저장하는 것이 id 배열인 이상 검증도 자르기도 다를 이유가 없고, 다른 점은
 * **몇 개까지 남기느냐** 뿐이라 그것만 인자로 받는다.
 */
export function parseTrackIds(raw: string | null, limit = Number.POSITIVE_INFINITY): CatalogTrack[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const ids = storedSchema.safeParse(parsed);
  if (!ids.success) return [];

  return [...new Set(ids.data)]
    .map((id) => BY_ID.get(id))
    .filter((track): track is CatalogTrack => track !== undefined)
    .slice(0, limit);
}
