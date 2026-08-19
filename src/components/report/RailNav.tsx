"use client";

import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { RefObject } from "react";

/** 카드 한 장 + 간격. 한 번 누르면 정확히 한 장이 지나간다 */
const STEP = 264;

/**
 * 레일을 미는 버튼.
 *
 * **Swiper 를 넣지 않은 이유가 여기 있다.** 레일은 이미 네이티브 스크롤이라
 * 터치 스와이프도 트랙패드 가로 스크롤도 그냥 된다. 라이브러리를 얹어 얻는 건
 * 마우스 드래그뿐이고, 잃는 건 40KB 와 키보드·모멘텀·접근성이 공짜로 오던 것이다.
 *
 * 실제로 빠져 있던 건 **마우스만 쓰는 사람에게 오른쪽에 더 있다는 신호**였다.
 * 스크롤바를 감춰 놨으니 알 방법이 없다. 버튼이 그 신호다.
 *
 * 자동 재생은 넣지 않는다. 카드에 읽어야 하는 글이 있어서 저절로 넘어가면
 * 읽는 도중에 사라진다 — WCAG 2.2.2 가 정지 컨트롤을 요구하는 그 경우다.
 */
export function RailNav({ railRef }: { railRef: RefObject<HTMLDivElement | null> }) {
  function push(direction: 1 | -1) {
    railRef.current?.scrollBy({
      left: STEP * direction,
      // 모션을 줄이기로 한 사람에게는 부드러운 스크롤도 모션이다.
      // CSS 전역 차단은 스크롤 동작까지 막지 못하므로 여기서 직접 본다.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <div className="flex gap-2.5">
      {(
        [
          [-1, ArrowLeft, "이전 추천 곡"],
          [1, ArrowRight, "다음 추천 곡"],
        ] as const
      ).map(([direction, Icon, label]) => (
        <button
          key={label}
          type="button"
          onClick={() => push(direction)}
          aria-label={label}
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
        >
          <Icon size={18} weight="regular" aria-hidden />
        </button>
      ))}
    </div>
  );
}
