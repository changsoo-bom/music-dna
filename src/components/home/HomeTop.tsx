"use client";

import { Shuffle } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

import { DnaSummary } from "@/components/report/DnaSummary";
import { MyPlaylist } from "@/components/report/MyPlaylist";
import { RecommendList } from "@/components/report/RecommendList";
import { Verdict } from "@/components/report/Verdict";
import { Arrow, ButtonLink, buttonClass } from "@/components/ui/Button";
import { usePreference } from "@/hooks/use-preference";
import { nextExclusions, recommend } from "@/lib/report/recommend";
import { parsePreference } from "@/lib/schemas/preference";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * 소개 자리의 표시를 지운다. **저장값이 실제로 깨졌을 때만.**
 *
 * 이 ref 는 하이드레이션 첫 렌더에서도 돈다 — 서버가 Local Storage 를 못 봐서
 * 항상 "결과 없음" 으로 그려지기 때문이다. 그때 표시를 지우면 첫 페인트에
 * 숨겨 뒀던 안내가 한 프레임 드러나고, 그게 **새로고침할 때마다 스치던 화면**이다.
 *
 * 그래서 여기서 저장값을 직접 다시 읽는다. 성한 값이 있으면 곧 결과로 바뀔
 * 것이므로 그대로 숨겨 둔다. 없거나 깨졌으면 그때 드러낸다 —
 * 안 그러면 빈 화면만 남는다.
 *
 * 모듈 스코프에 둔다. 인라인 화살표면 렌더마다 detach/attach 한다.
 */
function revealIfNoResult(el: HTMLElement | null) {
  if (!el) return;
  if (parsePreference(window.localStorage.getItem(STORAGE_KEYS.preference))) return;
  document.documentElement.removeAttribute("data-dna");
}

/**
 * 홈 맨 위. 검사를 했으면 결과, 안 했으면 검사로 보내는 안내.
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 안내다. 검사한 사람은
 * 하이드레이션 직후 결과로 바뀐다. 계정을 두지 않기로 한 결정의 대가고,
 * 이걸 없애려면 서버에 세션을 둬야 한다.
 */
export function HomeTop() {
  const preference = usePreference();
  // 훅은 조기 반환보다 위에 있어야 한다. 안내 화면에서는 안 쓰지만
  // 호출 순서가 렌더마다 달라지면 React 가 훅을 짝지을 수 없다.
  //
  // 이미 본 곡. New Search 를 누를 때마다 쌓이고, 카탈로그를 한 바퀴 돌면 비워진다.
  const [seen, setSeen] = useState<readonly string[]>([]);

  if (!preference) {
    return (
      <section ref={revealIfNoResult} className="home-intro pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
        <span className="eyebrow text-ink">시작</span>
        <h1 className="mt-5 text-[clamp(32px,5vw,56px)] leading-[1.1]">
          당신의 취향에는 지문이 있습니다
        </h1>
        <p className="mt-6 max-w-[44ch] text-lg text-slate max-sm:text-base">
          다섯 문항이면 됩니다. 장르와 분위기를 골라 두면 그 좌표에 가장 가까운 곡을 찾아
          드립니다.
        </p>
        <ButtonLink href="/quiz" className="mt-9">
          취향 분석하기
        </ButtonLink>
      </section>
    );
  }

  // 한 번만 고른다. 목록과 New Search 가 같은 다섯 곡을 봐야 한다.
  const picks = recommend(preference, 5, seen);

  return (
    <>
      <Verdict preference={preference} />

      {/* 선언 다음에 내역. 위에서 "당신은 이런 사람" 이라고 말했으니
          여기서는 그 판정이 어느 값에서 나왔는지를 편다. */}
      <section className="mt-8">
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

      {/* 내 목록에서 추천으로 넘어가는 자리. 선 하나로 나눈다 —
          "내가 들은 것" 과 "그래서 뭘 들을까" 는 성격이 다른 구간이다. */}
      <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
        {/* 제목과 다시 찾기를 양 끝으로 벌린다. 목록의 주인과 목록으로 할 일이
            같은 줄에 있어야 "이게 내 것이고, 이렇게 튼다" 가 한 번에 읽힌다. */}
        <header className="flex items-end justify-between gap-8 max-sm:flex-col max-sm:items-start max-sm:gap-6">
          <div>
            <span className="eyebrow text-ink">추천 플레이리스트</span>
            <h2 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
              그래서 이런 곡은 어떤가요
            </h2>
            <p className="mt-5 text-slate">
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
