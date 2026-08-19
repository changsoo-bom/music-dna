"use client";

import { useState } from "react";

import { QuizOption } from "@/components/quiz/QuizOption";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizResult } from "@/components/quiz/QuizResult";
import { buttonClass } from "@/components/ui/Button";
import { QUESTIONS } from "@/lib/quiz/questions";
import { computePreference } from "@/lib/quiz/scoring";
import { STORAGE_KEYS } from "@/lib/storage-keys";
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
    window.localStorage.setItem(STORAGE_KEYS.preference, JSON.stringify(preference));
    setResult(preference);
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <QuizProgress current={index + 1} total={QUESTIONS.length} />

      {/* key 로 리마운트해서 진입 애니메이션을 다시 태운다 */}
      <div key={question.id} className="q-enter mt-16 max-sm:mt-10">
        <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.15]">{question.prompt}</h1>
        {isRank && <p className="mt-4 text-base text-slate">{question.hint}</p>}

        {/* 그림자가 서로 겹치면 탁해진다. 테두리일 때보다 간격을 벌린다 */}
        <ul className="mt-12 flex flex-col gap-4 max-sm:mt-8">
          {isRank
            ? question.options.map((option, optionIndex) => {
                const rank = picked.indexOf(optionIndex);
                return (
                  <li key={option.label}>
                    <QuizOption
                      label={option.label}
                      sub={option.sub}
                      badge={rank >= 0 ? String(rank + 1) : "+"}
                      selected={rank >= 0}
                      onClick={() => toggleRank(optionIndex, question.maxPicks)}
                    />
                  </li>
                );
              })
            : question.options.map((option, optionIndex) => (
                <li key={option.label}>
                  <QuizOption
                    label={option.label}
                    badge={String(optionIndex + 1)}
                    selected={picked[0] === optionIndex}
                    onClick={() => select(optionIndex)}
                  />
                </li>
              ))}
        </ul>

        {/* 선택 현황은 버튼 옆이 아니라 목록 바로 아래에 둔다.
            설명하는 대상 옆에 있어야 읽히고, 좁은 화면에서 버튼과 엉키지 않는다. */}
        {isRank && picked.length > 0 && picked.length < question.maxPicks && (
          <p className="mt-5 text-sm text-slate">
            {picked.length}개 선택 — 더 고르거나 이대로 넘어가도 됩니다
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
