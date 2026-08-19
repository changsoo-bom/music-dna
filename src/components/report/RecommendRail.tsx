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
 * 추천 목록.
 *
 * **이 화면의 값은 "왜" 에 있다.** 이유가 없으면 다른 추천 위젯과 구별되지 않고,
 * 앞의 지표들이 추천의 근거로 회수되지 않는다.
 * 그래서 카드마다 점수가 아니라 **그 점수가 어디서 왔는지**를 적는다.
 */
export function RecommendRail({ items }: { items: readonly Recommendation[] }) {
  return (
    <ul className="mt-10 grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {items.map(({ track, reasons }) => {
        const genre = PARENT_OF[track.subGenre];
        return (
          <li
            key={track.id}
            className="flex flex-col justify-between gap-8 px-7 py-6 rounded-btn bg-white shadow-lift"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13px] font-bold text-slate">
                <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${GENRE_DOT[genre]}`} />
                {GENRE_LABEL[genre]}
                <span className="text-dust">·</span>
                {SUB_GENRES[track.subGenre].ko}
              </p>
              <p className="mt-4 text-[19px] font-medium leading-snug tracking-[-0.01em]">
                {track.title}
              </p>
              <p className="mt-1 text-[15px] text-slate">{track.artist}</p>
            </div>

            {/* 점수를 크게 박지 않는다. 숫자 하나보다 근거 두 줄이 설득력이 있고,
                "87 이 뭔가" 라는 질문을 만들지도 않는다. */}
            <ul className="flex flex-col gap-1.5 text-sm text-slate">
              {reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
