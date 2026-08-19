import { Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import type { CSSProperties } from "react";

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
 * 추천 목록.
 *
 * **가로 레일을 걷어내고 격자로 편다.** 레일은 여섯 곡 중 다섯 곡만 보여 주고
 * 나머지 하나를 화면 밖에 숨겼다. 목록 전체가 한눈에 들어오는 게 낫다 —
 * 옆 카드와 호 길이를 비교하는 게 이 화면의 요점인데, 비교하려면 같이 보여야 한다.
 * 미는 버튼도 같이 사라진다. 밀 것이 없으면 버튼도 없다.
 *
 * **근접도를 글자가 아니라 궤도 호로 그린다.**
 * 점수를 크게 박으면 "87 이 뭔가" 라는 질문만 남는다. 호는 값을 말하지 않고
 * 보여준다 — 얼마나 찼는지가 곧 답이고, 옆 카드와 비교가 눈으로 된다.
 * `--signal-lt` 는 시스템이 궤도 호에 예약해 둔 색이다(`docs/design-reference.md`).
 *
 * 서버 컴포넌트다. 재생 버튼이 링크라서 클라이언트로 내릴 이유가 없다.
 */
export function RecommendList({ items }: { items: readonly Recommendation[] }) {
  return (
    <ul className="mt-14 grid grid-cols-3 gap-x-14 gap-y-16 max-lg:grid-cols-2 max-sm:mt-10 max-sm:grid-cols-1 max-sm:gap-y-12">
      {items.map(({ track, reasons, moodMatch }) => {
        const genre = PARENT_OF[track.subGenre];
        return (
          <li key={track.id} className="flex flex-col">
            <div className="relative aspect-square w-full max-w-[264px]">
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="80" cy="80" r={R} fill="none" strokeWidth="2" className="stroke-ghost" />
                {/* 채워진 만큼이 분위기 근접도다. 값은 섹션 헤더가 한 번만 설명한다 */}
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
                    sizes="264px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* 위성 버튼. 84% 는 궤도 호의 45° 지점이라, 버튼이 호 위에 도킹한다.
                  시스템이 원형 초상에 정해 둔 자리다(docs/design-reference.md).
                  링크로 둔다 — 페이지 안에 플레이어가 없는데 버튼만 두면
                  눌러도 아무 일이 안 일어난다. 나가서라도 소리가 나는 쪽이 정직하다. */}
              {track.youtubeId && (
                <a
                  href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${track.artist} ${track.title} — YouTube 에서 재생`}
                  className="absolute top-[84%] left-[84%] grid h-13 w-13 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-ink shadow-lift transition-colors hover:bg-ink hover:text-canvas focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
                >
                  {/* 재생 삼각형은 광학 중심이 기하 중심보다 오른쪽이다. 1px 민다 */}
                  <Play size={20} weight="fill" aria-hidden className="translate-x-px" />
                </a>
              )}
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
          </li>
        );
      })}
    </ul>
  );
}
