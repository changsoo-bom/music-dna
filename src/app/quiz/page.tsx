import { ViewTransition } from "react";

import { QuizFlow } from "@/components/quiz/QuizFlow";

export const metadata = {
  title: "성향 검사",
  description: "다섯 문항으로 음악 취향을 좌표로 만듭니다.",
};

/**
 * 검사 화면에는 헤더도 푸터도 두지 않는다.
 *
 * 로고와 네비게이션이 있으면 "둘러보는 페이지" 로 읽힌다. 5문항 1분짜리 흐름은
 * 도중에 나갈 곳을 여러 개 주는 것보다 **끝까지 가게 두는 쪽**이 맞다.
 * 나가는 문은 진행률 막대 위의 화살표 하나뿐이다. → `QuizFlow`
 *
 * 전환 래퍼는 홈과 같은 모양이다 — 양쪽 다 감싸야 나가는 화면과 들어오는
 * 화면이 짝을 이룬다. 한쪽만 감싸면 반쪽만 움직인다.
 */
export default function QuizPage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 pt-10 max-sm:pb-16 max-sm:pt-6">
        <QuizFlow />
      </main>
    </ViewTransition>
  );
}
