import type { Metadata } from "next";
import { ViewTransition } from "react";

import { LibraryList } from "@/components/library/LibraryList";

export const metadata: Metadata = {
  title: "보관함",
};

/**
 * 보관함. 담은 곡을 모아 보는 한 덩어리뿐이라 라우트는 조립만 한다.
 *
 * 전환 래퍼는 홈·검사와 같은 모양이다 — **양쪽 다 감싸야 나가는 화면과
 * 들어오는 화면이 짝을 이룬다.** 한쪽만 감싸면 반쪽만 움직인다.
 * 감싸는 것은 `<main>` 뿐이다: 헤더와 푸터는 `(site)` 레이아웃에 있고
 * 이동해도 안 죽는다.
 */
export default function LibraryPage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">보관함</span>
          <h1 className="mt-5 text-[clamp(28px,3.4vw,40px)] leading-[1.1]">담아 둔 곡</h1>
          <LibraryList />
        </section>
      </main>
    </ViewTransition>
  );
}
