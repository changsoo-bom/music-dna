import { SiteHeader } from "@/components/common/SiteHeader";
import { HomeTop } from "@/components/home/HomeTop";
import { Fingerprint } from "@/components/landing/Fingerprint";
import { Hero } from "@/components/landing/Hero";

/**
 * 홈은 두 얼굴이다.
 *
 * 검사 전에는 소개, 검사 후에는 결과. 한 라우트로 두는 건 검사가 끝나면
 * 여기로 돌아오기 때문이다 — `/result` 같은 주소를 따로 두면 그 주소를 직접
 * 열었을 때 결과가 없는 경우를 또 처리해야 한다.
 *
 * `HomeTop` 만 클라이언트다. 소개 마크업은 서버에서 그려 children 으로 넘긴다.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pb-28 max-sm:pb-16">
        <HomeTop>
          <Hero />
          <Fingerprint />
        </HomeTop>
      </main>
    </>
  );
}
