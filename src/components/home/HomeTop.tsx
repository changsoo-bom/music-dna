"use client";

import { Play } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

import { DnaSummary } from "@/components/report/DnaSummary";
import { RecommendList } from "@/components/report/RecommendList";
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/Button";
import { usePreference } from "@/hooks/use-preference";
import { recommend } from "@/lib/report/recommend";
import { isPlayable, usePlayerStore } from "@/lib/use-player-store";

/**
 * 홈 맨 위. 검사를 했으면 결과, 안 했으면 소개.
 *
 * 소개는 `children` 으로 받는다. 여기서 직접 import 하면 랜딩 마크업이 통째로
 * 클라이언트 번들에 실린다 — **서버에서 그린 것을 그대로 통과시킨다.**
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 소개다. 검사한 사람은
 * 하이드레이션 직후 결과로 바뀐다. 계정을 두지 않기로 한 결정의 대가고,
 * 이걸 없애려면 서버에 세션을 둬야 한다.
 */
/** 모듈 스코프에 둔다 — 인라인 화살표면 렌더마다 detach/attach 한다 */
function showIntro(el: HTMLElement | null) {
  if (el) document.documentElement.removeAttribute("data-dna");
}

export function HomeTop({ children }: { children: ReactNode }) {
  const preference = usePreference();
  // 훅은 조기 반환보다 위에 있어야 한다. 소개 화면에서는 안 쓰지만
  // 호출 순서가 렌더마다 달라지면 React 가 훅을 짝지을 수 없다.
  const play = usePlayerStore((state) => state.play);

  if (!preference) {
    // 저장값이 있는 줄 알고 스크립트가 숨겨 놨을 수 있다 — 깨진 값이었거나
    // 다른 탭에서 지웠거나. 소개 화면이 실제로 렌더되는 지금이 표시를 지울 때다.
    return <div className="home-intro" ref={showIntro}>{children}</div>;
  }

  // 한 번만 고른다. 헤더의 "전체 재생" 과 목록이 같은 다섯 곡을 봐야 한다.
  const picks = recommend(preference);
  const queue = picks.map((pick) => pick.track).filter(isPlayable);

  return (
    <>
      <section className="pt-20 max-lg:pt-14 max-sm:pt-10">
        <DnaSummary
          preference={preference}
          action={
            <ButtonLink href="/quiz" variant="text">
              Retake the test
              <Arrow />
            </ButtonLink>
          }
        />
      </section>

      {/* 지표에서 추천으로 넘어가는 자리. 선 하나로 나눈다 —
          "분석" 과 "그래서 뭘 들을까" 는 성격이 다른 구간이다. */}
      <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
        {/* 제목과 전체 재생을 양 끝으로 벌린다. 목록의 주인과 목록으로 할 일이
            같은 줄에 있어야 "이게 내 것이고, 이렇게 튼다" 가 한 번에 읽힌다. */}
        <header className="flex items-end justify-between gap-8 max-sm:flex-col max-sm:items-start max-sm:gap-6">
          <div>
            <span className="eyebrow text-ink">추천 플레이리스트</span>
            <h2 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
              그래서 이런 곡은 어떤가요
            </h2>
            <p className="mt-5 max-w-[44ch] text-slate">
              당신이 고른 장르와 답한 분위기에 가장 가까운 다섯 곡입니다.
            </p>
          </div>

          {/* 이 페이지가 원하는 단 하나의 행동이라 필 버튼이다.
              카드의 위성 버튼은 한 곡, 이건 목록 전체 — 무게가 다르다. */}
          {queue.length > 0 && (
            <button
              type="button"
              onClick={() => play(queue, 0)}
              className={`${buttonClass()} shrink-0 gap-2`}
            >
              <Play size={17} weight="fill" aria-hidden className="translate-x-px" />
              전체 재생
            </button>
          )}
        </header>

        <RecommendList items={picks} />
      </section>
    </>
  );
}
