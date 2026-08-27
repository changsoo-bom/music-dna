import type { Metadata } from "next";
import { ViewTransition } from "react";

import { GENRES } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { QUESTIONS } from "@/lib/quiz/questions";

/** 사이트 이름은 루트의 `template` 이 붙인다 → `app/layout.tsx` */
export const metadata: Metadata = {
  title: "만든 방법",
};

/**
 * 이 사이트를 무엇으로 어떻게 만들었는지 적는 한 장.
 *
 * ## 무엇으로까지만 적는다
 *
 * **레시피가 아니라 재료 표시다.** 스택과 출처와 정한 것은 적고, 문항과
 * 배점·좌표 계산·규칙 문서와 프롬프트는 안 적는다. 그 넷이 이 서비스가 다른
 * 취향 테스트와 갈라지는 지점이라, 적는 순간 이 페이지가 복제 안내서가 된다.
 * **안 적었다는 사실은 적는다** — 빠진 것을 숨기면 목록이 전부인 척하게 된다.
 *
 * ## 숫자는 세어서 적는다
 *
 * 178·20·5 를 문자열로 박아 두면 카탈로그가 늘어난 날 이 페이지만 조용히
 * 거짓말을 시작한다. 서버 컴포넌트라 세는 값이 공짜다 — 빌드 때 한 번 센다.
 *
 * ## 라우트가 조립만 한다
 *
 * 상태도 상호작용도 없는 글 한 장이라 컴포넌트로 쪼갤 것이 없다. 여기서
 * 직접 그리고, 커지면 그때 쪼갠다 → `.claude/rules/structure.md`
 */
const STACK = [
  { name: "Next.js 16", detail: "App Router · 서버 컴포넌트 · Turbopack" },
  { name: "React 19.2", detail: "Compiler · Suspense 경계 · View Transitions" },
  { name: "TypeScript", detail: "strict 모드 · any 없음" },
  { name: "Tailwind CSS 4", detail: "CSS 안의 토큰 정의 · 설정 파일 없음" },
  { name: "Zod 4", detail: "저장값과 외부 응답 검증" },
  { name: "Zustand 5", detail: "클라이언트 전용 UI 상태" },
  { name: "Chart.js 4", detail: "리포트의 오각형 차트" },
] as const;

const SOURCES = [
  { name: "YouTube", detail: "재생과 앨범 이미지. 이미지는 서버를 거쳐 받는다" },
  { name: "곡 카탈로그", detail: "직접 고른 목록. 저장소에 함께 커밋돼 있고 외부 API 를 안 탄다" },
  { name: "Claude Code", detail: "설계·구현·리뷰. 무엇을 넣을지는 사람이 읽고 정한다" },
] as const;

const DECISIONS = [
  {
    title: "서버가 먼저 그린다",
    body: "읽기는 서버 컴포넌트에서 끝낸다. 손이 닿는 말단만 클라이언트로 내리므로, 첫 HTML 에 이미 볼 것이 들어 있다. 검사 결과도 서버가 그린다 — 그래야 결과가 있는 사람에게 빈 화면이 한 번 번쩍이지 않는다.",
  },
  {
    title: "상태는 주소에 적는다",
    body: "기간·장르·정렬·검색어는 전부 주소에 있다. 그래서 뒤로가기와 링크 공유가 따로 만들 것 없이 맞는다. 클라이언트 상태로 들고 있으면 그 둘을 손으로 다시 만들어야 한다.",
  },
  {
    title: "데이터가 브라우저를 거의 안 떠난다",
    body: "계정도 서버 데이터베이스도 없다. 검사 결과와 보관함은 이 브라우저에 남는다. 예외는 결과 사본 하나로, 첫 화면을 서버가 그리게 하려고 쿠키에 둔다 — 매 요청에 실려 가지만 읽고 그릴 뿐 어디에도 안 남긴다.",
  },
  {
    title: "합치기 전에 AI 가 서로를 공격한다",
    body: "관점이 다른 리뷰 에이전트 여럿이 같은 변경을 각자 공격하고, 그중 합치면 터질 것만 걸러 목록으로 만든다. 통과한 것만 들어온다. 취향 문제는 목록에 안 올린다 — 노이즈가 섞이는 순간 아무도 안 읽는다.",
  },
  {
    title: "색과 반경은 시스템이 정한다",
    body: "반경은 셋뿐이고 그림자는 둘뿐이다. 차트 색은 색각 이상 대비 검증을 통과한 조합이라 배열 순서까지가 검증 단위다. 화면마다 새로 고르지 않는 것이 이 사이트가 한 벌로 보이는 이유다.",
  },
] as const;

