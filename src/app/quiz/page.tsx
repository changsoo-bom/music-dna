import { SiteHeader } from "@/components/common/SiteHeader";
import { QuizFlow } from "@/components/quiz/QuizFlow";

export const metadata = {
  title: "성향 검사 · My Music DNA",
  description: "14개 문항으로 음악 취향을 좌표로 만듭니다.",
};

export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pb-28 pt-20 max-sm:pb-16 max-sm:pt-12">
        <QuizFlow />
      </main>
    </>
  );
}
