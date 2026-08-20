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

/**
 * 스탯 필에 올릴 축.
 *
 * 프로토타입은 넷을 놓는다. 셋만 놓으면 필이 한쪽에 몰려 오른쪽이 비고,
 * 무엇보다 **`dreamy` 를 보여줄 자리가 이 화면에 없어진다** — 검사에서 재는
 * 세 좌표 중 하나인데 분위기 지도를 걷어낸 뒤로 어디에도 안 나온다.
 */
const AXIS_LABELS = [
  { key: "night", label: "Night Listener" },
  { key: "explorer", label: "Genre Explorer" },
  { key: "energy", label: "Energy" },
  { key: "dreamy", label: "Dreamy" },
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
  /**
   * 제목 오른쪽에 붙는 행동. 화면마다 다르다 — 홈은 링크, 검사 화면은 버튼.
   *
   * 아래가 아니라 위에 둔다. 결과를 다 읽고 나서 찾는 게 아니라
   * **결과가 마음에 안 들면 바로 다시 하는** 동선이다.
   */
  action?: ReactNode;
  footer?: ReactNode;
};

/** 검사 결과 한 벌. 검사 화면과 홈이 같은 것을 본다 */
export function DnaSummary({ preference, autoFocus = false, action, footer }: DnaSummaryProps) {
  const { axes, moods, persona } = preference;
  const { title, line } = PERSONAS[persona];

  const scores = {
    night: nightScore(axes.timeOfDay),
    explorer: axes.explorer,
    energy: axes.energy,
    dreamy: axes.dreamy,
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
      {/* 결과 한 덩어리. 프로토타입의 verdict 섹션 구조 그대로다 —
          아이브로우 · 큰 이름 · 한 문장 · 떠 있는 스탯 필, 그리고 뒤에 워터마크.
          `overflow-hidden` 이 워터마크를 이 상자 안에서 자른다. */}
      <div className="relative overflow-hidden pb-[clamp(72px,13vw,180px)]">
        {/* 잉크가 아니라 --ghost 다. 읽으라고 둔 글자가 아니라 바닥의 결이라,
            내용보다 진하면 그 순간 배경이 아니라 또 하나의 제목이 된다.
            DOM 에서 먼저 그리고 내용은 뒤에 온다 — z-index 를 안 쓰고 겹치는 법이다. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-[0.16em] block text-[clamp(96px,20vw,260px)] leading-[0.8] font-medium tracking-[-0.05em] whitespace-nowrap text-ghost select-none"
        >
          MUSIC DNA
        </span>

        {/* 이름은 왼쪽, 행동은 오른쪽 위. 큰 제목 옆의 빈 자리에 버튼을 앉힌다 —
            아래로 내리면 결과를 다 읽고 나서야 찾게 된다. */}
        <header className="relative flex items-start justify-between gap-10 max-sm:flex-col max-sm:gap-6">
          <div className="min-w-0">
            <span className="eyebrow text-ink">당신의 음악 DNA</span>

            <h1
              ref={autoFocus ? focusOnMount : undefined}
              tabIndex={autoFocus ? -1 : undefined}
              className="mt-5 max-w-[14ch] text-[clamp(36px,6vw,64px)] leading-[1.06] outline-none"
            >
              {title}
            </h1>
            <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">{line}</p>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </header>

        {/* 떠 있는 필. 크림 캔버스 위에 뜬 요소라 표면은 흰색이고 그림자는
            `shadow-lift` 다 — 시스템이 칩·스탯 필에 정해 둔 조합 그대로다.
            아래 2px 선이 값의 비율이다. 숫자를 못 읽는 사이에도 길이가 먼저 읽힌다. */}
        <dl className="relative mt-11 flex flex-wrap gap-3 max-sm:mt-8">
          {AXIS_LABELS.map(({ key, label }, index) => (
            <div key={key} className="min-w-43 rounded-pill bg-white px-7 py-4 shadow-lift">
              <dd className="text-[32px] leading-[1.1] font-medium tabular-nums tracking-[-0.03em]">
                <CountUp value={scores[key]} />
                <span className="ml-0.5 text-lg text-slate">%</span>
              </dd>
              <dt className="mt-1 text-sm text-slate">{label}</dt>
              <span aria-hidden className="mt-3 block h-0.5 overflow-hidden rounded-pill">
                <span
                  className="bar-fill block h-full rounded-pill bg-ink"
                  style={fillStyle(scores[key] / 100, index)}
                />
              </span>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid grid-cols-2 gap-16 max-md:grid-cols-1 max-md:gap-12">
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
                    색을 나누면 "다른 종류" 라는 잘못된 신호를 준다 → **단색 시퀀셜**.
                    잉크로 칠하면 값이 낮을수록 회색이 되어 화면이 칙칙해진다.
                    보라 하나를 골라 진하기만 바꾼다 — 순위는 그대로 읽히고 색이 산다.
                    바닥을 0.55 로 잡은 건 그 아래로 내려가면 크림 위에서 안 보여서다. */}
                <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ghost">
                  <span
                    className="bar-fill block h-full rounded-pill bg-chart-5"
                    style={{ ...fillStyle(score / 100, index), opacity: 0.55 + (score / 100) * 0.45 }}
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
