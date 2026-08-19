"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";

import { currentTrack, usePlayerStore } from "@/lib/use-player-store";
import type { PlayableTrack } from "@/lib/use-player-store";

/**
 * 카드에 도킹하는 위성 재생 버튼.
 *
 * **이 버튼 하나만 클라이언트다.** 추천 목록은 서버 컴포넌트로 두고 여기만
 * 내린다 — 상호작용하는 말단에만 `"use client"` 를 붙이는 규칙 그대로다.
 * → `.claude/rules/structure.md`
 *
 * 누르면 목록 전체가 큐로 들어간다. 한 곡만 재생하고 끝나면 다음 곡을 들으려고
 * 매번 화면으로 돌아와야 한다. 고른 곡이 시작점이고 나머지는 뒤에 붙는다.
 */
export function PlayButton({
  queue,
  index,
  className = "",
}: {
  queue: readonly PlayableTrack[];
  index: number;
  className?: string;
}) {
  const track = queue[index];
  const play = usePlayerStore((state) => state.play);
  // 지금 이 곡이 실제로 나고 있는가. 큐에 담겼지만 멈춰 있으면 재생 아이콘이다.
  const sounding = usePlayerStore(
    (state) => state.isPlaying && currentTrack(state)?.id === track.id,
  );

  const Icon = sounding ? Pause : Play;

  return (
    <button
      type="button"
      onClick={() => play(queue, index)}
      aria-label={`${track.artist} ${track.title} ${sounding ? "일시정지" : "재생"}`}
      className={`grid place-items-center rounded-full bg-white text-ink shadow-lift transition-colors hover:bg-ink hover:text-canvas focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none ${className}`}
    >
      {/* 재생 삼각형은 광학 중심이 기하 중심보다 오른쪽이다. 정지 기호는 대칭이라 안 민다 */}
      <Icon size={17} weight="fill" aria-hidden className={sounding ? "" : "translate-x-px"} />
    </button>
  );
}
