import { QuizFlow } from "@/components/quiz/QuizFlow";

export const metadata = {
  title: "성향 검사 · My Music DNA",
  description: "다섯 문항으로 음악 취향을 좌표로 만듭니다.",
};

/**
 * 검사 화면에는 헤더를 두지 않는다.
 *
 * 로고와 네비게이션이 있으면 "둘러보는 페이지" 로 읽힌다. 5문항 1분짜리 흐름은
 * 도중에 나갈 곳을 주는 것보다 **끝까지 가게 두는 쪽**이 맞다.
 * 진행률 막대가 유일한 크롬이고, 나가는 건 브라우저 뒤로가기로 한다.
 */
export default function QuizPage() {
  return (
    <main className="shell pb-28 pt-22 max-sm:pb-16 max-sm:pt-16">
      <QuizFlow />
    </main>
  );
}
