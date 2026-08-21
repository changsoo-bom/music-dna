"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NAV_BACK, NAV_FORWARD } from "@/constants/nav";
import { QuizRadioOption, QuizRankOption } from "@/components/quiz/QuizOption";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizResult } from "@/components/quiz/QuizResult";
import { buttonClass } from "@/components/ui/Button";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference } from "@/lib/quiz/scoring";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { focusOnMount } from "@/lib/utils";
import type { MusicPreference } from "@/types/music";
import type { QuizAnswers } from "@/types/quiz";

/**
 * 문항 index 를 `searchParams` 에 두지 않는다.
 *
 * URL 로 표현하면 브라우저 뒤로가기가 공짜로 붙지만, 답은 여전히 클라이언트에
 * 있어야 해서 두 곳에서 상태를 관리하게 된다. 문항 이동은 이 화면 밖으로
 * 나가지 않으므로 로컬 state 하나로 충분하고, 되돌리기는 버튼으로 준다.
 */
export function QuizFlow() {
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<MusicPreference | null>(null);
  const router = useRouter();

  // 재검사는 화면만 처음으로 돌린다. 저장된 결과는 지우지 않는다 —
  // 다시 하다 그만두면 이전 결과가 남아 있어야 한다.
  function retry() {
    setAnswers({});
    setIndex(0);
    setResult(null);
  }

  if (result) return <QuizResult preference={result} onRetry={retry} />;

  const question = QUESTIONS[index];
  const picked = answers[question.id] ?? [];
  const isRank = question.axis === "genre";
  const isLast = index + 1 === QUESTIONS.length;

  /**
   * 고르는 것과 넘어가는 것을 분리한다.
   *
   * 자동으로 넘기면 버튼 한 번을 아끼지만 **고른 게 맞는지 확인할 틈이 없다.**
   * 손이 미끄러지면 이미 다음 문항이고, 되돌리려면 이전 버튼을 눌러야 한다.
   */
  function select(optionIndex: number) {
    setAnswers({ ...answers, [question.id]: [optionIndex] });
  }

  /** 순위 문항: 누르면 담기고 다시 누르면 빠진다. 다 차면 더 안 담긴다 */
  function toggleRank(optionIndex: number, maxPicks: number) {
    if (picked.includes(optionIndex)) {
      setAnswers({ ...answers, [question.id]: picked.filter((i) => i !== optionIndex) });
      return;
    }
    if (picked.length >= maxPicks) return;
    setAnswers({ ...answers, [question.id]: [...picked, optionIndex] });
  }

  function advance() {
    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    // 계산은 순수 함수이고, 저장은 이벤트 핸들러 안에서 끝낸다 —
    // useEffect 에서 하면 React Compiler 의 set-state-in-effect 와 부딪힌다.
    const preference = computePreference(answers, new Date().toISOString());

    // setItem 은 사생활 보호 모드(QuotaExceededError)나 사이트 데이터 차단
    // (localStorage 접근 자체가 SecurityError)에서 던진다. 이벤트 핸들러 안의
    // 동기 예외라 error.tsx 도 에러 바운더리도 안 잡는다.
    try {
      window.localStorage.setItem(STORAGE_KEYS.preference, JSON.stringify(preference));
    } catch {
      // 홈은 저장된 값을 읽어서 그린다. 저장이 안 됐으면 홈에 보내 봐야
      // 빈 화면이다. **여기서 붙잡고 결과를 보여준다.**
      setResult(preference);
      return;
    }

    // 결과는 홈 맨 위에 있다. 같은 것을 두 번 보여주지 않는다.
    //
    // 돌아가는 길이지만 `nav-forward` 다. 검사를 마치고 결과를 받는 건
    // 되돌아가는 게 아니라 도착이다 — 뒤로 미는 애니메이션을 쓰면
    // 방금 한 일이 취소된 것처럼 읽힌다.
    router.push("/", { transitionTypes: NAV_FORWARD });
  }

  return (
    <div className="mx-auto max-w-[720px]">
      {/* 나가는 문. 이 화면에는 헤더도 푸터도 없어서, 이게 없으면 브라우저
          뒤로가기 말고는 빠져나갈 길이 없다.

          아래의 "이전" 과 다른 일을 한다 — 저건 문항을 되돌리고 이건 검사를
          그만둔다. 글자가 없으니 `aria-label` 이 유일한 이름이다.

          표면 없이 화살표만 둔다. 흰 원을 깔면 이 화면에서 유일하게 떠 있는
          것이 되어 문항보다 먼저 눈에 들어온다 — 나가는 문이 그만한 무게를
          가질 자리가 아니다. 대신 원형 히트박스는 남겨서 손이 안 미끄러진다.

          답은 마지막 문항까지 가야 저장되므로 여기서 나가면 지금까지 고른
          것이 사라진다. **확인 창을 띄우지 않는다** — 1분짜리 검사에
          "정말 나가시겠습니까" 를 붙이면 그 창이 검사보다 무거워진다. */}
      <Link
        href="/"
        transitionTypes={NAV_BACK}
        aria-label="검사 그만두고 홈으로"
        className="group mb-6 -ml-3.5 inline-flex h-14 w-14 items-center justify-center rounded-full text-slate transition-colors hover:text-ink max-sm:mb-4 max-sm:-ml-3 max-sm:h-12 max-sm:w-12"
      >
        <ArrowLeft
          size={24}
          aria-hidden
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      </Link>

      <QuizProgress current={index + 1} total={QUESTIONS.length} />

      {/* key 로 리마운트해서 진입 애니메이션을 다시 태운다 */}
      <div key={question.id} className="q-enter mt-16 max-sm:mt-10">
        {/* 문항이 바뀌면 제목으로 포커스를 옮긴다. 세 가지가 같이 해결된다 —
            (1) "다음" 이 disabled 로 바뀌면서 포커스가 body 로 튕기는 문제
            (2) 스크린리더에 화면이 바뀐 신호가 전혀 안 가던 문제
            (3) 모바일에서 목록 하단의 "다음" 을 누르면 새 제목이 화면 밖이던 문제
            프로그램 포커스 대상이라 링을 지운다. Tab 순서에는 안 들어간다.
            ref 를 모듈 스코프 함수로 두는 이유는 focusOnMount 주석에 있다. */}
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="text-[clamp(28px,4vw,44px)] leading-[1.15] outline-none"
        >
          {question.prompt}
        </h1>
        {isRank && <p className="mt-4 text-base text-slate">{question.hint}</p>}

        {/* 그림자가 서로 겹치면 탁해진다. 테두리일 때보다 간격을 벌린다 */}
        <ul className="mt-12 flex flex-col gap-4 max-sm:mt-8">
          {isRank
            ? question.options.map((option, optionIndex) => {
                const rank = picked.indexOf(optionIndex);
                return (
                  <li key={option.label}>
                    <QuizRankOption
                      label={option.label}
                      sub={option.sub}
                      badge={rank >= 0 ? String(rank + 1) : "+"}
                      selected={rank >= 0}
                      rank={rank}
                      // 한도에 닿으면 미선택 카드를 죽인다. 전에는 활성 버튼인 채로
                      // 클릭만 무시돼서 "왜 안 눌리지" 를 겪었다.
                      disabled={rank < 0 && picked.length >= question.maxPicks}
                      onToggle={() => toggleRank(optionIndex, question.maxPicks)}
                    />
                  </li>
                );
              })
            : question.options.map((option, optionIndex) => (
                <li key={option.label}>
                  <QuizRadioOption
                    name={question.id}
                    label={option.label}
                    badge={String(optionIndex + 1)}
                    selected={picked[0] === optionIndex}
                    onSelect={() => select(optionIndex)}
                  />
                </li>
              ))}
        </ul>

        {/* 선택 현황은 버튼 옆이 아니라 목록 바로 아래에 둔다.
            설명하는 대상 옆에 있어야 읽히고, 좁은 화면에서 버튼과 엉키지 않는다.
            한도에 닿았을 때도 안내를 유지한다 — 그때가 설명이 제일 필요한 순간이다.

            live region 은 **내용보다 먼저 DOM 에 있어야** 고지된다. 영역과 첫 텍스트를
            같이 삽입하면 대부분의 스크린리더가 첫 선택을 안 읽고 두 번째부터 읽는다.
            그래서 문항이 뜨는 순간부터 빈 채로 자리를 잡아 둔다. */}
        {isRank && (
          <p aria-live="polite" className="mt-5 min-h-5 text-sm text-slate">
            {picked.length === 0
              ? ""
              : picked.length < question.maxPicks
                ? `${picked.length}개 선택. 더 고르거나 이대로 넘어가도 됩니다`
                : `${question.maxPicks}개 선택 완료. 바꾸려면 하나를 해제하세요`}
          </p>
        )}
      </div>

      {/* 이전은 왼쪽, 다음은 오른쪽 끝. 진행 방향과 버튼 위치를 맞춘다.
          첫 문항엔 이전이 없으므로 justify-between 대신 다음에 ml-auto 를 준다 —
          그래야 혼자 남아도 오른쪽에 붙는다. */}
      <div className="mt-12 flex items-center gap-3 max-sm:mt-8">
        {index > 0 && (
          <button type="button" onClick={() => setIndex(index - 1)} className={buttonClass("secondary")}>
            이전
          </button>
        )}
        {/* 답이 없으면 눌리지 않는다. 숨기지 않는 건 레이아웃이 흔들리지 않게 하려는 것도
            있지만, 다음 칸이 비어 있는 게 "아직 안 골랐다" 를 말해 주기 때문이다. */}
        <button
          type="button"
          onClick={advance}
          disabled={picked.length === 0}
          className={`${buttonClass()} ml-auto`}
        >
          {isLast ? "결과 보기" : "다음"}
        </button>
      </div>
    </div>
  );
}
