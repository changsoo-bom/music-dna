"use client";

import { TrackRow } from "@/components/common/TrackRow";
import { GENRES, PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { useSavedTrackIds } from "@/hooks/use-playlists";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";
import type { CatalogTrack, Genre, Region } from "@/types/music";

type BrowseGroup = {
  genre: Genre;
  label: string;
  tracks: readonly CatalogTrack[];
};

/**
 * 카탈로그를 상위 장르로 묶는다. **모듈 스코프에서 한 번.**
 *
 * 페이지가 만들어 prop 으로 넘기지 않는다 — 그러면 카탈로그가 두 번 실린다.
 * 이 파일이 `use-player-store` 를 통해 `CATALOG` 를 이미 클라이언트 번들에
 * 갖고 있는데(`radioPick`), RSC 페이로드로 같은 109곡을 또 직렬화하게 된다.
 * 주소에서 오는 것은 **고른 값 두 개**뿐이다.
 *
 * 곡이 없는 상위 장르는 뺀다. "0곡" 헤더만 남는 칸이 생기지 않는다.
 */
const GROUPS: readonly BrowseGroup[] = GENRES.map((genre) => ({
  genre: genre.id,
  label: genre.label,
  tracks: CATALOG.filter((track) => PARENT_OF[track.subGenre] === genre.id),
})).filter((group) => group.tracks.length > 0);

/**
 * 전체보기. 카탈로그를 상위 장르로 묶어 편다.
 *
 * **좁히는 값은 주소에서 온다**(`region` · `genre`). 탭은 링크고 이 화면은
 * 고른 값을 받기만 한다 — 뒤로가기·공유가 공짜로 따라온다
 * → `.claude/rules/state.md` · `BrowseTabs`
 *
 * 두 축은 곱해진다. 국내 힙합처럼 둘 다 고른 화면이 정상이고, 그 교집합이
 * 비면 "여기엔 아직 곡이 없다" 고 말한다 — 빈 목록만 남기면 고장으로 읽힌다.
 *
 * 구독은 둘뿐이다(재생 중인 곡 하나, 보관함 하나). 줄마다 구독하면
 * 100줄이 100번 깨어난다 → `TrackRow`
 */
export function BrowseList({ region, genre }: { region: Region | null; genre: Genre | null }) {
  const play = usePlayerStore((state) => state.play);
  const sounding = usePlayerStore((state) => soundingId(state, "browse"));
  const savedIds = useSavedTrackIds();

  const groups = GROUPS.filter((group) => genre === null || group.genre === genre)
    .map((group) => ({
      ...group,
      tracks: region === null ? group.tracks : group.tracks.filter((t) => t.region === region),
    }))
    .filter((group) => group.tracks.length > 0);

  /**
   * 큐는 **지금 보이는 것 전부다.** 장르별로 끊으면 Pop 마지막 곡에서 재생이
   * 서고, 눈에 보이는 다음 줄과 다음에 나는 곡이 어긋난다. 반대로 안 보이는
   * 곡까지 넣으면 국내만 골라 놓고 틀었는데 해외 곡이 이어진다 — 좁힌 것이
   * 목록에만 걸리고 재생에는 안 걸리는 셈이다.
   *
   * 모듈 스코프에 못 둔다. 고른 값에 따라 달라지는 값이라 화면과 같이 움직여야
   * 한다 — 109곡을 훑는 일이고 탭을 누를 때만 다시 돈다.
   */
  const queue = groups.flatMap((group) => group.tracks).filter(isPlayable);

  if (groups.length === 0) {
    return (
      <p className="mt-16 text-sm text-slate">
        고른 조건에 맞는 곡이 아직 없습니다. 위에서 다른 칸을 눌러 보세요.
      </p>
    );
  }

  return (
    <div className="mt-12 flex flex-col gap-16 max-sm:mt-8 max-sm:gap-12">
      {groups.map((group) => (
        <section key={group.genre}>
          {/* 장르를 하나만 골랐으면 제목이 탭 이름을 그대로 되풀이한다.
              같은 말이 두 번 서면 둘 중 무엇이 화면의 주인인지가 흐려진다 */}
          {genre === null && (
            <h2 className="text-[clamp(22px,2.2vw,28px)] leading-tight">{group.label}</h2>
          )}
          <p className={`text-sm text-slate ${genre === null ? "mt-2" : ""}`}>
            {group.tracks.length}곡
          </p>

          <ul className="mt-6 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {group.tracks.map((track) => (
              <li key={track.id}>
                <TrackRow
                  track={track}
                  isCurrent={sounding === track.id}
                  saved={savedIds.has(track.id)}
                  onPlay={() =>
                    play(
                      "browse",
                      queue,
                      queue.findIndex((item) => item.id === track.id),
                    )
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
