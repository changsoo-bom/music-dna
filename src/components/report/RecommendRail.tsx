import Image from "next/image";

import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import type { Recommendation } from "@/lib/report/recommend";
import type { Genre } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_DOT: Record<Genre, string> = {
  pop: "bg-chart-1",
  rock: "bg-chart-2",
  hiphop: "bg-chart-3",
  rnb: "bg-chart-4",
  electronic: "bg-chart-5",
};

/**
 * 커버가 아직 없는 자리를 장르 색으로 옅게 덮는다.
 *
 * **장르 인코딩이다.** 칩의 점과 같은 의미고, `--chart-*` 를 UI 강조색으로
 * 끌어다 쓴 게 아니다. 알파를 낮게 잡은 건 6장이 나란히 섰을 때
 * 색 벽이 되지 않게 하려는 것 — 주인공은 곡 제목이지 판때기가 아니다.
 */
const GENRE_TINT: Record<Genre, string> = {
  pop: "bg-chart-1/15",
  rock: "bg-chart-2/15",
  hiphop: "bg-chart-3/15",
  rnb: "bg-chart-4/15",
  electronic: "bg-chart-5/15",
};

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.id, g.label])) as Record<Genre, string>;

/**
 * 추천 레일.
 *
 * 프로토타입의 카드 언어를 그대로 쓴다 — 3:4 세로 필, 위쪽에 떠 있는 장르 칩,
 * 그 아래 제목·아티스트, 선 하나 긋고 이유. 가로로 미는 레일이라
 * **훑는 경험**이 된다. 세로 그리드로 쌓으면 목록을 하나씩 확인하는 일이 된다.
 *
 * **이 화면의 값은 "왜" 에 있다.** 이유가 없으면 다른 추천 위젯과 구별되지 않고,
 * 앞의 지표들이 추천의 근거로 회수되지 않는다.
 */
export function RecommendRail({ items }: { items: readonly Recommendation[] }) {
  return (
    <div
      tabIndex={0}
      aria-label="추천 곡 목록"
      className="rail mt-14 flex gap-7 overflow-x-auto pb-2 max-sm:mt-10"
    >
      {items.map(({ track, reasons }) => {
        const genre = PARENT_OF[track.subGenre];
        return (
          <article key={track.id} className="w-[clamp(240px,25vw,310px)] shrink-0 snap-start">
            <div
              className={`relative aspect-3/4 overflow-hidden rounded-pill ${
                track.youtubeId ? "bg-dust" : GENRE_TINT[genre]
              }`}
            >
              {/* 썸네일은 `videos.list` 보강 뒤에 붙는다. 없는 id 를 지어내면
                  깨진 이미지가 뜨므로, 그때까지는 장르 색으로 자리를 잡아 둔다. */}
              {track.youtubeId && (
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 60vw, 310px"
                  className="object-cover"
                />
              )}

              <span className="absolute left-1/2 top-9 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap px-[18px] py-2 text-[13px] font-medium rounded-pill bg-white shadow-lift">
                <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${GENRE_DOT[genre]}`} />
                {SUB_GENRES[track.subGenre].ko}
              </span>
            </div>

            <h3 className="mt-13 text-[22px] leading-tight max-sm:mt-10">{track.title}</h3>
            <p className="mt-1.5 text-[15px] text-slate">
              {track.artist} · {GENRE_LABEL[genre]}
            </p>

            {/* 점수를 크게 박지 않는다. 숫자 하나보다 근거 두 줄이 설득력이 있고,
                "87 이 뭔가" 라는 질문을 만들지도 않는다. */}
            <ul className="mt-4.5 flex flex-col gap-1.5 border-t border-hair pt-4 text-sm leading-snug text-slate">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}
