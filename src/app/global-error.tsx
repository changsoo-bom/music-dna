"use client";

import "./globals.css";

/**
 * 마지막 그물. **루트 레이아웃이 죽었을 때만 뜬다.**
 *
 * `app/error.tsx` 는 레이아웃 *아래* 세그먼트만 받는다. 레이아웃 자체나
 * 그 바깥에 있는 `PlayerBar` 가 렌더 중에 던지면 잡을 것이 없어서
 * 브라우저 기본 오류 화면이 남는다.
 *
 * **`<html>` 과 `<body>` 를 직접 그린다.** 이 경계는 레이아웃을 대체하므로
 * 레이아웃이 만들던 것이 하나도 없다 — `next/font` 변수도 없어서 글꼴은
 * `--font-sans` 의 마지막 폴백으로 떨어진다. 토큰은 `globals.css` 를 여기서
 * 직접 들여와 살린다. 개발 모드에서는 Next 의 오류 오버레이가 먼저 뜨므로
 * 프로덕션에서만 보인다.
 *
 * 여기까지 온 화면은 리액트 트리를 못 믿는다. `reset()` 말고는 손댈 것이
 * 없고, 안 되면 새로고침이다 — 그래서 안내가 두 줄뿐이다.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ko">
      <body>
        <main className="shell flex flex-1 flex-col justify-center py-28 max-sm:py-16">
          <span className="eyebrow text-ink">문제가 생겼습니다</span>
          <h1 className="mt-5 max-w-[20ch] text-[clamp(28px,4vw,44px)] leading-[1.1]">
            화면을 불러오지 못했습니다
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">
            다시 시도해도 같으면 새로고침해 주세요. 검사 결과는 이 브라우저에 그대로 있습니다.
          </p>

          <button
            type="button"
            onClick={reset}
            className="mt-9 inline-flex h-12 w-fit items-center justify-center rounded-btn border-[1.5px] border-ink bg-ink px-6 text-base font-medium tracking-[-0.02em] text-canvas transition-opacity hover:opacity-90 active:translate-y-px"
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
