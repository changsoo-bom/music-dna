import { RADAR, RINGS, radarLabel, radarPoint, radarPolygon } from "@/lib/report/radar";
import type { RadarAxis } from "@/lib/report/radar";

/**
 * 오각형 지표 차트.
 *
 * **필이 값을 말하고 이 도형이 균형을 말한다.** 숫자 다섯 개를 읽어서
 * "어느 쪽으로 치우쳤나" 를 머릿속에서 그리는 일을 그림이 대신한다 —
 * 한쪽으로 늘어난 오각형인지, 고르게 퍼진 오각형인지가 한눈에 온다.
 *
 * 색은 `--chart-5`. 잉크로 칠하면 크림 캔버스 위에서 칙칙해지고,
 * 이 저장소에서 이미 "차트가 너무 검다" 로 한 번 되돌린 적이 있다.
 * 같은 보라를 분위기 막대가 쓰는데, 둘 다 **장르가 아니라 나 자신**을
 * 그리는 자리라 색이 겹치는 게 오히려 맞다. → `docs/design-reference.md`
 *
 * 훅이 없다. 지금은 홈이 클라이언트라 같이 내려가지만, 서버 세션이 생겨
 * 그 경계가 올라가면 이 파일은 그대로 서버에 남는다.
 */
export function RadarChart({ axes }: { axes: readonly RadarAxis[] }) {
  const values = axes.map((axis) => axis.value);

  return (
    <svg
      viewBox={`0 0 ${RADAR.size} ${RADAR.size}`}
      className="block h-auto w-full max-w-[340px] overflow-visible"
      role="img"
      aria-label={`다섯 지표의 균형. ${axes.map((a) => `${a.label} ${a.value}`).join(", ")}`}
    >
      {/* 격자. 바깥 고리만 진하다 — 나머지는 눈금이라 도형보다 뒤에 있어야 한다 */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={radarPolygon(values.map(() => 100), ring)}
          fill="none"
          strokeWidth={ring === 1 ? 1.5 : 1}
          className="stroke-hair"
        />
      ))}

      {axes.map((axis, index) => {
        const end = radarPoint(index, axes.length, 1);
        return (
          <line
            key={axis.key}
            x1={RADAR.center}
            y1={RADAR.center}
            x2={end.x}
            y2={end.y}
            strokeWidth={1}
            className="stroke-hair"
          />
        );
      })}

      {/* 값. 채움은 옅게, 테두리는 진하게 — 겹친 격자가 비쳐야 값이 읽힌다 */}
      <polygon
        points={radarPolygon(values)}
        strokeWidth={2}
        strokeLinejoin="round"
        className="fill-chart-5/15 stroke-chart-5"
      />

      {axes.map((axis, index) => {
        const point = radarPoint(index, axes.length, axis.value / 100);
        return <circle key={axis.key} cx={point.x} cy={point.y} r={3.5} className="fill-chart-5" />;
      })}

      {axes.map((axis, index) => {
        const { x, y, anchor } = radarLabel(index, axes.length);
        return (
          <text key={axis.key} x={x} y={y} textAnchor={anchor} className="fill-slate text-[12px]">
            {axis.label}
          </text>
        );
      })}
    </svg>
  );
}
