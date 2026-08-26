"use client";

import { SpeakerHigh, SpeakerLow, SpeakerX } from "@phosphor-icons/react/dist/ssr";
import type { CSSProperties } from "react";

import { usePlayerStore } from "@/lib/use-player-store";

/**
 * 소리 조절. 바와 전체 화면이 같은 것을 쓴다.
 *
 * 값은 스토어에 있다 — 두 자리가 같은 소리를 말해야 해서고, 그래서 이
 * 컴포넌트는 넘겨받을 것이 없다. → `src/lib/use-player-store.ts`
 *
 * **좁은 화면에서 감추는 건 쓰는 쪽이 정한다.** 모바일 브라우저는
 * `setVolume` 을 무시하고 기기 볼륨만 먹으므로, 눌러도 아무 일이 안 나는
 * 조작을 놓아 두면 고장 난 것으로 보인다. 그 판단은 놓인 자리마다 다르다.
 */
export function VolumeControl({
  /** 바에 놓을 때. 옆 조작이 40px 이라 거기 맞추고, 배경이 흰 필이다 */
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMuted = usePlayerStore((s) => s.toggleMuted);

  const label = muted ? "음소거 해제" : "음소거";

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={toggleMuted}
        aria-label={label}
        data-hint={label}
        className={`grid place-items-center rounded-full text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none ${
          compact
            ? "h-10 w-10 focus-visible:ring-offset-white"
            : "h-12 w-12 focus-visible:ring-offset-canvas"
        }`}
      >
        {/* 아이콘이 값을 말한다. 음소거와 0 은 같은 결과라 같은 그림이다 */}
        {muted || volume === 0 ? (
          <SpeakerX size={compact ? 18 : 22} aria-hidden />
        ) : volume < 50 ? (
          <SpeakerLow size={compact ? 18 : 22} aria-hidden />
        ) : (
          <SpeakerHigh size={compact ? 18 : 22} aria-hidden />
        )}
      </button>

      {/* **음소거면 손잡이가 0 으로 간다.** 조작 하나가 두 값을 가리키면
          안 된다 — 소리가 안 나는데 손잡이가 오른쪽에 있으면 화면이 사실과
          다른 말을 한다. 풀면 `volume` 이 그대로라 있던 자리로 돌아온다. */}
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        onChange={(event) => setVolume(event.currentTarget.valueAsNumber)}
        aria-label="소리 크기"
        className={`volume ${compact ? "w-20" : "w-28"}`}
        style={{ "--pct": muted ? 0 : volume } as CSSProperties}
      />
    </div>
  );
}
