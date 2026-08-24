import Image from "next/image";

import { LibraryButton } from "@/components/common/LibraryButton";
import { PlayButton } from "@/components/player/PlayButton";
import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import type { Recommendation } from "@/lib/report/recommend";
import { isPlayable } from "@/lib/use-player-store";
import { formatDuration } from "@/lib/format";
import type { Genre } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_DOT: Record<Genre, string> = {
  pop: "bg-chart-1",
  rock: "bg-chart-2",
  hiphop: "bg-chart-3",
  rnb: "bg-chart-4",
  electronic: "bg-chart-5",
};

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.id, g.label])) as Record<Genre, string>;

/**
 * 썸네일은 `mqdefault` 를 쓴다.
 *
 * `hqdefault` 는 480×360 **4:3** 이라 16:9 영상에 위아래 검은 띠가 들어간다.
 * `maxresdefault` 는 띠가 없지만 40곡 중 5곡에 없었다.
 * `mqdefault` 는 320×180 로 항상 있고 띠가 없다.
 */
function thumbnail(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
}

/**
 * 추천 목록. 다섯 곡이 한 줄에 들어간다.
 *
 * **궤도 호는 길이가 전부 같다** — 둘레의 4/5 가 주황이고 나머지 1/5 은
 * 회색 트랙이 비친다. 전에는 분위기 근접도만큼 채워서 카드마다 달랐는데,
 * 그러면 곧바로 **재생 진행률로 읽힌다** — 재생 버튼이 바로 옆에 붙어 있으니
 * 더 그렇다. 데이터를 그리려다 없는 기능을 광고한 셈이었다.
 * 값은 `reasons` 가 글로 말하고, 호는 원형 초상을 감싸는 테두리로만 남는다.
 *
 * 이 파일에 `"use client"` 가 없지만 **서버 컴포넌트로 렌더되지는 않는다.**
 * 유일한 소비자인 `HomeTop` 이 클라이언트라 그 아래는 전부 클라이언트다.
 * 검사 결과가 Local Storage 에 있는 한 그 경계는 홈 최상단일 수밖에 없다 —
 * 서버가 못 보는 값으로 화면이 갈리기 때문이다. 쿠키를 심어 첫 페인트는
 * 서버가 그리게 했지만(`preference-cookie.ts`) 정본은 여전히 브라우저에 있다.
 *
 * 여기 지시문을 안 붙이는 건 **이 파일 자체는 경계가 아니라는 뜻**이다.
 * 홈이 서버 컴포넌트가 되는 날 이 파일은 손댈 것이 없다.
 */
export function RecommendList({
  items,
  savedIds,
}: {
  items: readonly Recommendation[];
  /** 보관함에 담긴 곡 id. **부모가 한 번 구독해서 내려준다** — 카드마다
      `useLibrary()` 를 부르면 다섯 번 구독하고, 이 파일에 훅이 생기는 순간
      "이 파일 자체는 경계가 아니다" 라는 위 약속이 깨진다 */
  savedIds: ReadonlySet<string>;
}) {
  // 어느 카드를 눌러도 큐는 목록 전체다. 재생할 수 없는 곡은 큐에서 빠지므로
  // 카드 순서와 큐 순서가 어긋날 수 있다 — 그래서 인덱스를 따로 찾는다.
  const queue = items.map((item) => item.track).filter(isPlayable);

  return (
    <ul className="mt-14 grid grid-cols-5 gap-x-7 gap-y-14 max-xl:grid-cols-3 max-sm:mt-10 max-sm:grid-cols-2 max-sm:gap-x-5 max-sm:gap-y-10">
      {items.map(({ track, reasons }, index) => {
        const genre = PARENT_OF[track.subGenre];
        const queueIndex = queue.findIndex((t) => t.id === track.id);
        const length = formatDuration(track.duration);
        return (
          <li
            key={track.id}
            className="card-enter flex flex-col"
            style={{ animationDelay: `${index * 0.06}s` }}
          >
            <div className="relative aspect-square w-full">
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                {/* 회색 트랙. 주황 호가 덮지 않는 1/5 이 여기서 비친다 */}
                <circle cx="80" cy="80" r="76" fill="none" strokeWidth="2" className="stroke-ghost" />
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="orbit stroke-signal-lt"
                />
              </svg>

              <div className="absolute inset-[12%] overflow-hidden rounded-full bg-ghost">
                {track.youtubeId && (
                  <Image
                    src={thumbnail(track.youtubeId)}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* 위성 버튼. 84% 는 궤도 호의 45° 지점이라, 버튼이 호 위에 도킹한다.
                  시스템이 원형 초상에 정해 둔 자리다(docs/design-reference.md). */}
              {queueIndex >= 0 && (
                <PlayButton
                  queueId="recommend"
                  queue={queue}
                  index={queueIndex}
                  className="absolute top-[84%] left-[84%] h-11 w-11 -translate-x-1/2 -translate-y-1/2"
                />
              )}
            </div>

            <p className="mt-6 flex items-center gap-1.5 text-[13px] font-bold text-slate">
              <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${GENRE_DOT[genre]}`} />
              {SUB_GENRES[track.subGenre].ko}
            </p>

            {/* 제목 줄 오른쪽 끝이 보관함이다. 커버 위에 얹지 않는다 —
                거기는 재생 버튼이 도킹하는 자리고, 원 위에 과녁 두 개가
                붙으면 어느 쪽이 곡을 트는지 매번 확인해야 한다.
                `items-start` 라 제목이 두 줄이 돼도 버튼은 첫 줄에 남는다. */}
            <div className="mt-2 flex items-start gap-2">
              <h3 className="min-w-0 flex-1 text-[19px] leading-tight tracking-[-0.01em]">
                {track.title}
              </h3>
              <LibraryButton track={track} saved={savedIds.has(track.id)} className="-mt-1.5 -mr-1.5" />
            </div>
            {/* 길이를 아티스트 옆에 붙인다. **틀기 전에 드는 비용을 알려 주는
                자리**고, 이 카드에서 그걸 말할 다른 줄이 없다. */}
            <p className="mt-1 text-sm text-slate">
              {track.artist}
              {length && <span className="tabular-nums">&nbsp;· {length}</span>}
            </p>

            {/* 이 장르가 당신 취향의 어디에 있는지. 호가 값을 그리지 않게 된 뒤로
                근접도를 말하는 건 이 줄뿐이다. */}
            <p className="mt-4 text-[13px] leading-snug text-slate">
              {GENRE_LABEL[genre]} · {reasons[0]}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
