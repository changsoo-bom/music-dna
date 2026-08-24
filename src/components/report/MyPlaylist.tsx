"use client";

import { TrackRow } from "@/components/common/TrackRow";
import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

/**
 * 최근에 튼 곡. **곡을 재생하면 저절로 여기 쌓인다.**
 *
 * 담는 버튼은 이 목록을 만드는 버튼이 아니다 — 들은 것이 곧 여기 쌓이는
 * 것이고, 줄 오른쪽의 + 는 그 곡을 **보관함**으로 옮겨 적는다. 밀려 나가는
 * 목록과 남는 목록을 사람이 직접 가르는 자리다(`PLAYED_LIMIT` 을 넘으면
 * 오래된 것부터 빠진다).
 *
 * 추천은 큰 원 격자, 여기는 **작은 원 + 옆으로 붙은 글자**다.
 * 줄 자체의 생김새와 그 이유는 → `@/components/common/TrackRow`
 */
export function MyPlaylist() {
  const played = usePlayedTracks();
  const queue = played.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 이 목록에서 나고 있는 곡. 추천에서 튼 같은 곡은 여기서 재생 아이콘이다 —
  // 눌렀을 때 멈추는 게 아니라 이 목록으로 옮겨 타기 때문이다.
  //
  // 구독은 하나다. 줄마다 `isSounding` 을 구독하면 아홉 줄이 아홉 번 깨어난다.
  // 판정은 같은 함수에서 나온다. → `soundingId`
  const sounding = usePlayerStore((state) => soundingId(state, "played"));

  if (queue.length === 0) {
    return (
      <div className="mt-14 grid place-items-center gap-4 rounded-stadium border-2 border-dashed border-hair px-8 py-20 text-center max-sm:mt-10 max-sm:px-6 max-sm:py-14">
        <p className="text-lg font-medium tracking-[-0.01em]">
          새로운 플레이리스트를 추가해보세요!
        </p>
        <p className="max-w-[38ch] text-sm text-slate">아래에서 곡을 재생하면 여기에 쌓입니다.</p>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:mt-6 max-sm:grid-cols-1">
      {queue.map((track, index) => (
        // `card-enter` 는 **마운트될 때 한 번만** 걸린다. `key` 가 곡 id 라
        // 이미 있던 줄은 DOM 이 그대로 살아 있으므로, 방금 튼 곡이 맨 앞에
        // 들어오면 그 줄만 올라온다.
        //
        // 시차(animation-delay)는 주지 않는다. 곡이 앞에 끼어들면 뒤 줄들의
        // index 가 한 칸씩 밀리는데, 인라인 delay 를 index 로 계산하면 그 값이
        // 바뀌면서 **이미 끝난 애니메이션이 다시 돈다.** 추천 목록은 판이 통째로
        // 갈려서 그 문제가 없지만 여기는 한 줄씩 들어온다.
        <li key={track.id} className="card-enter">
          <TrackRow
            track={track}
            isCurrent={sounding === track.id}
            onPlay={() => play("played", queue, index)}
          />
        </li>
      ))}
    </ul>
  );
}
