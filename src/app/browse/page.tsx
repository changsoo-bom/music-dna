import type { Metadata } from "next";

import { BrowseList } from "@/components/browse/BrowseList";
import type { BrowseGroup } from "@/components/browse/BrowseList";
import { SiteFooter } from "@/components/common/SiteFooter";
import { SiteHeader } from "@/components/common/SiteHeader";
import { GENRES, PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";

export const metadata: Metadata = {
  title: "전체보기",
};

/**
 * 카탈로그를 상위 장르로 묶는다. **서버에서, 모듈 로드 때 한 번.**
 *
 * 카탈로그는 저장소에 커밋된 정적 데이터라 요청마다 다시 묶을 이유가 없고,
 * 검사 결과와도 무관하다 — 이 페이지가 정적으로 프리렌더되는 이유다.
 * 사람마다 다른 것은 보관함 표시와 재생 상태뿐이고, 그건 `BrowseList` 가 본다.
 */
const GROUPS: readonly BrowseGroup[] = GENRES.map((genre) => ({
  genre: genre.id,
  label: genre.label,
  tracks: CATALOG.filter((track) => PARENT_OF[track.subGenre] === genre.id),
})).filter((group) => group.tracks.length > 0);

/**
 * 전체보기. 헤더의 두 칸 중 하나이고, 검사를 안 한 사람도 볼 수 있는 유일한
 * 곡 목록이다 — 추천은 검사 결과가 있어야 나온다.
 */
export default function BrowsePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">전체보기</span>
          <h1 className="mt-5 mb-14 text-[clamp(28px,3.4vw,40px)] leading-[1.1] max-sm:mb-10">
            지금 들을 수 있는 {CATALOG.length}곡
          </h1>
          <BrowseList groups={GROUPS} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
