import type { Metadata } from "next";
import { ViewTransition } from "react";

import { SearchField } from "@/components/common/SearchField";
import { ArtistCard } from "@/components/search/ArtistCard";
import { SearchList } from "@/components/search/SearchList";
import { ButtonLink } from "@/components/ui/Button";
import { NAV_FORWARD } from "@/constants/nav";
import { searchTracks } from "@/lib/search";
import { searchYoutube } from "@/lib/youtube/search";

/** 사이트 이름은 루트의 `template` 이 붙인다 → `app/layout.tsx` */
export const metadata: Metadata = {
  title: "검색",
};

/** 카탈로그가 이만큼 찾아 주면 밖에 안 나간다. `search.list` 한 번이 100 units 다 */
const ENOUGH = 3;

/** 목록 위 작은 머리글. 두 목록이 어디서 왔는지 말한다 */
function Heading({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mt-12 flex items-baseline justify-between gap-4 border-b border-hair pb-3 max-sm:mt-8">
      <h2 className="text-[19px] font-medium tracking-[-0.01em]">{children}</h2>
      {note && <p className="shrink-0 text-[13px] text-slate">{note}</p>}
    </div>
  );
}

/**
 * 검색 결과. 헤더의 필드가 여기로 보낸다.
 *
 * **찾는 말은 `searchParams` 로 받는다**(`?q=새소년`). 클라이언트 state 로
 * 들고 있으면 뒤로가기가 검색어를 안 되돌리고, 링크를 보내도 상대는 빈 화면을
 * 본다 → `.claude/rules/state.md`
 *
 * ## 카탈로그가 먼저다
 *
 * **카탈로그에서 충분히 찾으면 밖에 안 나간다.** 카탈로그 178곡은 공짜고
 * `search.list` 는 한 번에 100 units, 하루 100번이다 — 사이트 전체가 쓰는
 * 하루치를 "이미 갖고 있는 곡" 을 찾는 데 태울 이유가 없다.
 *
 * 밖에 나가는 건 **카탈로그가 세 곡도 못 찾았을 때뿐이다.** 그때는 사람이
 * 우리가 모르는 곡을 찾는 중이고, 그게 이 기능이 있는 이유다.
 *
 * 할당량이 말라도 **카탈로그 결과는 그대로 뜬다** — `searchYoutube` 는 던지지
 * 않고 상태를 돌려주고, 화면은 그 사정을 한 줄로 말한다. 예상 못 한 실패는
 * `error.tsx` 가 받는다 → `.claude/rules/data.md` 의 "외부 API 실패는 국소화"
 *
 * ## 전체보기와 다른 화면인 이유
 *
 * 저기는 색인으로 둘러보는 자리고 여기는 이름을 알고 찾아온 자리다. 한 화면에
 * 겹치면 필터가 셋(지역·장르·검색어)이 되는데 그중 하나가 나머지 둘을
 * 무의미하게 만든다 — 곡 이름을 정확히 친 사람에게 장르 색인은 볼 것이 없다.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").trim();

  const mine = searchTracks(query);
  // **밖에 나가는 조건이 한 줄이다.** 조건이 흩어지면 어느 날 빈 검색어에도
  // 100 units 이 나간다
  const remote = query && mine.length < ENOUGH ? await searchYoutube(query) : null;

  const artist = remote?.status === "artist" ? remote.artist : null;
  const found = remote?.status === "artist" || remote?.status === "tracks" ? remote.tracks : [];
  const nothing = query && mine.length === 0 && found.length === 0;

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
              {query ? `“${query}” ${mine.length + found.length}곡` : "무엇을 찾으시나요"}
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
              곡 이름이나 아티스트를 치면 먼저 카탈로그에서 찾고, 없으면 YouTube 에서 찾아옵니다.
              대소문자와 띄어쓰기는 가리지 않습니다.
            </p>
          )}

          {artist && <ArtistCard artist={artist} />}

          {mine.length > 0 && (
            <>
              {/* 밖에서도 찾아왔을 때만 어느 목록인지 말한다. 하나뿐이면
                  머리글이 페이지 제목과 같은 말을 두 번 하는 셈이다 */}
              {found.length > 0 && <Heading note="담을 수 있습니다">카탈로그</Heading>}
              <SearchList tracks={mine} />
            </>
          )}

          {found.length > 0 && (
            <>
              <Heading note={artist ? "이 채널의 최신 곡" : "담을 수 없습니다"}>
                {artist ? artist.name : "YouTube 에서"}
              </Heading>
              <SearchList tracks={found} queueId="search:remote" />
            </>
          )}

          {/* **밖에 나갔다가 못 가져온 경우를 구별해서 말한다.** 셋 다 "결과
              없음" 으로 뭉뚱그리면, 다시 눌러 보면 되는 상황과 소용없는 상황이
              같은 얼굴이 된다 */}
          {remote?.status === "quota" && (
            <p className="mt-10 max-w-[52ch] text-sm text-slate max-sm:mt-6">
              오늘 YouTube 에서 찾아볼 수 있는 횟수를 다 썼습니다. 카탈로그 결과만 보여 드립니다 —
              내일 다시 찾아보실 수 있습니다.
            </p>
          )}
          {remote?.status === "failed" && (
            <p className="mt-10 max-w-[52ch] text-sm text-slate max-sm:mt-6">
              YouTube 에서 찾아오지 못했습니다. 카탈로그 결과만 보여 드립니다.
            </p>
          )}

          {/* **찾는 것이 있어서 온 사람에게 빈 목록만 남기지 않는다.**
              여기서 막히면 갈 곳이 없는데, 둘러보는 화면은 옆에 있다 */}
          {nothing && (
            <div className="mt-10 max-sm:mt-6">
              <p className="text-[22px] font-medium tracking-[-0.02em]">찾는 곡이 없습니다</p>
              <p className="mt-4 max-w-[46ch] text-sm text-slate">
                이름의 일부만 쳐 보거나, 전체보기에서 둘러보세요.
              </p>
              <ButtonLink href="/browse" transitionTypes={NAV_FORWARD} variant="text" className="mt-6">
                전체보기로 가기
              </ButtonLink>
            </div>
          )}
        </section>
      </main>
    </ViewTransition>
  );
}
