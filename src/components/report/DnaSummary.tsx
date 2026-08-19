import type { CSSProperties, ReactNode } from "react";

import { CountUp } from "@/components/report/CountUp";
import { GENRES } from "@/constants/genres";
import { PERSONAS } from "@/constants/personas";
import { nightScore } from "@/lib/quiz/scoring";
import { focusOnMount } from "@/lib/utils";
import type { Genre, MusicPreference } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_COLOR: Record<Genre, string> = {
  pop: "bg-chart-1",
  rock: "bg-chart-2",
  hiphop: "bg-chart-3",
  rnb: "bg-chart-4",
  electronic: "bg-chart-5",
};

/**
 * 섹션 라벨.
 *
 * **`uppercase` 를 쓰지 않는다.** `styling.md` 는 대문자 변환을 14px 아이브로우
 * 라벨 하나로 묶어 뒀다. 13px 에 `uppercase` + `700` + `+0.04em` 을 얹으면
 * 아이브로우의 타이포 서명을 1px 작게 복제한 것이고, 그 순간 시스템에
 * 두 번째 대문자 스타일이 생긴다. 자간도 같이 뺐다 — 대문자용 보정이었다.
 */
const SECTION_LABEL = "text-[13px] font-bold text-slate";

/**
 * 막대의 목표 비율과 순서.
 *
 * 한 줄씩 시차를 두면 목록이 위에서 아래로 차오른다. 다 같이 차면
 * 값이 다르다는 게 안 읽히고 그냥 화면이 한 번 번쩍인 것처럼 보인다.
 * 마지막 줄까지 0.36초 안에 끝나게 잡았다 — 더 늘리면 기다리는 게 느껴진다.
 */
function fillStyle(fill: number, index: number): CSSProperties {
  return { "--fill": fill, animationDelay: `${index * 0.09}s` } as CSSProperties;
}

const AXIS_LABELS = [
  { key: "night", label: "Night Listener" },
  { key: "explorer", label: "Genre Explorer" },
  { key: "energy", label: "Energy" },
] as const;

type DnaSummaryProps = {
  preference: MusicPreference;
  /**
   * 마운트 시 제목으로 포커스를 옮길지.
   *
   * 검사 직후처럼 **화면이 방금 바뀐 경우에만** 켠다. 홈에서 켜면 페이지를 열
   * 때마다 포커스를 빼앗아 스크롤이 튀고, 헤더로 가려던 Tab 이 먹히지 않는다.
   */
  autoFocus?: boolean;
  /** 화면마다 다음 행동이 다르다. 홈은 링크, 검사 화면은 되돌리기 버튼 */
  footer?: ReactNode;
};

/** 검사 결과 한 벌. 검사 화면과 홈이 같은 것을 본다 */
export function DnaSummary({ preference, autoFocus = false, footer }: DnaSummaryProps) {
  const { axes, moods, persona } = preference;
  const { title, line } = PERSONAS[persona];

  const scores = {
    night: nightScore(axes.timeOfDay),
    explorer: axes.explorer,
    energy: axes.energy,
  };

  const topMoods = (Object.entries(moods) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // 큰 값이 위로 온다. 정렬하지 않고 `genres[0]` 을 최대값으로 쓰면
  // GENRES 선언 순서(pop 먼저)가 기준이 되어 막대가 컨테이너를 뚫는다 —
  // Rock 을 1위로 고른 사람은 scaleX(2.45) 짜리 막대를 본다.
  const genres = GENRES.map((g) => ({ ...g, share: axes.genre[g.id] }))
    .filter((g) => g.share > 0)
    .sort((a, b) => b.share - a.share);
  const topShare = Math.max(1, ...genres.map((g) => g.share));

  return (
    <div className="q-enter">
      {/* 정체성 블록만 오른쪽에 붙인다. 비대칭 배치가 이 디자인 언어의 축이고,
          왼쪽이 비어 있는 만큼 이름이 더 크게 들린다. */}
      <header className="flex flex-col items-end text-right">
        <span className="eyebrow text-ink">당신의 음악 DNA</span>

        <h1
          ref={autoFocus ? focusOnMount : undefined}
          tabIndex={autoFocus ? -1 : undefined}
          className="mt-5 text-[clamp(40px,6vw,72px)] leading-[1.05] outline-none"
        >
          {title}
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">{line}</p>
      </header>

      <dl className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-btn bg-hair max-sm:grid-cols-1">
        {AXIS_LABELS.map(({ key, label }) => (
          <div key={key} className="px-7 py-6 bg-lifted">
            <dt className={SECTION_LABEL}>{label}</dt>
            <dd className="mt-2 text-[32px] font-medium tabular-nums tracking-[-0.03em]">
              <CountUp value={scores[key]} />
              <span className="ml-0.5 text-lg text-slate">%</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 grid grid-cols-2 gap-16 max-md:grid-cols-1 max-md:gap-12">
        <section>
          <h2 className={SECTION_LABEL}>장르</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {genres.map((genre, index) => (
              <li key={genre.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-[15px] font-medium">{genre.label}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ghost">
                  <span
                    className={`bar-fill block h-full rounded-pill ${GENRE_COLOR[genre.id]}`}
                    style={fillStyle(genre.share / topShare, index)}
                  />
                </span>
                <CountUp
                  value={genre.share}
                  suffix="%"
                  className="w-11 shrink-0 text-right text-sm tabular-nums text-slate"
                />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className={SECTION_LABEL}>분위기</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {topMoods.map(([mood, score], index) => (
              <li key={mood} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-[15px] font-medium capitalize">{mood}</span>
                {/* Mood 는 배타적 분류가 아니라 같은 축 위의 순위다.
                    색을 나누면 "다른 종류" 라는 잘못된 신호를 준다 → 단색 시퀀셜 */}
                <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ghost">
                  <span
                    className="bar-fill block h-full rounded-pill bg-ink"
                    style={{ ...fillStyle(score / 100, index), opacity: 0.35 + (score / 100) * 0.65 }}
                  />
                </span>
                <CountUp
                  value={score}
                  className="w-11 shrink-0 text-right text-sm tabular-nums text-slate"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {footer}
    </div>
  );
}
