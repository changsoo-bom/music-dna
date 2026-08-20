"use client";

import {
  Chart,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useRef } from "react";

/**
 * 쓰는 조각만 등록한다. `chart.js/auto` 를 부르면 막대·파이·도넛까지 전부
 * 번들에 실린다 — 이 화면이 그리는 건 오각형 하나뿐이다.
 */
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export type RadarAxis = { key: string; label: string; value: number };

/** 채움 투명도. 6자리 hex 뒤에 붙이는 알파다(0x2e ≈ 18%) */
const FILL_ALPHA = "2e";

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
 * `--chart-1`(딥 틸)을 쓴다. 크림은 따뜻한 색이라 **차가운 색이 옆에 있을 때
 * 크림으로 보인다** — 따뜻한 색끼리 겹치면 둘 다 탁해진다. 아래 분위기 막대가
 * 쓰는 보라와도 갈린다. `--signal` 이 더 잘 어울리겠지만 그건 아이브로우 점과
 * 궤도 호에 예약된 색이라 차트에 쓰지 않는다. → `.claude/rules/styling.md`
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
    const accent = token("--chart-1");

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
            pointHoverRadius: 7,
            // **보이는 점은 4px, 잡히는 범위는 18px.** 그려진 크기를 키우지 않고
            // 과녁만 넓힌다 — 점이 커지면 도형의 선이 점에 먹힌다.
            pointHitRadius: 18,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        // 라벨이 도형 바깥에 앉으므로 여백이 없으면 가장자리에서 잘린다.
        layout: { padding: 12 },
        // `prefers-reduced-motion` 은 `globals.css` 의 전역 블록이 CSS 만 막는다.
        // 캔버스 애니메이션은 여기서 직접 봐야 한다. → `.claude/rules/react.md`
        animation: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? false
          : { duration: 900, easing: "easeOutQuart" },
        // **`intersect: false` 를 쓰면 안 된다.** 그러면 캔버스 어디를 가리켜도
        // "가장 가까운 점" 이 잡혀서 툴팁이 항상 떠 있고, 빈 구석에서도 값이
        // 뜬다. 과녁은 위의 `pointHitRadius` 로 넓히고 여기서는 점에 닿아야만
        // 잡히게 둔다.
        interaction: { mode: "nearest", intersect: true },
        plugins: {
          legend: { display: false },
          // 시스템의 툴팁 모양을 캔버스로 옮긴 것이다 — 흰 표면, 잉크 글자,
          // 필 반경. 그림자는 캔버스로 못 그려서 hair 테두리로 대신한다.
          tooltip: {
            backgroundColor: token("--white"),
            titleColor: token("--ink"),
            bodyColor: token("--slate"),
            borderColor: token("--hair"),
            borderWidth: 1,
            cornerRadius: 999,
            padding: { top: 9, bottom: 9, left: 18, right: 18 },
            // 계열이 하나뿐이라 색 상자가 무엇을 구분해 주지 않는다.
            displayColors: false,
            titleFont: { size: 14, weight: 500 },
            bodyFont: { size: 14 },
            callbacks: { label: (item) => ` ${item.parsed.r}` },
          },
        },
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
              font: { family: getComputedStyle(canvas).fontFamily, size: 14, weight: 500 },
            },
          },
        },
      },
    });

    return () => chart.destroy();
  }, [labels, values]);

  return (
    <div className="relative aspect-square w-[clamp(340px,40vw,620px)] max-lg:w-[min(480px,100%)]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`다섯 지표의 균형. ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`}
      />
    </div>
  );
}
