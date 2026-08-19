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

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.id, g.label])) as Record<Genre, string>;

/**
 * 썸네일은 `mqdefault` 를 쓴다.
 *
 * `hqdefault` 는 480×360 **4:3** 이라 16:9 영상에 위아래 검은 띠가 들어간다.
 * 그걸 잘라 넣으면 화면에 보이는 게 절반쯤 띠다.
 * `maxresdefault` 는 띠가 없지만 **40곡 중 5곡에 없었다** — 없는 영상이 흔하다.
 * `mqdefault` 는 320×180 로 항상 있고 띠가 없다. 원이 작아서 해상도도 버틴다.
 */
function thumbnail(youtubeId: string) {
  return `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
}

/**
 * 추천 레일.
 *
 * 커버는 **원형**이다. 유튜브 썸네일은 16:9 라 세로로 길게 자르면 남는 게 없다 —
 * 가운데를 정사각으로 물어 원으로 깎으면 피사체가 살아 있다.
 * `docs/design-reference.md` 의 원형 크롭이 여기서 실용적인 이유이기도 하다.
 *
 * 가로로 미는 레일이라 **훑는 경험**이 된다. 세로 그리드로 쌓으면
 * 목록을 하나씩 확인하는 일이 된다.
 *
 * **이 화면의 값은 "왜" 에 있다.** 이유가 없으면 다른 추천 위젯과 구별되지 않고,
 * 앞의 지표들이 추천의 근거로 회수되지 않는다.
 */
export function RecommendRail({ items }: { items: readonly Recommendation[] }) {
  return (
    <div
      tabIndex={0}
      aria-label="추천 곡 목록"
      className="rail mt-14 flex gap-6 overflow-x-auto pb-2 max-sm:mt-10"
    >
      {items.map(({ track, reasons }) => {
        const genre = PARENT_OF[track.subGenre];
        return (
          <article
            key={track.id}
            className="flex w-[clamp(216px,19vw,252px)] shrink-0 flex-col snap-start px-7 py-7 rounded-btn bg-white shadow-lift"
          >
            <div className="relative size-[clamp(104px,10vw,132px)] overflow-hidden rounded-full bg-ghost">
              {track.youtubeId && (
                <Image
                  src={thumbnail(track.youtubeId)}
                  alt=""
                  fill
                  sizes="132px"
                  className="object-cover"
                />
              )}
            </div>

            <p className="mt-6 flex items-center gap-2 text-[13px] font-medium text-slate">
              <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rounded-full ${GENRE_DOT[genre]}`} />
              {SUB_GENRES[track.subGenre].ko}
            </p>

            <h3 className="mt-3 text-[21px] leading-tight tracking-[-0.01em]">{track.title}</h3>
            <p className="mt-1.5 text-[15px] text-slate">
              {track.artist} · {GENRE_LABEL[genre]}
            </p>

            {/* 점수를 크게 박지 않는다. 숫자 하나보다 근거 두 줄이 설득력이 있고,
                "87 이 뭔가" 라는 질문을 만들지도 않는다. */}
            <ul className="mt-auto flex flex-col gap-1.5 border-t border-hair pt-4 text-sm leading-snug text-slate">
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
