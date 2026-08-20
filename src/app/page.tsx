import { SiteHeader } from "@/components/common/SiteHeader";
import { HomeTop } from "@/components/home/HomeTop";

/**
 * 홈. 검사를 했으면 결과, 안 했으면 검사로 보내는 안내 한 덩어리.
 *
 * 소개 화면(`Hero`·`Fingerprint`)을 걷어냈다. **새로고침할 때마다 한 프레임씩
 * 스쳤기 때문이다** — 서버는 Local Storage 를 못 보므로 항상 소개로 그려지고,
 * 하이드레이션 직후에 결과로 바뀐다. 첫 페인트 전에 숨기는 장치를 붙여 뒀지만
 * 페이지 하나 분량의 마크업이 그 틈으로 계속 새어 나왔다.
 *
 * 결과가 없을 때 남는 것은 "검사하러 가자" 한 줄이면 충분하다.
 * 그 정도 크기는 스쳐도 화면이 흔들리지 않는다.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="shell pb-28 max-sm:pb-16">
        <HomeTop />
      </main>
    </>
  );
}
