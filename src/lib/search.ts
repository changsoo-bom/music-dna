import { CATALOG } from "@/data/catalog";
import type { CatalogTrack } from "@/types/music";

/**
 * 검색어와 곡 이름을 **같은 모양으로 눕힌다.** 대소문자와 공백을 지운다.
 *
 * 공백까지 지우는 이유는 표기가 하나뿐이어서다 — `new jeans` 로 치는 사람과
 * `newjeans` 로 치는 사람이 같은 곡을 찾는데 카탈로그에는 한 가지로만 적혀
 * 있다. `아이 유` 와 `아이유` 도 같다. 대신 공백이 뜻을 가르는 이름은 못
 * 가르는데, 그런 이름이 이 카탈로그에 없다.
 *
 * **`export` 인 이유는 검사 스크립트가 이 규칙을 복제하지 않고 그대로 쓰기
 * 위해서다.** 같은 식을 스크립트에 손으로 다시 적으면, 여기에 구두점 제거가
 * 추가되는 날 단언은 초록인데 화면은 한쪽 표기의 곡을 통째로 남의 곡으로
 * 민다 — 그 시나리오가 그 단언의 존재 이유다 → `scripts/check-catalog.ts`
 */
export function fold(value: string) {
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
/**
 * 친 말이 **카탈로그에 있는 가수 이름인가.** 맞으면 그 가수와 그 사람의 곡
 * 전부를 돌려준다.
 *
 * `searchTracks` 와 따로 있는 이유는 **묻는 것이 다르기 때문이다** — 저기는
 * "이 말이 든 곡" 을 찾고 여기는 "이 말이 사람인가" 를 묻는다. 사람이면 화면
 * 맨 위가 곡 목록의 머리글이 아니라 그 사람이 된다.
 *
 * **후보가 둘 이상이면 판정하지 않는다.** `이` 를 치면 이문세·이하이·이적이
 * 다 걸리는데, 그중 하나를 골라 세우면 나머지 둘을 찾던 사람에게 엉뚱한
 * 사람의 화면이 뜬다. 애매하면 그냥 곡 목록이다 — `classify` 가 밖에서 하는
 * 판정과 같은 태도다.
 *
 * 곡 목록이 아니라 **카탈로그 전체에서 다시 고른다.** 검색 결과에는 제목이
 * 맞아 걸린 남의 곡도 섞여 있고, 반대로 이 사람의 곡은 전부 걸려 있다 —
 * 어느 쪽이든 "이 가수의 곡" 은 카탈로그가 답이다.
 */
export function catalogArtist(query: string): { name: string; tracks: CatalogTrack[] } | null {
  const folded = fold(query);
  if (!folded) return null;

  // 이름이 검색어로 시작하는 가수들. 키를 눕힌 이름으로 잡아 `NewJeans` 와
  // `new jeans` 가 두 사람이 되지 않게 한다
  const names = new Map<string, string>();
  for (const track of CATALOG) {
    if (fold(track.artist).startsWith(folded)) names.set(fold(track.artist), track.artist);
  }
  // **이름을 그대로 친 사람은 언제나 그 사람이다.** `경서` 와 `경서예지` 처럼
  // 한쪽이 다른 쪽으로 시작하는 이름이 있는데, 후보 수만 세면 이름을 정확히
  // 친 사람이 애매하다는 이유로 그냥 목록을 본다
  const name = names.get(folded) ?? (names.size === 1 ? [...names.values()][0] : null);
  if (!name) return null;

  return { name, tracks: CATALOG.filter((track) => track.artist === name) };
}

export function searchTracks(query: string): CatalogTrack[] {
  const folded = fold(query);
  if (!folded) return [];

  return CATALOG.map((track) => ({ track, rank: rankOf(track, folded) }))
    .filter((hit) => hit.rank < 3)
    // 동점은 카탈로그 순서 그대로다. `sort` 가 안정 정렬이라 손댈 것이 없다
    .sort((a, b) => a.rank - b.rank)
    .map((hit) => hit.track);
}
