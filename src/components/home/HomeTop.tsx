"use client";

import { Shuffle } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";

import { NAV_FORWARD } from "@/constants/nav";
import { MyPlaylist } from "@/components/report/MyPlaylist";
import { RecommendList } from "@/components/report/RecommendList";
import { RetakeCta } from "@/components/report/RetakeCta";
import { Verdict } from "@/components/report/Verdict";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { useSavedTrackIds } from "@/hooks/use-playlists";
import { usePreference } from "@/hooks/use-preference";
import { readStoredValue } from "@/lib/stored-value";
import { nextExclusions, recommend } from "@/lib/report/recommend";
import { clearPreferenceCookie, syncPreferenceCookie } from "@/lib/preference-cookie";
import { parsePreference } from "@/lib/schemas/preference";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { revealOnScroll } from "@/lib/utils";

/**
 * 소개 자리의 표시를 지운다. **저장값이 실제로 깨졌을 때만.**
 *
 * 이 ref 는 하이드레이션 첫 렌더에서도 돈다 — 쿠키가 없는 브라우저에서는
 * 서버가 여전히 "결과 없음" 으로 그리기 때문이다. 그때 표시를 지우면 첫
 * 페인트에 숨겨 뒀던 안내가 한 프레임 드러나고, 그게 **새로고침할 때마다
 * 스치던 화면**이다.
 *
 * 그래서 여기서 저장값을 직접 다시 읽는다. 성한 값이 있으면 곧 결과로 바뀔
 * 것이므로 그대로 숨겨 둔다. 없거나 깨졌으면 그때 드러낸다 —
 * 안 그러면 빈 화면만 남는다.
 *
 * 같은 자리에서 쿠키 사본도 버린다. **여기까지 왔다는 건 정본이 비었다는
 * 뜻이다.** 사본만 남겨 두면 다음 새로고침에 서버가 결과를 그리고 클라이언트가
 * 안내로 되돌리는 — 쿠키를 도입해서 없애려던 것과 정확히 반대인 깜빡임이 된다.
 *
 * 반대 방향(정본은 멀쩡한데 사본이 없거나 낡음)은 여기서 안 고친다.
 * 이 화면은 결과가 없을 때만 그려지므로 그 경우를 볼 수가 없다.
 * → `syncPreferenceCookie`
 *
 * 모듈 스코프에 둔다. 인라인 화살표면 렌더마다 detach/attach 한다.
 */
function revealIfNoResult(el: HTMLElement | null) {
  if (!el) return;
  const raw = readStoredValue(STORAGE_KEYS.preference);
  if (parsePreference(raw)) return;
  clearPreferenceCookie();
  document.documentElement.removeAttribute("data-dna");
}

/**
 * 홈 맨 위. 검사를 했으면 결과, 안 했으면 검사로 보내는 안내.
 *
 * `serverRaw` 는 서버가 쿠키에서 읽어 넘긴 검사 결과다. 있으면 **첫 HTML 에
 * 이미 결과가 들어 있어서** 화면이 안 바뀐다. 없으면 예전 그대로 — 안내로
 * 그렸다가 하이드레이션 직후 결과로 넘어간다. 계정을 두지 않기로 한 결정의
 * 대가가 여기 남아 있고, 쿠키는 그 대가를 첫 페인트에서만 면제해 준다.
 */
export function HomeTop({ serverRaw = null }: { serverRaw?: string | null }) {
  const preference = usePreference(serverRaw);
  // 보관함 구독은 이 화면에 하나다. 추천 카드가 각자 부르면 다섯 번 구독한다.
  // `MyPlaylist` 는 자기 목록만큼을 스스로 본다 → 두 목록이 서로 안 얽힌다
  const savedIds = useSavedTrackIds();

  // 서버가 본 사본과 정본이 다르면 사본을 맞춘다. → `syncPreferenceCookie`
  //
  // 효과가 맞는 자리다. 브라우저 쿠키는 **React 밖의 시스템**이고, 렌더 중에
  // 건드리면 동시 렌더에서 두 번 쓰거나 버려진 렌더의 쓰기가 남는다.
  // `setState` 를 안 하므로 Compiler 의 set-state-in-effect 와도 안 부딪힌다.
  useEffect(() => syncPreferenceCookie(serverRaw), [serverRaw]);
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
        <ButtonLink href="/quiz" transitionTypes={NAV_FORWARD} className="mt-9">
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

      {/* 내가 들은 것이 시스템이 고른 것보다 앞이다. 아직 비어 있어도 그렇다 —
          자리를 뒤에 두면 자기 목록이 부록처럼 읽힌다. */}
      <section
        ref={revealOnScroll}
        className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12"
      >
        <header>
          <span className="eyebrow text-ink">나만의 플레이리스트</span>
          <h2 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">빠른 선곡</h2>
        </header>

        <MyPlaylist />
      </section>

      {/* 내 목록에서 추천으로 넘어가는 자리. 선 하나로 나눈다 —
          "내가 들은 것" 과 "그래서 뭘 들을까" 는 성격이 다른 구간이다. */}
      <section
        ref={revealOnScroll}
        className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12"
      >
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

        <RecommendList items={picks} savedIds={savedIds} />
      </section>

      <RetakeCta preference={preference} />
    </>
  );
}
