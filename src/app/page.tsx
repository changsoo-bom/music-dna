import { ViewTransition } from "react";

import { SiteFooter } from "@/components/common/SiteFooter";
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
 *
 * **전환 래퍼는 레이아웃이 아니라 여기에 둔다.** 레이아웃은 라우트가 바뀌어도
 * 살아남아서 enter/exit 가 아예 안 걸린다. 애니메이션 정의는 `globals.css`.
 */
export default function HomePage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <main className="shell flex-1 pb-28 max-sm:pb-16">
          <HomeTop />
        </main>
        {/* 루트 레이아웃이 아니라 여기서 붙인다. 검사 화면에는 헤더도 푸터도 없다 */}
        <SiteFooter />
      </div>
    </ViewTransition>
  );
}
