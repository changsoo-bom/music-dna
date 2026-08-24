"use client";

import { TrackRow } from "@/components/common/TrackRow";
import { useLibrary } from "@/hooks/use-library";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";
import type { CatalogTrack, Genre } from "@/types/music";

export type BrowseGroup = {
  genre: Genre;
  label: string;
  tracks: readonly CatalogTrack[];
};

/**
 * 전체보기. 카탈로그를 상위 장르로 묶어 통째로 편다.
 *
 * **필터도 탭도 없다.** 지금 카탈로그는 109곡이고, 다섯 덩어리로 접히면
 * 스크롤 한 번에 끝난다. 곡이 몇 백으로 늘어 이 화면이 길어지면 그때
 * 장르를 `searchParams` 로 받는다 — 뒤로가기와 공유가 공짜로 따라온다
 * → `.claude/rules/state.md`
 *
 * **큐는 화면 전체다.** 장르별로 큐를 끊으면 Pop 마지막 곡에서 재생이 서고,
 * 눈에 보이는 다음 줄과 다음에 나는 곡이 어긋난다.
 *
 * 구독은 둘뿐이다(재생 중인 곡 하나, 보관함 하나). 줄마다 구독하면
 * 100줄이 100번 깨어난다 → `TrackRow`
 */
export function BrowseList({ groups }: { groups: readonly BrowseGroup[] }) {
  const play = usePlayerStore((state) => state.play);
  const sounding = usePlayerStore((state) => soundingId(state, "browse"));
  const savedIds = new Set(useLibrary().map((track) => track.id));
  const queue = groups.flatMap((group) => group.tracks).filter(isPlayable);

  return (
    <div className="flex flex-col gap-16 max-sm:gap-12">
      {groups.map((group) => (
        <section key={group.genre}>
          <h2 className="text-[clamp(22px,2.2vw,28px)] leading-tight">{group.label}</h2>
          <p className="mt-2 text-sm text-slate">{group.tracks.length}곡</p>

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
