import Image from "next/image";

import { GENRES, PARENT_OF, SUB_GENRES } from "@/constants/genres";
import type { Recommendation } from "@/lib/report/recommend";
import type { CSSProperties } from "react";
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

/** 궤도 호의 반지름과 둘레. 스트로크가 잘리지 않게 뷰박스 안쪽으로 물린다 */
const R = 76;
const CIRCUMFERENCE = 2 * Math.PI * R;

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
 * 추천 레일.
 *
 * **근접도를 글자가 아니라 궤도 호로 그린다.**
 *
 * 이 프로덕트의 주장은 "왜 이 곡인가" 인데, 그 이유를 카드에서 가장 작고 흐린
 * 회색 글자로 두면 위계가 주장을 배반한다. 그렇다고 점수를 크게 박으면
 * "87 이 뭔가" 라는 질문만 남는다. 호는 **값을 말하지 않고 보여준다** —
 * 얼마나 찼는지가 곧 답이고, 옆 카드와 비교가 눈으로 된다.
 *
 * `--signal-lt` 는 시스템이 궤도 호에 예약해 둔 색이다
 * (`docs/design-reference.md`). 이 저장소에서 처음 쓰는 자리다.
 *
 * 흰 카드 판을 걷어냈다. 호가 각 곡을 묶어 주므로 상자가 필요 없고,
 * 판이 사라지면 크림 캔버스 위에 원 여섯 개가 도는 그림이 된다.
 */
export function RecommendRail({ items }: { items: readonly Recommendation[] }) {
  return (
    <div
      tabIndex={0}
      aria-label="추천 곡 목록"
      className="rail mt-16 flex gap-10 overflow-x-auto pb-3 max-lg:gap-8 max-sm:mt-12 max-sm:gap-6"
    >
      {items.map(({ track, reasons, moodMatch }) => {
        const genre = PARENT_OF[track.subGenre];
        return (
          <article
            key={track.id}
            className="flex w-[clamp(192px,17vw,224px)] shrink-0 flex-col snap-start"
          >
            <div className="relative aspect-square w-full">
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="80" cy="80" r={R} fill="none" strokeWidth="2" className="stroke-ghost" />
                {/* 채워진 만큼이 분위기 근접도다. 값은 아래 legend 가 한 번만 설명한다 */}
                <circle
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="orbit stroke-signal-lt"
                  style={
                    {
                      "--orbit-len": CIRCUMFERENCE,
                      "--orbit-gap": CIRCUMFERENCE * (1 - moodMatch / 100),
                    } as CSSProperties
                  }
                />
              </svg>

              <div className="absolute inset-[12%] overflow-hidden rounded-full bg-ghost">
                {track.youtubeId && (
                  <Image
                    src={thumbnail(track.youtubeId)}
                    alt=""
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                )}
              </div>
            </div>

            <p className="mt-7 flex items-center gap-2 text-[13px] font-bold text-slate">
              <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${GENRE_DOT[genre]}`} />
              {SUB_GENRES[track.subGenre].ko}
            </p>

            <h3 className="mt-2.5 text-[21px] leading-tight tracking-[-0.01em]">{track.title}</h3>
            <p className="mt-1 text-[15px] text-slate">{track.artist}</p>

            {/* 호가 못 보여주는 것 하나만 남긴다 — 장르가 취향의 어디에 있는지.
                두 번째 이유(근접도)는 호가 이미 그렸으므로 글로 반복하지 않는다. */}
            <p className="mt-5 text-sm leading-snug text-slate">
              {GENRE_LABEL[genre]} · {reasons[0]}
            </p>
          </article>
        );
      })}
    </div>
  );
}
