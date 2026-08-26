"use client";

import { TrackRow } from "@/components/common/TrackRow";
import { useSavedTrackIds } from "@/hooks/use-playlists";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";
import type { AnyTrack } from "@/types/music";

/**
 * 검색 결과 목록.
 *
 * **찾은 것을 서버가 넘긴다.** 둘러보기는 카탈로그를 통째로 갖고 있는
 * 클라이언트에게 수만 넘겼는데(`BrowseList`), 여기는 다르다 — 결과가 몇 곡일지
 * 모르고 보통 몇 줄이라, 그 몇 줄을 페이로드에 싣는 편이 좁히는 규칙을 양쪽에
 * 두는 것보다 싸다. 규칙은 `searchTracks` 한 곳에 남는다.
 *
 * **한 열이다.** 검색은 훑어보는 것이 아니라 찾아보는 것이라 위에서 아래로
 * 읽는 편이 빠르다 → `LibraryList`
 *
 * 구독은 둘뿐이다(재생 중인 곡 하나, 보관함 하나). 줄마다 구독하면
 * 스무 줄이 스무 번 깨어난다 → `TrackRow`
 */
export function SearchList({
  tracks,
  queueId = "search",
}: {
  tracks: readonly AnyTrack[];
  /* **목록마다 큐 이름이 다르다.** 카탈로그에서 찾은 것과 YouTube 에서 찾아온
     것이 한 화면에 두 목록으로 서는데, 이름이 같으면 첫 곡이 겹칠 때 한쪽을
     누른 것이 다른 쪽을 멈춘다 → `QueueId` 의 리스트·둘러보기와 같은 이유 */
  queueId?: "search" | "search:remote";
}) {
  // 큐는 **틀 수 있는 곡만**이다. 목록은 찾은 것을 전부 그린다 — 재생 불가를
  // 목록에서까지 빼면 "없다" 고 말하는 셈인데, 있는 곡이다 → `LibraryList`
  const queue = tracks.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 큐가 하나뿐이라 이름을 정확히 맞춰 본다. 아이콘과 행동이 같은 조건에서
  // 갈리도록 아래 `onPlay` 도 같은 이름을 쓴다 → `soundingId`
  const sounding = usePlayerStore((state) => soundingId(state, queueId));
  const savedIds = useSavedTrackIds();

  return (
    <ul className="mt-10 flex flex-col gap-3 max-sm:mt-6">
      {tracks.map((track) => (
        <li key={track.id} className="card-enter">
          <TrackRow
            track={track}
            isCurrent={sounding === track.id}
            saved={savedIds.has(track.id)}
            onPlay={() =>
              play(
                queueId,
                queue,
                queue.findIndex((item) => item.id === track.id),
              )
            }
          />
        </li>
      ))}
    </ul>
  );
}
