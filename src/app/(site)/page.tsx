import { cookies } from "next/headers";
import { ViewTransition } from "react";

import { HomeIntro } from "@/components/home/HomeIntro";
import { HomeTop } from "@/components/home/HomeTop";
import { PREFERENCE_COOKIE, decodePreferenceCookie } from "@/lib/preference-cookie";

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
 *
 * `cookies()` 를 부르는 순간 이 라우트는 정적 프리렌더에서 빠진다. **그게
 * 맞다** — 사람마다 다른 결과를 그리는 페이지를 빌드 시점에 한 장으로 굳혀
 * 두면 그 한 장은 누구의 것도 아니다. 대신 첫 HTML 에 결과가 들어 있어서
 * 빈 화면이 번쩍이던 구간이 사라진다. → `src/lib/preference-cookie.ts`
 */
export default async function HomePage() {
  const serverRaw = decodePreferenceCookie((await cookies()).get(PREFERENCE_COOKIE)?.value);

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        {/* 검사 전 화면을 **여기서 만들어 넘긴다.** `HomeTop` 은 저장소를
            읽어야 해서 클라이언트인데, 소개 화면에는 읽을 것이 없고 카탈로그
            178곡을 그리는 차트가 들어 있다 — 안에서 만들면 그 카탈로그가
            클라이언트 번들에 실린다 → `HomeIntro` */}
        <HomeTop serverRaw={serverRaw}>
          <HomeIntro />
        </HomeTop>
      </main>
    </ViewTransition>
  );
}
