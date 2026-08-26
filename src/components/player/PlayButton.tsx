"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";

import { isSounding, usePlayerStore } from "@/lib/use-player-store";
import type { PlayableTrack, QueueId } from "@/lib/use-player-store";

/**
 * 카드에 도킹하는 위성 재생 버튼.
 *
 * 누르면 목록 전체가 큐로 들어간다. 한 곡만 재생하고 끝나면 다음 곡을 들으려고
 * 매번 화면으로 돌아와야 한다. 고른 곡이 시작점이고 나머지는 뒤에 붙는다.
 *
 * `queueId` 를 받는 이유는 **어느 목록에서 눌렀는지가 토글 판정에 필요해서**다.
 * 같은 곡이 추천과 빠른 선곡에 다 있을 때, 다른 목록에서 누른 것은 일시정지가
 * 아니라 "이 목록을 틀어 줘" 다. → `src/lib/use-player-store.ts`
 */
export function PlayButton({
  queueId,
  queue,
  index,
  className = "",
}: {
  queueId: QueueId;
  queue: readonly PlayableTrack[];
  index: number;
  className?: string;
}) {
  const track = queue[index];
  const play = usePlayerStore((state) => state.play);
  // 지금 이 곡이, 이 목록에서 나고 있는가. 큐에 담겼지만 멈춰 있으면 재생 아이콘이다.
  const sounding = usePlayerStore((state) => isSounding(state, queueId, track.id));

  const Icon = sounding ? Pause : Play;

  return (
    <button
      type="button"
      onClick={() => play(queueId, queue, index)}
      aria-label={`${track.artist} ${track.title} ${sounding ? "일시정지" : "재생"}`}
      className={`grid place-items-center rounded-full bg-white text-ink shadow-float transition-colors hover:bg-ink hover:text-canvas focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none ${className}`}
    >
      {/* 그림자는 `shadow-float`. 사진 가장자리에 겹치면 `shadow-lift` 의 4% 는
          아예 안 보여서 버튼이 커버에 파묻힌다. 테두리를 두르는 대신 그림자를
          올렸다 — 시스템에 그림자는 둘뿐이고 그중 진한 쪽이다.

          재생 삼각형을 따로 밀지 않는다. Phosphor 의 `Play`(fill)는 잉크가 박스 안에서
          이미 오른쪽에 그려져 있다 — 삼각형 무게중심이 박스 중심에 오도록 한 것이라,
          여기서 더 밀면 원 안에서 오른쪽으로 붙는다 */}
      <Icon size={17} weight="fill" aria-hidden />
    </button>
  );
}
