/**
 * 진행률. 폭이 아니라 scaleX 로 움직인다 —
 * width 애니메이션은 매 프레임 레이아웃을 다시 잡는다.
 */
export function QuizProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-5">
      <div className="h-[3px] flex-1 rounded-pill bg-ghost">
        <div
          className="h-full origin-left rounded-pill bg-ink transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${current / total})` }}
        />
      </div>
      <p className="text-sm font-medium tabular-nums text-slate">
        <span className="text-ink">{String(current).padStart(2, "0")}</span>
        <span className="mx-1.5">/</span>
        {total}
      </p>
    </div>
  );
}