export default function AboutPage() {
  const stats = [
    { value: CATALOG.length, label: "카탈로그의 곡" },
    { value: GENRES.flatMap((genre) => genre.children).length, label: "세부 장르" },
    { value: QUESTIONS.length, label: "검사 문항" },
    { value: 0, label: "계정과 서버 저장소" },
  ];

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
          <p className="mt-4 max-w-[56ch] text-base text-slate">
            다섯 문항으로 취향의 좌표를 잡고, 그 자리에 가까운 곡을 찾아 주는 사이트입니다. 계정을
            만들지 않고, 결과는 이 브라우저에 남습니다.
          </p>

          {/* **세어서 적는다.** 문자열로 박아 두면 카탈로그가 늘어난 날
              이 페이지만 조용히 거짓말을 시작한다 */}
          <dl className="mt-14 grid grid-cols-4 gap-x-6 gap-y-8 border-y border-hair py-9 max-sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-[clamp(28px,3vw,38px)] leading-none font-bold tracking-[-0.02em] text-ink tabular-nums">
                  {stat.value}
                </dt>
                <dd className="mt-2.5 text-[13px] leading-snug text-slate">{stat.label}</dd>
              </div>
            ))}
          </dl>

          <Block title="기술 스택" items={STACK} />
          <Block title="가져다 쓴 것" items={SOURCES} />

          <h2 className="mt-20 text-[22px] leading-[1.2]">만들면서 정한 것</h2>
          <ol className="mt-8 max-w-[62ch]">
            {DECISIONS.map((decision, index) => (
              <li key={decision.title} className="border-t border-hair py-7">
                {/* 번호는 라벨이라 대문자 아이브로우와 같은 급으로 둔다.
                    `tabular-nums` 가 없으면 01 과 02 의 폭이 달라 제목이 흔들린다 */}
                <span className="eyebrow text-slate tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-medium tracking-[-0.02em] text-ink">
                  {decision.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{decision.body}</p>
              </li>
            ))}
          </ol>

          {/* **빠진 것을 적는다.** 위 목록만 두면 그것이 전부인 것처럼 읽힌다 */}
          <p className="mt-16 max-w-[62ch] border-t border-hair pt-7 text-[13px] leading-relaxed text-slate">
            문항과 배점, 좌표를 잡는 계산, 개발 규칙 문서와 프롬프트는 여기 적지 않았습니다. 이
            페이지는 무엇으로 만들었는지까지입니다.
          </p>
        </section>
      </main>
    </ViewTransition>
  );
}

/**
 * 이름과 한 줄이 짝을 이루는 목록. 스택과 출처가 같은 모양이라 한 벌만 만든다.
 *
 * 두 칸으로 나누지 않는다 — 이름 길이가 제각각이라 왼쪽 칸을 고정하면
 * `TypeScript` 옆이 비고 `Tailwind CSS 4` 는 줄바꿈된다. 위아래로 쌓으면
 * 어느 이름이 와도 같은 짜임이다.
 */
function Block({
  title,
  items,
}: {
  title: string;
  items: readonly { readonly name: string; readonly detail: string }[];
}) {
  return (
    <>
      <h2 className="mt-20 text-[22px] leading-[1.2]">{title}</h2>
      <dl className="mt-8 max-w-[62ch]">
        {items.map((item) => (
          <div key={item.name} className="flex gap-x-8 border-t border-hair py-5 max-sm:flex-col">
            <dt className="w-40 shrink-0 text-sm font-medium tracking-[-0.02em] text-ink">
              {item.name}
            </dt>
            <dd className="text-sm leading-relaxed text-slate max-sm:mt-1.5">{item.detail}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
