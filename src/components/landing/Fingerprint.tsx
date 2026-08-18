const BAR_COUNT = 180;
const BAR_STEP = 4;
const BAR_WIDTH = 2.6;
const HEIGHT = 150;

const CHART_VARS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

/**
 * 씨앗 고정 난수. 서버와 클라이언트가 같은 그림을 그려야 하이드레이션이 어긋나지 않고,
 * 새로고침할 때마다 모양이 바뀌지도 않는다.
 */
function buildBars() {
  let seed = 20260818;
  const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;

  return Array.from({ length: BAR_COUNT }, () => {
    const value = 0.14 + Math.pow(random(), 1.7) * 0.86;
    const color = CHART_VARS[Math.floor(random() * CHART_VARS.length)];
    return { value, color };
  });
}

const BARS = buildBars();

/**
 * 청취 지문 — 이 서비스의 시각적 서명.
 * 랜딩에서는 **아직 아무 데이터도 없으므로** 실제 분석 결과인 척하지 않는다.
 * 앞으로 무엇을 받게 되는지 보여주는 예시다.
 */
export function Fingerprint() {
  return (
    <section className="mt-16 p-11 rounded-stadium bg-lifted shadow-float max-sm:mt-10 max-sm:p-6">
      <div className="flex items-baseline justify-between gap-4 mb-6 text-sm text-slate max-sm:flex-col max-sm:gap-1">
        <p>질문 몇 개에 답하면 당신의 취향이 이런 그림이 됩니다</p>
        <p className="shrink-0">예시</p>
      </div>

      <svg
        viewBox={`0 0 ${BAR_COUNT * BAR_STEP} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="장르별 색으로 그려진 음악 취향 시각화 예시"
        className="block w-full h-[150px] max-sm:h-[100px]"
      >
        {BARS.map((bar, index) => {
          const barHeight = bar.value * HEIGHT;
          return (
            <rect
              key={index}
              x={index * BAR_STEP}
              y={HEIGHT - barHeight}
              width={BAR_WIDTH}
              height={barHeight}
              rx={BAR_WIDTH / 2}
              fill={bar.color}
              opacity={(0.55 + bar.value * 0.45).toFixed(2)}
              className="fp-bar"
              style={{ animationDelay: `${index * 4}ms` }}
            />
          );
        })}
      </svg>
    </section>
  );
}
