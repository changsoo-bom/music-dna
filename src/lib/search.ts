import { CATALOG } from "@/data/catalog";
import type { CatalogTrack } from "@/types/music";

/**
 * 검색어와 곡 이름을 **같은 모양으로 눕힌다.** 대소문자와 공백을 지운다.
 *
 * 공백까지 지우는 이유는 표기가 하나뿐이어서다 — `new jeans` 로 치는 사람과
 * `newjeans` 로 치는 사람이 같은 곡을 찾는데 카탈로그에는 한 가지로만 적혀
 * 있다. `아이 유` 와 `아이유` 도 같다. 대신 공백이 뜻을 가르는 이름은 못
 * 가르는데, 그런 이름이 이 카탈로그에 없다.
 */
function fold(value: string) {
  return value.toLowerCase().replaceAll(/\s+/g, "");
}

/**
 * 얼마나 앞에 놓을 것인가. **작을수록 앞이고 3 은 "안 맞음" 이다.**
 *
 * 제목이 아티스트보다 먼저다. `Bags` 를 친 사람은 그 곡을 찾는 것이지 제목에
 * `bags` 가 섞인 다른 곡을 찾는 게 아니다. 시작이 포함보다 먼저인 것도 같은
 * 이유다 — 친 그대로인 곡이 아래에 있으면 검색이 고장 난 것처럼 보인다.
 */
function rankOf(track: CatalogTrack, folded: string): number {
  const title = fold(track.title);
  const artist = fold(track.artist);

  if (title.startsWith(folded)) return 0;
  if (artist.startsWith(folded)) return 1;
  if (title.includes(folded) || artist.includes(folded)) return 2;
  return 3;
}

/**
 * 곡 이름과 아티스트로 카탈로그를 찾는다.
 *
 * **좁히는 규칙이 사는 곳은 하나다.** 머리글의 곡 수(서버)와 목록(클라이언트)이
 * 각자 세면 언젠가 어긋난다 — 화면 맨 위가 "12곡" 인데 세어 보면 11곡인
 * 종류의 어긋남은 아무도 안 고친다 → `browseGroups`
 *
 * **빈 검색어는 빈 결과다.** 전부 돌려주면 `/search` 가 카탈로그 전체를 그리는
 * 두 번째 둘러보기가 된다. 그 화면은 이미 있고 거기엔 색인과 필터가 붙어
 * 있다 — 여기는 찾을 것이 있어서 온 사람의 자리다.
 *
 * 지역이나 장르로 좁히지 않는다. 검색은 축이 하나여야 결과를 믿을 수 있다.
 * 좁히는 일은 둘러보기가 한다.
 */
export function searchTracks(query: string): CatalogTrack[] {
  const folded = fold(query);
  if (!folded) return [];

  return CATALOG.map((track) => ({ track, rank: rankOf(track, folded) }))
    .filter((hit) => hit.rank < 3)
    // 동점은 카탈로그 순서 그대로다. `sort` 가 안정 정렬이라 손댈 것이 없다
    .sort((a, b) => a.rank - b.rank)
    .map((hit) => hit.track);
}
