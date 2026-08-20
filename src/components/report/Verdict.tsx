import type { CSSProperties } from "react";

import { CountUp } from "@/components/report/CountUp";
import { RadarChart } from "@/components/report/RadarChart";
import { PERSONAS } from "@/constants/personas";
import { nightScore } from "@/lib/quiz/scoring";
import type { MusicPreference } from "@/types/music";

/**
 * 지표 다섯. 필과 오각형이 같은 배열을 본다.
 *
 * 프로토타입의 verdict 은 넷이지만 오각형에는 꼭짓점이 다섯 필요하고,
 * 마침 검사가 재는 축이 정확히 다섯이다. `valence` 와 `dreamy` 는
 * 분위기 지도를 걷어낸 뒤로 화면 어디에도 안 나오고 있었다.
 */
const STATS = [
  { key: "night", label: "야간 청취" },
  { key: "explorer", label: "탐험 성향" },
  { key: "energy", label: "에너지" },
  { key: "valence", label: "밝기" },
  { key: "dreamy", label: "몽환" },
] as const;

/**
 * 아래 2px 선의 목표 비율과 순서. 시차를 두면 필 넷이 왼쪽부터 차례로 찬다.
 *
 * 프로토타입은 `width` 를 애니메이션하는데 그건 매 프레임 레이아웃을 다시 잡는다.
 * `bar-fill` 은 `scaleX` 라서 합성 단계에서 끝난다 — 같은 그림, 다른 비용이다.
 */
function fillStyle(fill: number, index: number): CSSProperties {
  return { "--fill": fill, animationDelay: `${index * 0.09}s` } as CSSProperties;
}

/**
 * 결과 선언. 페이지 맨 위에 오는 한 문장이다.
 *
 * `design/prototype.html` 의 `#verdict` 에서 왔다 — 아이브로우 · 큰 이름 ·
 * 한 문장 · 떠 있는 흰 필. 프로토타입의 MUSIC DNA 워터마크는 걷어냈다.
 * 여기는 오른쪽에 오각형이 서 있어서, 바닥에 큰 글자까지 깔면 한 화면에
 * 시선을 끄는 게 셋이 된다.
 *
 * 아래 `DnaSummary` 와 내용이 겹친다. 여기는 **선언**이고 거기는 **내역**이다 —
 * 프로토타입도 verdict 과 genres·clock 을 따로 뒀다. 겹치는 게 거슬리면
 * `DnaSummary` 의 머리(아이브로우·이름·문장)를 홈에서 접는 쪽이 맞다.
 */
export function Verdict({ preference }: { preference: MusicPreference }) {
  const { axes, persona } = preference;
  const { title, line } = PERSONAS[persona];

  const scores = {
    night: nightScore(axes.timeOfDay),
    explorer: axes.explorer,
    energy: axes.energy,
    valence: axes.valence,
    dreamy: axes.dreamy,
  };

  return (
    <section className="pt-20 max-lg:pt-14 max-sm:pt-10">
      {/* 왼쪽은 말, 오른쪽은 그림. 필은 값을 말하고 오각형은 균형을 말한다 —
          같은 데이터의 반복이 아니라 **읽는 방식이 다르다.**
          좁아지면 세로로 쌓는다. 도형을 줄여 가며 옆에 붙여 두면 라벨부터 뭉갠다. */}
      <div className="grid grid-cols-[1fr_auto] items-center gap-12 max-lg:grid-cols-1">
        <div>
          <span className="eyebrow text-ink">당신의 음악 DNA</span>
          <h1 className="mt-5 max-w-[18ch] text-[clamp(34px,6vw,64px)] leading-[1.06]">
            당신은 {title} 입니다
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">{line}</p>

          {/* 떠 있는 필. 크림 캔버스 위에 뜬 요소라 표면은 흰색이고 그림자는
            `shadow-lift` 다 — 시스템이 칩·스탯 필에 정해 둔 조합 그대로다.
            숫자에 % 를 안 붙인다. 아래 선이 이미 100 중 얼마인지를 그린다.

            3열 격자다. 다섯 개를 한 줄로 늘어놓으면 900px 를 먹어서 옆의
            오각형을 밀어낸다. 3 + 2 로 접으면 폭이 절반이고, 마지막 줄이
            비는 게 아니라 **빈 자리가 도형 쪽으로 열린다.** */}
          <dl className="mt-11 grid w-fit grid-cols-3 gap-3 max-sm:mt-8 max-sm:grid-cols-2">
            {STATS.map(({ key, label }, index) => (
              <div key={key} className="min-w-43 rounded-pill bg-white px-[30px] py-4 shadow-lift">
                <dd className="text-[32px] leading-[1.1] font-medium tabular-nums tracking-[-0.03em]">
                  <CountUp value={scores[key]} />
                </dd>
                <dt className="mt-0.5 text-sm text-slate">{label}</dt>
                <span
                  aria-hidden
                  className="mt-3 block h-0.5 overflow-hidden rounded-pill bg-ghost"
                >
                  <span
                    className="bar-fill block h-full rounded-pill bg-ink"
                    style={fillStyle(scores[key] / 100, index)}
                  />
                </span>
              </div>
            ))}
          </dl>
        </div>

        <RadarChart
          axes={STATS.map(({ key, label }) => ({
            key,
            label,
            value: scores[key],
          }))}
        />
      </div>
    </section>
  );
}
