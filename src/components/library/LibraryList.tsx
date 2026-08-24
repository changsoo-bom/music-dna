"use client";

import Link from "next/link";

import { TrackRow } from "@/components/common/TrackRow";
import { useLibrary } from "@/hooks/use-library";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

/**
 * 보관함. 사람이 직접 담은 곡만 있고, 뺄 때까지 남는다.
 *
 * 빠른 선곡과 달리 **한 열이다.** 담은 곡은 훑어보는 것이 아니라 찾아보는
 * 것이라 위에서 아래로 읽는 편이 빠르고, 개수 제한이 없어서 줄 수를 화면
 * 폭으로 미리 정해 둘 수도 없다.
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 빈 목록이다 — 비어 있는
 * 안내가 한 프레임 스칠 수 있다. 홈이 소개 화면에 쓴 것과 같은 대가고,
 * 이 페이지는 그 크기가 한 덩어리뿐이라 그대로 둔다.
 */
export function LibraryList() {
  const saved = useLibrary();
  const queue = saved.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 구독은 하나다. 줄마다 구독하면 줄 수만큼 깨어난다 → `MyPlaylist`
  const sounding = usePlayerStore((state) => soundingId(state, "library"));

  if (queue.length === 0) {
    return (
      <div className="mt-14 grid place-items-center gap-4 rounded-stadium border-2 border-dashed border-hair px-8 py-20 text-center max-sm:mt-10 max-sm:px-6 max-sm:py-14">
        <p className="text-lg font-medium tracking-[-0.01em]">아직 담은 곡이 없습니다.</p>
        <p className="max-w-[38ch] text-sm text-slate">
          곡 옆의 + 를 누르면 여기에 남습니다.{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            추천 보러 가기
          </Link>
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-10 flex flex-col gap-3 max-sm:mt-6">
      {queue.map((track, index) => (
        <li key={track.id} className="card-enter">
          <TrackRow
            track={track}
            isCurrent={sounding === track.id}
            onPlay={() => play("library", queue, index)}
          />
        </li>
      ))}
    </ul>
  );
}
