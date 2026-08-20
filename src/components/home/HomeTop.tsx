"use client";

import { Shuffle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import type { ReactNode } from "react";

import { DnaSummary } from "@/components/report/DnaSummary";
import { MoodMap } from "@/components/report/MoodMap";
import { MyPlaylist } from "@/components/report/MyPlaylist";
import { RecommendList } from "@/components/report/RecommendList";
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/Button";
import { usePreference } from "@/hooks/use-preference";
import { moodQuadrant } from "@/lib/report/mood-map";
import { nextExclusions, recommend } from "@/lib/report/recommend";

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
  //
  // 이미 본 곡. New Search 를 누를 때마다 쌓이고, 카탈로그를 한 바퀴 돌면 비워진다.
  const [seen, setSeen] = useState<readonly string[]>([]);

  if (!preference) {
    // 저장값이 있는 줄 알고 스크립트가 숨겨 놨을 수 있다 — 깨진 값이었거나
    // 다른 탭에서 지웠거나. 소개 화면이 실제로 렌더되는 지금이 표시를 지울 때다.
    return <div className="home-intro" ref={showIntro}>{children}</div>;
  }

  // 한 번만 고른다. 지도의 강조점과 목록이 같은 다섯 곡을 봐야 한다.
  const picks = recommend(preference, 5, seen);
  const quadrant = moodQuadrant(preference.axes);

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

      {/* 내가 들은 것이 시스템이 고른 것보다 앞이다. 아직 비어 있어도 그렇다 —
          자리를 뒤에 두면 자기 목록이 부록처럼 읽힌다. */}
      <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
        <header>
          <span className="eyebrow text-ink">나만의 플레이리스트</span>
          <h2 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">빠른 선곡</h2>
        </header>

        <MyPlaylist />
      </section>

      {/* 지표 다음, 추천 앞. 순서가 곧 문장이다 —
          "당신은 이렇다" → "지도의 여기다" → "그래서 이 곡들이다". */}
      <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
        <header>
          <span className="eyebrow text-ink">분위기</span>
          <h2 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
            {quadrant ? `${quadrant} 자리에 있습니다` : "지도의 한가운데에 있습니다"}
          </h2>
          <p className="mt-5 max-w-[46ch] text-slate">
            카탈로그 40곡을 밝기와 에너지 두 축에 놓고 당신의 자리를 찍었습니다. 아래 다섯 곡은
            여기서 가장 가까운 곡들입니다. 세 번째 축인 몽환은 이 그림에 없습니다.
          </p>
        </header>

        <MoodMap mood={preference.axes} pickedIds={picks.map((pick) => pick.track.id)} />
      </section>

      {/* 지표에서 추천으로 넘어가는 자리. 선 하나로 나눈다 —
          "분석" 과 "그래서 뭘 들을까" 는 성격이 다른 구간이다. */}
      <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
        {/* 제목과 다시 찾기를 양 끝으로 벌린다. 목록의 주인과 목록으로 할 일이
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

          {/* 재생이 아니라 재검색이다. 방금 본 다섯 곡을 빼고 다음 다섯 곡을 뽑는다.
              카드마다 재생 버튼이 이미 있으니 헤더까지 무거운 필 버튼이면
              같은 행동이 두 무게로 놓인다 — Retake the test 와 같은 텍스트 버튼이다. */}
          <button
            type="button"
            onClick={() => setSeen(nextExclusions(seen, picks.map((pick) => pick.track.id)))}
            className={`${buttonClass("text")} shrink-0`}
          >
            New Search
            <Shuffle size={17} aria-hidden />
          </button>
        </header>

        <RecommendList items={picks} />
      </section>
    </>
  );
}
