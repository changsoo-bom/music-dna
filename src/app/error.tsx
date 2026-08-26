"use client";

import { ButtonLink, buttonClass } from "@/components/ui/Button";

/**
 * 라우트가 죽었을 때 남는 화면.
 *
 * **`.claude/rules/data.md` 가 요구하는 경계다** — 외부 실패는 국소화한다.
 * 여기서 잡히는 건 주로 브라우저 저장소다. 사이트 데이터를 차단한 브라우저나
 * `allow-same-origin` 없는 iframe 에서는 `localStorage` 에 손대는 것만으로
 * SecurityError 가 나고, 그게 렌더 도중이면 트리 전체가 언마운트된다.
 * 읽기 경로는 이제 `readStoredValue` 가 삼키지만(→ `use-stored-value.ts`),
 * **경계는 삼키지 못한 것을 위해 있다.**
 *
 * **홈과 검사 화면이 같이 쓴다.** `app/` 최상단이라 그 아래 라우트가 전부
 * 여기로 온다 — 문구를 홈에 맞춰 쓰면 검사 중에 죽은 사람에게 "결과를
 * 읽지 못합니다" 라고 말하게 된다. 무엇이 죽었는지 모르는 채로도 맞는
 * 말만 적는다.
 *
 * 루트 레이아웃 자체와 그 밖에 있는 `PlayerBar` 는 여기서 못 잡는다.
 * 그건 `global-error.tsx` 가 받는다.
 *
 * 원인을 화면에 적지 않는다. 스택트레이스는 쓸 사람에게만 의미가 있고,
 * 여기 필요한 것은 다음에 뭘 누르면 되는지다.
 *
 * `reset()` 은 서브트리를 다시 그린다 — 저장소가 잠깐 막혔던 경우에는
 * 이걸로 돌아온다. 안 돌아오면 검사를 다시 하는 길이 옆에 있다.
 */
export default function RouteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="shell flex flex-1 flex-col justify-center py-28 max-sm:py-16">
      <span className="eyebrow text-ink">화면을 그리지 못했습니다</span>
      <h1 className="mt-5 max-w-[20ch] text-[clamp(28px,4vw,44px)] leading-[1.1]">
        잠시 문제가 생겼습니다
      </h1>
      <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">
        브라우저가 저장소 접근을 막고 있으면 이 화면이 나옵니다. 시크릿 창이나 사이트 데이터 차단
        설정을 확인해 주세요.
      </p>

      <div className="mt-9 flex items-center gap-3 max-sm:flex-col max-sm:items-start">
        <button type="button" onClick={reset} className={buttonClass()}>
          다시 시도
        </button>
        <ButtonLink href="/" variant="secondary">
          처음으로
        </ButtonLink>
      </div>
    </main>
  );
}
