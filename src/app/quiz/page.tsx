import { SiteHeader } from "@/components/common/SiteHeader";

export default function QuizPage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pt-24 max-sm:pt-12">
        <h1 className="text-[clamp(32px,4.4vw,48px)]">성향 검사</h1>
        <p className="mt-5 max-w-[52ch] text-slate">
          아직 만들지 않았습니다. 문항 설계가 끝나면 여기에 붙습니다.
        </p>
      </main>
    </>
  );
}
