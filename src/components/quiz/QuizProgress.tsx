/**
 * 진행률. 폭이 아니라 scaleX 로 움직인다 —
 * width 애니메이션은 매 프레임 레이아웃을 다시 잡는다.
 *
 * 숫자가 span 세 개로 쪼개져 있어서 그대로 두면 "영 일 슬래시 오" 로 읽히고
 * 진행 표시라는 의미가 안 간다. 바깥에 `progressbar` 를 씌우고 안쪽은 숨긴다.
 */
export function QuizProgress({ current, total }: { current: number; total: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuetext={`${total}문항 중 ${current}번째`}
      aria-label="검사 진행률"
      className="flex items-center gap-5"
    >
      <div className="h-[3px] flex-1 rounded-pill bg-ghost">
        <div
          className="h-full origin-left rounded-pill bg-ink transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${current / total})` }}
        />
      </div>
      <p aria-hidden className="text-sm font-medium tabular-nums text-slate">
        <span className="text-ink">{String(current).padStart(2, "0")}</span>
        <span className="mx-1.5">/</span>
        {total}
      </p>
    </div>
  );
}
