"use client";

import { useRef } from "react";
import type { PointerEvent, ReactNode } from "react";

/**
 * 차트 위의 툴팁. **마크 하나하나가 아니라 감싼 영역이 이벤트를 받는다.**
 *
 * 40개 점에 각각 핸들러를 달면 리스너가 40개다. 위임하면 하나고, 점이
 * 늘어도 그대로다. 프로토타입도 같은 구조다 — `[data-tip]` 하나로 모든
 * 차트가 툴팁을 공유한다.
 *
 * **state 를 쓰지 않는다.** 포인터가 움직일 때마다 setState 하면 차트 전체가
 * 다시 그려진다. 툴팁은 DOM 한 조각이므로 ref 로 직접 쓴다 —
 * `CountUp` 이 숫자를 직접 쓰는 것과 같은 이유다.
 *
 * 위치는 `transform` 으로 옮긴다. `left`/`top` 을 매 프레임 쓰면 레이아웃이
 * 다시 돈다. → `.claude/rules/react.md`
 *
 * 툴팁은 마우스 전용 보조 표시다. 화면에 없는 정보를 여기에만 두지 않는다.
 */
export function ChartTooltip({ children }: { children: ReactNode }) {
  const tipRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const subRef = useRef<HTMLSpanElement>(null);

  function markAt(event: PointerEvent<HTMLDivElement>): HTMLElement | null {
    return (event.target as Element).closest<HTMLElement>("[data-tip-title]");
  }

  function show(event: PointerEvent<HTMLDivElement>) {
    const mark = markAt(event);
    const tip = tipRef.current;
    if (!mark || !tip || !titleRef.current || !subRef.current) return;

    titleRef.current.textContent = mark.dataset.tipTitle ?? "";
    subRef.current.textContent = mark.dataset.tipSub ?? "";
    tip.style.opacity = "1";
    move(event);
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const tip = tipRef.current;
    if (!tip || tip.style.opacity !== "1") return;
    tip.style.transform = `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -160%)`;
  }

  function hide(event: PointerEvent<HTMLDivElement>) {
    if (markAt(event) && tipRef.current) tipRef.current.style.opacity = "0";
  }

  return (
    <div onPointerOver={show} onPointerMove={move} onPointerOut={hide} onPointerCancel={hide}>
      {children}

      <div
        ref={tipRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-90 rounded-pill bg-white px-4.5 py-2 text-sm whitespace-nowrap opacity-0 shadow-float transition-opacity duration-100"
      >
        <span ref={titleRef} className="font-medium" />
        <span ref={subRef} className="ml-2.5 text-slate" />
      </div>
    </div>
  );
}
