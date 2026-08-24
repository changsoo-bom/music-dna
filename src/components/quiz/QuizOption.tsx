type BaseProps = {
  label: string;
  /** 장르 문항의 하위 장르 예시. 상위 5종만으로는 뭘 고르는지 안 잡힌다 */
  sub?: string;
  /** 왼쪽 원 안의 글자. 순위 문항에서는 순위, 나머지는 번호 */
  badge: string;
  selected: boolean;
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
 *
 * 클릭 피드백은 **색만** 움직인다. 크기를 건드리면 카드 폭이 720px 이라
 * 주변이 같이 흔들리는 것처럼 보인다.
 */
function cardClass(selected: boolean, muted = false) {
  const base =
    "group flex w-full items-center gap-5 px-7 py-5 text-left rounded-btn transition-[box-shadow,background-color,color,opacity] duration-200 max-sm:gap-4 max-sm:px-5";
  if (selected) return `${base} bg-ink text-canvas shadow-float`;
  // 한도에 닿아 죽은 카드. 너무 흐리면 안 된다 — 무엇을 해제할지 고르려면
  // 남은 선택지를 읽어야 하는데, 그게 필요한 순간이 바로 지금이다.
  if (muted) return `${base} bg-white text-ink shadow-lift opacity-60`;
  return `${base} bg-white text-ink shadow-lift hover:shadow-float`;
}

function Body({ label, sub, badge, selected }: BaseProps) {
  return (
    <>
      <span
        aria-hidden
        className={`grid h-8 w-8 shrink-0 place-items-center text-sm font-medium tabular-nums rounded-full transition-colors duration-200 ${
          selected ? "bg-canvas text-ink" : "bg-canvas text-slate group-hover:text-ink"
        }`}
      >
        {badge}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-medium tracking-[-0.01em] max-sm:text-base">
          {label}
        </span>
        {sub && (
          <span
            className={`mt-1 block text-sm transition-colors duration-200 ${
              selected ? "text-dust" : "text-slate"
            }`}
          >
            {sub}
          </span>
        )}
      </span>
    </>
  );
}

/** 포커스 링. 라디오는 입력이 숨어 있어서 카드가 대신 받는다 */
const RING =
  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ink has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-canvas";

/**
 * 택1 문항. **네이티브 라디오를 쓴다.**
 *
 * 버튼 + `aria-pressed` 로 만들면 "하나만 고를 수 있다" 가 전달되지 않아
 * 여러 개 고를 수 있다고 오해한다. 라디오로 두면 배타 선택·그룹 고지·
 * 화살표 키 이동이 전부 브라우저에서 공짜로 따라온다 —
 * roving tabindex 를 손으로 만들 이유가 없다.
 */
export function QuizRadioOption({
  name,
  onSelect,
  ...body
}: BaseProps & { name: string; onSelect: () => void }) {
  return (
    <label className={`${cardClass(body.selected)} ${RING}`}>
      <input
        type="radio"
        name={name}
        checked={body.selected}
        onChange={onSelect}
        className="sr-only"
      />
      <Body {...body} />
    </label>
  );
}

/**
 * 순위 문항. 순서가 곧 가중치(5/2/1)라 라디오도 체크박스도 아니다.
 *
 * 순위를 담은 유일한 요소인 badge 가 `aria-hidden` 이라, 그냥 두면 스크린리더
 * 사용자는 1위와 3위를 구별할 수 없다. 그 둘은 점수가 5배 차이다.
 *
 * **`aria-label` 로 붙이지 않는다.** `aria-label` 은 자손 텍스트를 전부 덮어서
 * 하위 장르 부제(`sub`)가 통째로 안 읽힌다 — 하필 `sub` 를 가진 유일한 문항이
 * 이 순위 문항이고, 그 부제가 "뭘 고르는 건지" 를 말해 주는 정보다.
 * 시각적으로만 숨긴 `<span>` 을 앞에 두면 라벨·부제·순위가 전부 살아 있다.
 */
export function QuizRankOption({
  rank,
  disabled,
  onToggle,
  ...body
}: BaseProps & { rank: number; disabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={body.selected}
      className={`${cardClass(body.selected, disabled)} focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none disabled:cursor-not-allowed`}
    >
      {rank >= 0 && <span className="sr-only">{rank + 1}순위,</span>}
      <Body {...body} />
    </button>
  );
}
