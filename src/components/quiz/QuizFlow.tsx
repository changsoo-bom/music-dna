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

  if (result) return <QuizResult preference={result} />;

  const question = QUESTIONS[index];
  const picked = answers[question.id] ?? [];
  const isLast = index + 1 === QUESTIONS.length;

  function advance(next: QuizAnswers) {
    setAnswers(next);

    if (!isLast) {
      setIndex(index + 1);
      return;
    }

    // 계산은 순수 함수이고, 저장은 이벤트 핸들러 안에서 끝낸다 —
    // useEffect 에서 하면 React Compiler 의 set-state-in-effect 와 부딪힌다.
    const preference = computePreference(next, new Date().toISOString());
    window.localStorage.setItem(STORAGE_KEYS.preference, JSON.stringify(preference));
    setResult(preference);
  }

  /** 순위 문항: 누르면 담기고 다시 누르면 빠진다. 다 채우면 알아서 넘어간다 */
  function toggleRank(optionIndex: number, maxPicks: number) {
    const next = picked.includes(optionIndex)
      ? picked.filter((i) => i !== optionIndex)
      : [...picked, optionIndex];

    if (next.length === maxPicks) {
      advance({ ...answers, [question.id]: next });
      return;
    }
    setAnswers({ ...answers, [question.id]: next });
  }

  const isRank = question.axis === "genre";

  return (
    <div className="mx-auto max-w-[720px]">
      <QuizProgress current={index + 1} total={QUESTIONS.length} />

      {/* key 로 리마운트해서 진입 애니메이션을 다시 태운다 */}
      <div key={question.id} className="q-enter mt-16 max-sm:mt-10">
        <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.15]">{question.prompt}</h1>
        {isRank && <p className="mt-4 text-base text-slate">{question.hint}</p>}

        <ul className="mt-12 flex flex-col gap-3 max-sm:mt-8">
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
                    onClick={() => advance({ ...answers, [question.id]: [optionIndex] })}
                  />
                </li>
              ))}
        </ul>
      </div>

      <div className="mt-10 flex gap-3">
        {index > 0 && (
          <button type="button" onClick={() => setIndex(index - 1)} className={buttonClass("secondary")}>
            이전
          </button>
        )}
        {/* 순위 문항은 3개를 다 안 골라도 넘어갈 수 있다.
            한 장르만 듣는 사람에게 억지로 2·3위를 만들게 하지 않는다. */}
        {isRank && picked.length > 0 && picked.length < question.maxPicks && (
          <button
            type="button"
            onClick={() => advance({ ...answers, [question.id]: picked })}
            className={buttonClass()}
          >
            {picked.length}개로 계속
          </button>
        )}
      </div>
    </div>
  );
}
