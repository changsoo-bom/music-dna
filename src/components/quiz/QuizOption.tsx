type QuizOptionProps = {
  label: string;
  /** 장르 문항의 하위 장르 예시. 상위 5종만으로는 뭘 고르는지 안 잡힌다 */
  sub?: string;
  /** 왼쪽 원 안의 글자. 순위 문항에서는 순위, 나머지는 번호 */
  badge: string;
  selected: boolean;
  onClick: () => void;
};

/**
 * 테두리 대신 그림자로 카드를 띄운다.
 *
 * 시스템의 그림자는 둘뿐이다 — `shadow-lift`(떠 있는 칩·네비) ·
 * `shadow-float`(카드·프레임). 평소엔 lift 로 살짝 떠 있다가 호버에서 float 로
 * 올라온다. **그림자 단계를 새로 만들지 않는다.**
 *
 * 떠 있는 요소라 표면은 `bg-white` 다. 크림 캔버스 위의 `bg-lifted` 는
 * 대비가 너무 약해서 그림자만으로 경계를 만들면 카드가 뭉개진다.
 */
export function QuizOption({ label, sub, badge, selected, onClick }: QuizOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex w-full items-center gap-5 px-7 py-5 text-left rounded-btn transition-[box-shadow,background-color,transform] duration-150 active:scale-[0.985] max-sm:gap-4 max-sm:px-5 ${
        selected ? "bg-ink text-canvas shadow-float" : "bg-white text-ink shadow-lift hover:shadow-float"
      }`}
    >
      {/* badge 가 바뀌면 리마운트되어 pop-in 이 다시 돈다.
          순위가 재배치될 때(2위를 빼면 3위가 2위가 된다) 숫자만 조용히
          바뀌면 눈이 놓친다.
          고르기 전에는 애니메이션을 걸지 않는다 — 문항이 뜰 때마다 배지 5개가
          같이 튀면 q-enter 와 겹쳐서 산만해진다. */}
      <span
        key={badge}
        aria-hidden
        className={`grid h-8 w-8 shrink-0 place-items-center text-sm font-medium tabular-nums rounded-full transition-colors ${
          selected ? "pop-in bg-canvas text-ink" : "bg-canvas text-slate group-hover:text-ink"
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
