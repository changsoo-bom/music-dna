"use client";

import { useState } from "react";

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
  // 선택지 모양은 축마다 다르지만 `label` 은 셋 다 갖는다.
  // 유니온 배열에 바로 .map 을 걸면 시그니처가 안 맞으므로 좁혀서 받는다.
  const options: readonly { label: string }[] = question.options;
  const picked = answers[question.id];

  function choose(optionIndex: number) {
    const next = { ...answers, [question.id]: optionIndex };
    setAnswers(next);

    if (index + 1 < QUESTIONS.length) {
      setIndex(index + 1);
      return;
    }

    // 마지막 문항. 계산은 순수 함수이고, 저장은 이벤트 핸들러 안에서 끝낸다 —
    // useEffect 에서 하면 React Compiler 의 set-state-in-effect 와 부딪힌다.
    const preference = computePreference(next, new Date().toISOString());
    window.localStorage.setItem(STORAGE_KEYS.preference, JSON.stringify(preference));
    setResult(preference);
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <QuizProgress current={index + 1} total={QUESTIONS.length} />

      {/* key 로 리마운트해서 진입 애니메이션을 다시 태운다 */}
      <div key={question.id} className="q-enter mt-16 max-sm:mt-10">
        <h1 className="text-[clamp(28px,4vw,44px)] leading-[1.15]">{question.prompt}</h1>

        <ul className="mt-12 flex flex-col gap-3 max-sm:mt-8">
          {options.map((option, optionIndex) => {
            const selected = picked === optionIndex;
            return (
              <li key={option.label}>
                <button
                  type="button"
                  onClick={() => choose(optionIndex)}
                  aria-pressed={selected}
                  className={`group flex w-full items-center gap-5 px-6 py-5 text-left text-[17px] font-medium tracking-[-0.01em] rounded-btn border-[1.5px] transition-colors max-sm:px-5 max-sm:text-base ${
                    selected
                      ? "border-ink bg-ink text-canvas"
                      : "border-hair bg-lifted text-ink hover:border-ink"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`grid h-8 w-8 shrink-0 place-items-center text-sm tabular-nums rounded-full border transition-colors ${
                      selected ? "border-canvas" : "border-hair group-hover:border-ink"
                    }`}
                  >
                    {optionIndex + 1}
                  </span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {index > 0 && (
        <button type="button" onClick={() => setIndex(index - 1)} className={`${buttonClass("secondary")} mt-10`}>
          이전 문항
        </button>
      )}
    </div>
  );
}
