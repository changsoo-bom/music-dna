import type { Metadata } from "next";
import { ViewTransition } from "react";

import { BrowseList } from "@/components/browse/BrowseList";
import { BrowseTabs } from "@/components/browse/BrowseTabs";
import { GENRES } from "@/constants/genres";
import { toRegion } from "@/constants/regions";
import type { Genre } from "@/types/music";

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
 *
 * **좁히는 값은 `searchParams` 로 받는다**(`?region=kr&genre=rock`).
 * 클라이언트 state 로 들고 있으면 뒤로가기가 탭을 안 되돌리고, 링크를
 * 보내도 상대는 전체 화면을 본다 → `.claude/rules/state.md`
 *
 * 주소는 사람이 고칠 수 있으므로 **아는 값만 통과시킨다.** 모르는 값은
 * 던지지 않고 "전체" 로 떨어진다 — `/browse?genre=jazz` 가 500 이 될 이유가
 * 없다. 이 화면에서 유일한 신뢰 경계다.
 */
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const region = toRegion(params.region);
  const genre = GENRES.some((item) => item.id === params.genre)
    ? (params.genre as Genre)
    : null;

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          {/* **제목이 없다.** "지금 들을 수 있는 109곡" 이 있던 자리인데,
              탭이 들어오면서 그 문장이 하는 일을 탭 줄이 한다 — 무엇을 고를
              수 있는지가 곧 여기에 무엇이 있는지다. 곡 수는 골라 놓은 칸
              아래에서 말한다(`BrowseList`) */}
          <span className="eyebrow text-ink">전체보기</span>
          <BrowseTabs region={region} genre={genre} />
          <BrowseList region={region} genre={genre} />
        </section>
      </main>
    </ViewTransition>
  );
}
