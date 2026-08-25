import type { Metadata } from "next";
import { ViewTransition } from "react";

import { BrowseList } from "@/components/browse/BrowseList";
import { GenreRail } from "@/components/browse/GenreRail";
import type { RailItem } from "@/components/browse/GenreRail";
import { RegionSwitch } from "@/components/browse/RegionSwitch";
import { GENRES } from "@/constants/genres";
import { REGIONS, toRegion } from "@/constants/regions";
import { browseGroups } from "@/lib/browse";
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
 * 여기서 `browseGroups` 를 부르는 것은 **수를 세기 위해서고**, 페이로드에
 * 실려 가는 것은 그 수뿐이다.
 *
 * **머리글이 지금 보고 있는 것을 말한다.** 한때 "지금 들을 수 있는 109곡" 이
 * 박혀 있었는데, 그 문장은 무엇을 걸러 놓든 늘 같은 말을 했다. 지금은
 * 고른 값이 제목이 된다 — "국내 Rock 6곡". 페이지의 닻이자 필터의 결과라,
 * 한 줄이 두 가지 일을 한다.
 *
 * **좁히는 값은 `searchParams` 로 받는다**(`?region=kr&genre=rock`).
 * 클라이언트 state 로 들고 있으면 뒤로가기가 색인을 안 되돌리고, 링크를
 * 보내도 상대는 전체 화면을 본다 → `.claude/rules/state.md`
 *
 * 주소는 사람이 고칠 수 있으므로 **아는 값만 통과시킨다.** 모르는 값은
 * 던지지 않고 "전체" 로 떨어진다 — `/browse?genre=jazz` 가 500 이 될 이유가
 * 없다. 이 화면에서 유일한 신뢰 경계다.
 *
 * 전환 래퍼는 홈·검사와 같은 모양이다 — **양쪽 다 감싸야 나가는 화면과
 * 들어오는 화면이 짝을 이룬다.** 감싸는 것은 `<main>` 뿐이다: 헤더와 푸터는
 * `(site)` 레이아웃에 있고 이동해도 안 죽는다.
 */
export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const region = toRegion(params.region);
  const genre = GENRES.some((item) => item.id === params.genre) ? (params.genre as Genre) : null;

  /* 색인의 곡 수는 **지역만 반영한 값이다.** 장르까지 반영하면 고른 칸만
     제 수를 갖고 나머지가 0 이 되어, 색인이 "어디에 무엇이 있는지" 를 더는
     말하지 않는다. 옆으로 옮겨 갈 곳을 보여주는 것이 색인의 일이다. */
  const byGenre = browseGroups(region, null);
  const total = byGenre.reduce((sum, group) => sum + group.tracks.length, 0);
  const rail: RailItem[] = [
    { id: null, label: "전체", count: total },
    ...byGenre.map((group) => ({ id: group.genre, label: group.label, count: group.tracks.length })),
  ];

  const shown = genre ? (byGenre.find((group) => group.genre === genre)?.tracks.length ?? 0) : total;
  const title = [
    REGIONS.find((item) => item.id === region)?.label,
    GENRES.find((item) => item.id === genre)?.label,
    `${shown}곡`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">전체보기</span>

          {/* 제목과 가장 큰 갈래가 한 줄을 나눠 쓴다. `items-end` 라 큰 제목의
              밑변과 스위치의 밑변이 같은 선에 놓인다. 아래 헤어라인이 머리글과
              목록을 가른다 — 이 줄이 페이지의 머리라는 표시다 */}
          <div className="mt-5 flex items-end justify-between gap-6 border-b border-hair pb-7 max-md:flex-col max-md:items-stretch max-md:gap-5">
            <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.1] tabular-nums">{title}</h1>
            <div className="max-md:self-start">
              <RegionSwitch region={region} genre={genre} />
            </div>
          </div>

          {/* 왼쪽이 색인, 오른쪽이 목록. 좁은 화면에서는 색인이 위로 눕는다 */}
          <div className="mt-10 grid grid-cols-[10rem_1fr] gap-x-12 max-lg:grid-cols-1 max-lg:gap-x-0 max-lg:gap-y-8 max-sm:mt-6">
            <GenreRail items={rail} region={region} genre={genre} />
            <BrowseList region={region} genre={genre} />
          </div>
        </section>
      </main>
    </ViewTransition>
  );
}
