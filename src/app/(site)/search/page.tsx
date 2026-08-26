import type { Metadata } from "next";
import { ViewTransition } from "react";

import { SearchField } from "@/components/common/SearchField";
import { SearchList } from "@/components/search/SearchList";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_FORWARD } from "@/constants/nav";
import { searchTracks } from "@/lib/search";

/** 사이트 이름은 루트의 `template` 이 붙인다 → `app/layout.tsx` */
export const metadata: Metadata = {
  title: "검색",
};

/**
 * 검색 결과. 헤더의 필드가 여기로 보낸다.
 *
 * **찾는 말은 `searchParams` 로 받는다**(`?q=새소년`). 클라이언트 state 로
 * 들고 있으면 뒤로가기가 검색어를 안 되돌리고, 링크를 보내도 상대는 빈 화면을
 * 본다 → `.claude/rules/state.md`
 *
 * **전체보기와 다른 화면인 이유.** 저기는 색인으로 둘러보는 자리고 여기는
 * 이름을 알고 찾아온 자리다. 둘을 한 화면에 겹치면 필터가 셋(지역·장르·검색어)이
 * 되는데, 그중 하나는 나머지 둘을 무의미하게 만든다 — 곡 이름을 정확히 친
 * 사람에게 장르 색인은 볼 것이 없다.
 *
 * 머리글이 지금 보고 있는 것을 말한다 — `"새소년" 3곡`. 페이지의 닻이자
 * 검색의 결과라 한 줄이 두 가지 일을 한다 → `app/(site)/browse/page.tsx`
 *
 * 전환 래퍼는 다른 화면과 같은 모양이다. 감싸는 것은 `<main>` 뿐이다:
 * 헤더와 푸터는 `(site)` 레이아웃에 있고 이동해도 안 죽는다.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();
  const tracks = searchTracks(query);

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">검색</span>

          <div className="mt-5 flex items-end justify-between gap-6 border-b border-hair pb-7 max-md:flex-col max-md:items-stretch max-md:gap-5">
            <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.1] tabular-nums">
              {query ? `“${query}” ${tracks.length}곡` : "무엇을 찾으시나요"}
            </h1>

            {/* **이 화면에도 필드가 있다.** 결과를 보다 검색어를 고치는 자리가
                여기라, 헤더까지 올라갔다 오게 하지 않는다. 좁은 화면에서는
                헤더에 필드가 아예 없으므로(`SiteHeader`) 여기가 유일한 입구다.

                `key` 로 리마운트시킨다 — 비제어 입력이라 주소가 바뀌어도
                `defaultValue` 가 안 따라온다. 뒤로가기로 이전 검색어에 돌아왔을
                때 칸에는 방금 친 말이 남아 있으면, 화면과 칸이 다른 말을 한다.
                effect 로 값을 되돌리지 말라는 `.claude/rules/react.md` 가
                지정한 도구가 `key` 다 */}
            <SearchField key={query} query={query} className="w-72 max-md:w-full" />
          </div>

          {!query && (
            <p className="mt-10 max-w-[46ch] text-sm text-slate max-sm:mt-6">
              곡 이름이나 아티스트를 치면 카탈로그에서 찾습니다. 대소문자와 띄어쓰기는 가리지
              않습니다.
            </p>
          )}

          {/* **찾는 것이 있어서 온 사람에게 빈 목록만 남기지 않는다.**
              여기서 막히면 갈 곳이 없는데, 둘러보는 화면은 옆에 있다 */}
          {query && tracks.length === 0 && (
            <div className="mt-10 max-sm:mt-6">
              <p className="text-[22px] font-medium tracking-[-0.02em]">찾는 곡이 없습니다</p>
              <p className="mt-4 max-w-[46ch] text-sm text-slate">
                카탈로그를 배치로 채우는 중이라 아직 안 들어온 곡일 수 있습니다. 이름의 일부만
                쳐 보거나, 전체보기에서 둘러보세요.
              </p>
              <ButtonLink href="/browse" transitionTypes={NAV_FORWARD} variant="text" className="mt-6">
                전체보기로 가기
              </ButtonLink>
            </div>
          )}

          {tracks.length > 0 && <SearchList tracks={tracks} />}
        </section>
      </main>
    </ViewTransition>
  );
}
