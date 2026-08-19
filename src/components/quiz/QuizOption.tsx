type QuizOptionProps = {
  label: string;
  /** 장르 문항의 하위 장르 예시. 상위 5종만으로는 뭘 고르는지 안 잡힌다 */
  sub?: string;
  /** 왼쪽 원 안의 글자. 순위 문항에서는 순위, 나머지는 번호 */
  badge: string;
  selected: boolean;
  onClick: () => void;
};

export function QuizOption({ label, sub, badge, selected, onClick }: QuizOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-5 px-6 py-5 text-left rounded-btn border-[1.5px] transition-colors max-sm:gap-4 max-sm:px-5 ${
        selected ? "border-ink bg-ink text-canvas" : "border-hair bg-lifted text-ink hover:border-ink"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-8 w-8 shrink-0 place-items-center text-sm font-medium tabular-nums rounded-full border transition-colors ${
          selected ? "border-canvas" : "border-hair group-hover:border-ink"
        }`}
      >
        {badge}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-medium tracking-[-0.01em] max-sm:text-base">{label}</span>
        {sub && (
          <span className={`mt-1 block text-sm ${selected ? "text-dust" : "text-slate"}`}>{sub}</span>
        )}
      </span>
    </button>
  );
}
