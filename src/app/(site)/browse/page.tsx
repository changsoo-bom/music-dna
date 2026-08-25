import type { Metadata } from "next";
import { ViewTransition } from "react";

import { BrowseList } from "@/components/browse/BrowseList";
import { CATALOG } from "@/data/catalog";

export const metadata: Metadata = {
  title: "전체보기",
};

/**
 * 전체보기. 헤더의 두 칸 중 하나이고, 검사를 안 한 사람도 볼 수 있는 유일한
 * 곡 목록이다 — 추천은 검사 결과가 있어야 나온다.
 *
 * **곡 목록을 prop 으로 안 넘긴다.** 여기서 묶어 넘기면 카탈로그가 두 번
 * 실린다 — `BrowseList` 는 재생 스토어를 통해 이미 그 데이터를 클라이언트
 * 번들에 갖고 있는데, RSC 페이로드로 같은 109곡이 또 직렬화된다.
 * 묶는 일은 그 파일의 모듈 스코프에 있다.
 *
 * 전환 래퍼는 홈·검사와 같은 모양이다 — **양쪽 다 감싸야 나가는 화면과
 * 들어오는 화면이 짝을 이룬다.** 감싸는 것은 `<main>` 뿐이다: 헤더와 푸터는
 * `(site)` 레이아웃에 있고 이동해도 안 죽는다.
 */
export default function BrowsePage() {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">전체보기</span>
          <h1 className="mt-5 mb-14 text-[clamp(28px,3.4vw,40px)] leading-[1.1] max-sm:mb-10">
            지금 들을 수 있는 {CATALOG.length}곡
          </h1>
          <BrowseList />
        </section>
      </main>
    </ViewTransition>
  );
}
