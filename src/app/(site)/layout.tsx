import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";

/**
 * 헤더와 푸터를 두르는 껍데기. 홈·전체보기·보관함이 여기 산다.
 *
 * **검사 화면은 이 그룹 밖이다**(`app/quiz`). 로고와 네비게이션이 있으면
 * "둘러보는 페이지" 로 읽히고, 5문항 1분짜리 흐름은 도중에 나갈 곳을 여러 개
 * 주는 것보다 끝까지 가게 두는 쪽이 맞다. 괄호 그룹이라 주소에는 안 나온다.
 *
 * **셋이 이 파일을 같이 쓰는 이유는 헤더가 안 죽어야 해서다.** 페이지마다
 * `<SiteHeader />` 를 따로 그리면 라우트가 바뀔 때마다 헤더가 언마운트되고,
 * `.header-drop` 이 다시 돌아 매번 위에서 떨어진다 — 페이지가 넘어가는 게
 * 아니라 사이트가 다시 열리는 것처럼 보인다. 레이아웃은 이동해도 살아남으므로
 * 그 애니메이션은 처음 한 번만 돈다.
 *
 * 전환 애니메이션은 각 `page.tsx` 가 자기 `<main>` 만 감싼다 — 움직이는 것은
 * 본문이고 헤더는 그 자리에 남는다. → `globals.css` 의 `.header-drop`
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
