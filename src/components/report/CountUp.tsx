"use client";

const DURATION = 900;

/** 빠르게 시작해 부드럽게 멎는다. 선형으로 올리면 계수기처럼 보인다 */
function easeOut(t: number) {
  return 1 - (1 - t) ** 3;
}

/**
 * 0 에서 값까지 올라간다.
 *
 * **`setState` 를 쓰지 않는다.** 매 프레임 state 를 갱신하면 그 서브트리가
 * 매 프레임 리렌더되고, React Compiler 의 set-state-in-effect 규칙과도 부딪힌다.
 * ref 콜백 안에서 `textContent` 만 직접 쓴다 — 리액트 트리는 한 번도 안 건드린다.
 *
 * 자식으로 최종값을 그대로 둬서 **JS 가 없어도 숫자가 보인다.** ref 콜백은
 * 브라우저 페인트 전에 도므로 `0` 으로 덮어도 최종값이 깜빡이지 않는다.
 *
 * `prefers-reduced-motion` 은 여기서 직접 확인한다. `globals.css` 의 전역 차단은
 * CSS 애니메이션·트랜지션만 멈추고 JS 로 만든 모션은 못 막는다.
 */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      ref={(el) => {
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let startedAt = 0;
        el.textContent = `0${suffix}`;

        const step = (now: number) => {
          if (!startedAt) startedAt = now;
          const progress = Math.min(1, (now - startedAt) / DURATION);
          el.textContent = `${Math.round(easeOut(progress) * value)}${suffix}`;
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(frame);
      }}
    >
      {value}
      {suffix}
    </span>
  );
}
