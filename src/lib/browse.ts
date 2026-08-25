import { GENRES, PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import type { CatalogTrack, Genre, Region } from "@/types/music";

export type BrowseGroup = {
  genre: Genre;
  label: string;
  tracks: readonly CatalogTrack[];
};

/**
 * 카탈로그를 상위 장르로 묶는다. **모듈 스코프에서 한 번.**
 *
 * 곡이 없는 상위 장르는 여기서 안 뺀다 — 그 판단은 좁힌 뒤에 한다.
 */
const GROUPS: readonly BrowseGroup[] = GENRES.map((genre) => ({
  genre: genre.id,
  label: genre.label,
  tracks: CATALOG.filter((track) => PARENT_OF[track.subGenre] === genre.id),
}));

/**
 * 고른 두 값으로 좁힌 목록. **좁히는 규칙이 사는 곳이 하나다.**
 *
 * 머리글의 곡 수(서버)와 실제 목록(클라이언트)이 각자 세면 언젠가 어긋난다 —
 * 화면 맨 위가 "35곡" 인데 세어 보면 34곡인 종류의 어긋남은 아무도 안 고친다.
 *
 * 빈 칸은 떨어뜨린다. "0곡" 헤더만 남는 자리가 생기지 않는다.
 */
export function browseGroups(region: Region | null, genre: Genre | null): BrowseGroup[] {
  return GROUPS.filter((group) => genre === null || group.genre === genre)
    .map((group) => ({
      ...group,
      tracks:
        region === null ? group.tracks : group.tracks.filter((track) => track.region === region),
    }))
    .filter((group) => group.tracks.length > 0);
}

/**
 * 좁힌 값을 담은 주소. **두 축이 서로를 안 지운다** — 장르를 고를 때 지역이
 * 풀리면, 좁히려고 누른 것이 넓히는 결과가 된다.
 *
 * 넘기지 않은 축은 지금 값을 그대로 물고 간다. `null` 은 "이 축을 푼다" 다.
 */
export function browseHref(
  current: { region: Region | null; genre: Genre | null },
  next: { region?: Region | null; genre?: Genre | null },
): string {
  const params = new URLSearchParams();
  const region = next.region === undefined ? current.region : next.region;
  const genre = next.genre === undefined ? current.genre : next.genre;

  if (region) params.set("region", region);
  if (genre) params.set("genre", genre);

  // 아무것도 안 고르면 맨 주소다. `?` 만 남은 주소는 같은 화면의 다른 이름이 된다
  const query = params.toString();
  return query ? `/browse?${query}` : "/browse";
}
