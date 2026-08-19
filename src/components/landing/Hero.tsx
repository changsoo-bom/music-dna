import { ButtonLink } from "@/components/ui/Button";

/**
 * 서비스 정체성을 전달하고 검사를 시작시키는 것 하나만 한다.
 * 복잡한 정보를 여기 두지 않는다.
 *
 * **검사를 안 한 사람만 이걸 본다.** 결과가 있으면 HomeTop 이 DnaSummary 로
 * 갈아 끼운다 — 그래서 "이어서 보기" 같은 분기가 여기 없다.
 */
export function Hero() {
  return (
    <section className="pt-24 max-lg:pt-16 max-sm:pt-10">
      <div className="grid grid-cols-[1.25fr_0.75fr] gap-x-20 items-end max-lg:grid-cols-1 max-lg:gap-y-8">
        <h1 className="text-[clamp(38px,5.6vw,64px)] leading-[1.04]">
          What does your music
          <br />
          say about you?
        </h1>

        <div>
          <p className="max-w-[38ch] text-slate">
            당신이 듣는 음악에는
            <br />
            당신도 몰랐던 취향의 패턴이 있습니다.
          </p>
          <div className="mt-7">
            <ButtonLink href="/quiz">Discover My Music DNA</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
