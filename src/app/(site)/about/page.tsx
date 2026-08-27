import type { Metadata } from "next";
import { ViewTransition } from "react";

/** 사이트 이름은 루트의 `template` 이 붙인다 → `app/layout.tsx` */
export const metadata: Metadata = {
  title: "만든 방법",
};

/**
 * 이 사이트를 무엇으로 어떻게 만들었는지 적는 한 장.
 *
 * ## 무엇으로까지만 적는다
 *
 * **레시피가 아니라 재료 표시다.** 스택 이름과 만드는 방식은 적고, 문항과
 * 배점·좌표 계산·규칙 문서와 프롬프트는 안 적는다. 그 넷이 이 서비스가 다른
 * 취향 테스트와 갈라지는 지점이라, 적는 순간 이 페이지가 복제 안내서가 된다.
 * **안 적었다는 사실은 적는다** — 빠진 것을 숨기면 목록이 전부인 척하게 된다.
 *
 * ## 라우트가 조립만 한다
 *
 * 상태도 상호작용도 없는 글 한 장이라 컴포넌트로 쪼갤 것이 없다. 여기서
 * 직접 그리고, 커지면 그때 쪼갠다 → `.claude/rules/structure.md`
 *
 * 전환 래퍼는 다른 화면과 같은 모양이다 — 양쪽 다 감싸야 나가는 화면과
 * 들어오는 화면이 짝을 이룬다.
 */
const BLOCKS = [
  {
    title: "화면",
    body: "Next.js App Router · React · TypeScript · Tailwind CSS. 서버에서 그릴 수 있는 것은 서버에서 그리고, 손이 닿는 말단만 클라이언트로 내립니다.",
  },
  {
    title: "데이터",
    body: "곡 목록은 저장소에 함께 커밋된 고정 카탈로그입니다. 재생과 앨범 이미지는 YouTube 에서 가져옵니다. 계정도 서버 데이터베이스도 없습니다 — 검사 결과와 보관함은 이 브라우저에만 남습니다.",
  },
  {
    title: "AI",
    body: "Claude Code 로 만들었습니다. 사람이 정해 둔 규칙 문서 아래에서 설계와 구현을 돌리고, 합치기 전에는 관점이 다른 리뷰 에이전트 여럿이 같은 변경을 각자 공격합니다. 무엇을 넣을지는 사람이 읽고 정합니다.",
  },
] as const;

export default function AboutPage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">만든 방법</span>
          <h1 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
            무엇으로, 어떻게 만들었나
          </h1>
          {/* 글줄 길이를 잡아 둔다. 폭을 다 쓰면 1280px 짜리 한 줄이 되어
              눈이 다음 줄 머리를 못 찾는다 */}
          <p className="mt-4 max-w-[52ch] text-sm text-slate">
            취향을 다섯 문항으로 재고, 그 좌표에 가까운 곡을 찾아 주는 사이트입니다.
          </p>

          {/* 줄 하나로 나눈다. 카드로 띄우면 세 덩어리가 서로 다른 것을 말하는
              것처럼 읽히는데, 여기는 한 이야기의 세 문단이다 */}
          <dl className="mt-14 max-w-[52ch] border-t border-hair">
            {BLOCKS.map((block) => (
              <div key={block.title} className="border-b border-hair py-7">
                <dt className="text-base font-medium tracking-[-0.02em] text-ink">
                  {block.title}
                </dt>
                <dd className="mt-2.5 text-sm leading-relaxed text-slate">{block.body}</dd>
              </div>
            ))}
          </dl>

          {/* **빠진 것을 적는다.** 위 목록만 두면 그것이 전부인 것처럼 읽힌다 */}
          <p className="mt-10 max-w-[52ch] text-[13px] leading-relaxed text-slate">
            문항과 배점, 좌표를 잡는 계산, 개발 규칙 문서와 프롬프트는 여기 적지 않았습니다. 이
            페이지는 무엇으로 만들었는지까지입니다.
          </p>
        </section>
      </main>
    </ViewTransition>
  );
}
