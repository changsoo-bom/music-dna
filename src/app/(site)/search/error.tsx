"use client";

import { SearchField } from "@/components/common/SearchField";
import { ButtonLink, buttonClass } from "@/components/ui/Button";

/**
 * 검색이 죽었을 때 남는 화면.
 *
 * **`.claude/rules/data.md` 가 요구하는 경계다** — 외부 API 실패는 국소화한다.
 * 이 화면만 외부(YouTube)를 부르므로 여기 경계를 둔다. 위쪽(`app/error.tsx`)이
 * 받으면 헤더 아래 본문 전체가 날아가는데, 실제로 죽은 것은 검색 하나다.
 *
 * **여기까지 오는 것은 예상 못 한 실패뿐이다.** 할당량이 마르거나 네트워크가
 * 끊긴 것은 `searchYoutube` 가 상태로 돌려주고 화면이 한 줄로 말한다 —
 * 그건 고장이 아니라 사정이라 이 화면을 띄울 일이 아니다.
 *
 * 다시 시도를 준다. 외부 호출은 **다시 하면 될 수도 있는 실패**라 새로고침이
 * 실제로 뜻이 있다 — 저장소가 막힌 화면과 다른 점이다 → `app/error.tsx`
 */
export default function SearchError({ reset }: { reset: () => void }) {
  return (
    <main className="shell flex-1 pb-28 max-sm:pb-16">
      <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
        <span className="eyebrow text-ink">검색하지 못했습니다</span>

        {/* **좁은 화면에만 있는 칸이다** — 결과 화면과 같은 이유이자 같은
            경계다(`sm`). 넓은 화면에서는 헤더의 칸이 살아 있고, 좁은 화면에는
            돋보기밖에 없어서 이것까지 없으면 **검색이 실패한 자리에 검색
            입구가 하나도 없다.** 남는 것이 같은 말을 그대로 다시 던지는
            `다시 찾기` 뿐이 된다 → `SearchPage`

            찾던 말은 안 물린다. 여기는 클라이언트 경계라 `?q=` 를 받지
            못하고, **다른 말로 찾아보라는 것이 이 자리의 제안**이라 빈 칸이
            맞다 — 같은 말을 다시 던지는 것은 옆 버튼이 한다 */}
        <SearchField className="mt-5 w-full sm:hidden" />

        <h1 className="mt-8 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
          잠시 뒤에 다시 찾아보세요
        </h1>
        <p className="mt-4 max-w-[46ch] text-sm text-slate">
          카탈로그는 그대로 있습니다. 둘러보기에서는 곡을 계속 보실 수 있습니다.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            다시 찾기
          </button>
          <ButtonLink href="/browse" variant="text">
            둘러보기로 가기
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
