import type { Metadata } from "next";
import { ViewTransition } from "react";

import { SearchField } from "@/components/common/SearchField";
import { ArtistCard } from "@/components/search/ArtistCard";
import { SearchList } from "@/components/search/SearchList";
import { ButtonLink } from "@/components/ui/Button";
import { SUB_GENRES } from "@/constants/genres";
import { NAV_FORWARD } from "@/constants/nav";
import { REGIONS } from "@/constants/regions";
import { readableCount } from "@/lib/format";
import { catalogArtist, searchTracks } from "@/lib/search";
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
 * ## 둘러보기와 다른 화면인 이유
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

  // 친 말이 우리 카탈로그에 있는 가수인가 → `catalogArtist`
  const own = catalogArtist(query);

  /* **검색어에 걸렸지만 그 사람 곡은 아닌 것.** 보통 비어 있지만 이름이
     이름으로 시작하는 경우가 있다 — `경서` 를 치면 `경서예지` 도 걸린다.
     그때 카드는 "1곡" 인데 아래에 두 줄이 서므로, 나머지가 남의 곡임을
     화면이 말하지 않으면 **그 곡이 이 가수의 곡으로 읽힌다.** 카드가 `h1`
     이라 더 그렇다 */
  const rest = own ? mine.filter((track) => track.artist !== own.name) : [];


  /* 카드가 말할 한 줄. **카탈로그가 아는 것만 적는다.**

     장르는 **가수의 곡 전부가 같은 하위 장르일 때만** 적는다. 카탈로그가
     손으로 적어 둔 것은 *곡의* 장르지 *가수의* 장르가 아니다 — Daft Punk 는
     펑크·하우스·신스팝 셋에 걸쳐 있고, 첫 곡을 대표로 세우면 화면이 그
     사람을 "펑크" 라고 부른다. 게다가 `catalog.ts` 의 줄 순서가 바뀌면
     그 값이 조용히 달라진다. 갈리는 가수가 지금 다섯이다(이문세·실리카겔·
     아이유·Daft Punk·검정치마). 모르면 안 적는 편이 낫다 — `.filter(Boolean)`
     이 그 줄을 접는다.

     지역은 안전하다. 한 가수가 국내와 해외에 동시에 있지 않다.

     사진 자리에는 첫 곡의 썸네일을 쓴다: 가수 사진은 카탈로그에 없고,
     지어내는 대신 그 사람의 것 중에 우리가 가진 것을 놓는다 */
  const ownCover = own?.tracks.find((track) => track.youtubeId)?.youtubeId;
  const ownGenres = new Set(own?.tracks.map((track) => track.subGenre));
  const ownMeta = own
    ? [
        `${own.tracks.length}곡`,
        REGIONS.find((region) => region.id === own.tracks[0].region)?.label,
        ownGenres.size === 1 ? SUB_GENRES[own.tracks[0].subGenre].ko : undefined,
      ]
        .filter(Boolean)
        .join(" · ")
    : undefined;

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <span className="eyebrow text-ink">검색</span>

          {/* **이 화면에서는 칸이 여기 하나다.** 헤더 것은 스스로 접는다
              (`hideOnResults`) — 헤더는 레이아웃에 살아서 `?q=` 를 모르므로
              거기 남겨 두면 결과를 보는 내내 빈 칸이 서 있고, `아이유` 를
              `아이유 밤편지` 로 좁히려면 처음부터 다시 쳐야 한다. 지금 찾고
              있는 말을 물고 있을 수 있는 것은 이쪽뿐이다.

              `key` 로 리마운트시킨다 — 비제어 입력이라 주소가 바뀌어도
              `defaultValue` 가 안 따라온다. 뒤로가기로 이전 검색어에 돌아왔을
              때 칸에는 방금 친 말이 남아 있으면, 화면과 칸이 다른 말을 한다.
              effect 로 값을 되돌리지 말라는 `.claude/rules/react.md` 가
              지정한 도구가 `key` 다 */}
          <SearchField key={query} query={query} className="mt-5 w-72 max-md:w-full" />

          {/* **사람을 찾아왔으면 화면 맨 위가 그 사람이다.** 카탈로그가 아는
              가수가 먼저다 — 우리가 손으로 적은 값이라 틀릴 수가 없고, 밖에서
              찾아온 채널은 쏠림으로 미루어 짐작한 것이다(`classify`).
              그 채널의 곡은 아래 목록에 그대로 선다 */}
          {own ? (
            <ArtistCard
              name={own.name}
              thumbnail={ownCover && `https://i.ytimg.com/vi/${ownCover}/mqdefault.jpg`}
              meta={ownMeta}
            />
          ) : artist ? (
            <ArtistCard
              name={artist.name}
              thumbnail={artist.thumbnail}
              meta={
                artist.subscribers === undefined
                  ? undefined
                  : `구독자 ${readableCount(artist.subscribers)}`
              }
              about={artist.about}
            />
          ) : (
            <div className="mt-5 border-b border-hair pb-7">
              <h1 className="text-[clamp(28px,3.4vw,40px)] leading-[1.1] tabular-nums">
                {query ? `“${query}” ${mine.length + found.length}곡` : "무엇을 찾으시나요"}
              </h1>
            </div>
          )}

          {!query && (
            <p className="mt-10 max-w-[46ch] text-sm text-slate max-sm:mt-6">
              곡 이름이나 아티스트를 치면 먼저 카탈로그에서 찾고, 없으면 YouTube 에서 찾아옵니다.
              대소문자와 띄어쓰기는 가리지 않습니다.
            </p>
          )}

          {/* **가수를 세웠으면 그 사람의 곡만 카드 밑에 붙는다.** 검색어에
              걸린 남의 곡은 머리글 아래로 내린다 — `경서` 를 쳤을 때
              `경서예지` 의 곡이 구분선 없이 이어 붙으면 그 사람의 곡으로
              읽힌다 */}
          {own && <SearchList tracks={own.tracks} />}
          {own && rest.length > 0 && (
            <>
              <Heading>다른 가수의 곡</Heading>
              <SearchList tracks={rest} />
            </>
          )}

          {!own && mine.length > 0 && (
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
          {/* 키가 안 꽂힌 배포에서는 이 줄이 뜬다. **아무 말도 안 하면 검색이
              고장 난 것으로 보인다** — 카탈로그에 없는 곡을 치면 "찾는 곡이
              없습니다" 만 나오는데, 실제로는 밖에 나가 보지도 않았다 */}
          {remote?.status === "off" && (
            <p className="mt-10 max-w-[52ch] text-sm text-slate max-sm:mt-6">
              YouTube 검색은 아직 켜져 있지 않습니다. 카탈로그 결과만 보여 드립니다.
            </p>
          )}
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
                이름의 일부만 쳐 보거나, 둘러보기에서 장르로 찾아보세요.
              </p>
              <ButtonLink href="/browse" transitionTypes={NAV_FORWARD} variant="text" className="mt-6">
                둘러보기로 가기
              </ButtonLink>
            </div>
          )}
        </section>
      </main>
    </ViewTransition>
  );
}
