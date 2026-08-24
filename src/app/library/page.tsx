import type { Metadata } from "next";

import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { LibraryList } from "@/components/library/LibraryList";

export const metadata: Metadata = {
  title: "보관함",
};

/**
 * 보관함. 담은 곡을 모아 보는 한 덩어리뿐이라 라우트는 조립만 한다.
 *
 * 홈과 달리 `ViewTransition` 을 안 감싼다 — 전환 애니메이션은 검사 흐름의
 * 앞뒤(`nav-forward`/`nav-back`)를 말하는 장치고, 헤더로 오가는 페이지에
 * 붙이면 방향이 없는 이동에 방향을 붙이게 된다.
 */
export default function LibraryPage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">보관함</span>
          <h1 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">담아 둔 곡</h1>
          <LibraryList />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
