"use client";

import {
  Chart,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
} from "chart.js";
import { useEffect, useRef } from "react";

/**
 * 쓰는 조각만 등록한다. `chart.js/auto` 를 부르면 막대·파이·도넛까지 전부
 * 번들에 실린다 — 이 화면이 그리는 건 오각형 하나뿐이다.
 */
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

export type RadarAxis = { key: string; label: string; value: number };

/** 채움 투명도. 6자리 hex 뒤에 붙이는 알파다(0x26 ≈ 15%) */
const FILL_ALPHA = "26";

/**
 * 오각형 지표 차트.
 *
 * **필이 값을 말하고 이 도형이 균형을 말한다.** 숫자 다섯 개를 읽어서
 * "어느 쪽으로 치우쳤나" 를 머릿속에서 그리는 일을 그림이 대신한다.
 *
 * 색은 CSS 변수에서 읽는다. Chart.js 는 캔버스에 그리므로 클래스가 안 먹고,
 * 여기에 hex 를 직접 적으면 `globals.css` 의 토큰과 두 벌이 된다 —
 * 한쪽만 바뀌는 날 색이 어긋나고 그건 아무 데서도 안 잡힌다.
 *
 * `--chart-5` 를 쓴다. 잉크로 칠하면 크림 캔버스 위에서 칙칙해지고,
 * 이 저장소에서 이미 "차트가 너무 검다" 로 한 번 되돌린 적이 있다.
 * 같은 보라를 분위기 막대가 쓰는데, 둘 다 **장르가 아니라 나 자신**을
 * 그리는 자리라 색이 겹치는 게 오히려 맞다.
 *
 * 캔버스에는 글자가 없다 — 축 이름도 그림이다. 스크린리더에는
 * `aria-label` 로 요약하고, **정확한 값은 옆의 스탯 필에 글로 있다.**
 */
export function RadarChart({ axes }: { axes: readonly RadarAxis[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 배열은 렌더마다 새로 만들어진다. 그대로 의존성에 넣으면 New Search 를
  // 누를 때마다 차트를 부수고 다시 만들면서 애니메이션이 처음부터 돈다.
  const labels = axes.map((axis) => axis.label).join("|");
  const values = axes.map((axis) => axis.value).join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = getComputedStyle(document.documentElement);
    const token = (name: string) => root.getPropertyValue(name).trim();
    const accent = token("--chart-5");

    const chart = new Chart(canvas, {
      type: "radar",
      data: {
        labels: labels.split("|"),
        datasets: [
          {
            data: values.split("|").map(Number),
            borderColor: accent,
            backgroundColor: `${accent}${FILL_ALPHA}`,
            borderWidth: 2,
            pointBackgroundColor: accent,
            pointBorderColor: accent,
            pointRadius: 4,
            pointHoverRadius: 4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // 라벨이 도형 바깥에 앉으므로 여백이 없으면 가장자리에서 잘린다.
        layout: { padding: 6 },
        // `prefers-reduced-motion` 은 `globals.css` 의 전역 블록이 CSS 만 막는다.
        // 캔버스 애니메이션은 여기서 직접 봐야 한다. → `.claude/rules/react.md`
        animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? false
          : { duration: 900, easing: "easeOutQuart" },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            // 눈금 숫자를 지운다. 정확한 값은 옆 필이 크게 말하고 있고,
            // 여기 25·50·75 를 겹쳐 쓰면 도형 위에 숫자가 깔린다.
            ticks: { display: false, stepSize: 25 },
            grid: { color: token("--hair") },
            angleLines: { color: token("--hair") },
            pointLabels: {
              color: token("--slate"),
              font: { family: getComputedStyle(canvas).fontFamily, size: 13, weight: 500 },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values]);

  return (
    <div className="relative aspect-square w-[clamp(280px,26vw,420px)] max-lg:w-[min(360px,100%)]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`다섯 지표의 균형. ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`}
      />
    </div>
  );
}
