import { ChartTooltip } from "@/components/report/ChartTooltip";
import { GENRES, SUB_GENRES } from "@/constants/genres";
import { GRID, MAP, mapX, mapY, moodPoints } from "@/lib/report/mood-map";
import type { Genre, MoodVector } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_FILL: Record<Genre, string> = {
  pop: "fill-chart-1",
  rock: "fill-chart-2",
  hiphop: "fill-chart-3",
  rnb: "fill-chart-4",
  electronic: "fill-chart-5",
};

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.id, g.label])) as Record<Genre, string>;

const AXIS_LABEL = "fill-slate text-[13px]";

/** 모서리 라벨. 사분면 이름을 만드는 `moodQuadrant` 와 같은 단어를 쓴다 */
const CORNERS = [
  { x: MAP.left, y: MAP.top - 16, anchor: "start", text: "어둡고 격렬함" },
  { x: MAP.width - MAP.right, y: MAP.top - 16, anchor: "end", text: "밝고 격렬함" },
  { x: MAP.left, y: MAP.height - MAP.bottom + 32, anchor: "start", text: "어둡고 차분함" },
  { x: MAP.width - MAP.right, y: MAP.height - MAP.bottom + 32, anchor: "end", text: "밝고 차분함" },
] as const;

/**
 * 분위기 지도. 카탈로그 40곡과 **당신의 자리**를 같은 평면에 놓는다.
 *
 * 추천 목록은 다섯 곡을 그냥 준다. 이 그림은 그 다섯 곡이 왜 그 다섯인지를
 * 말한다 — 당신 표시 주변에 모여 있다. `recommend()` 가 하는 계산이
 * 정확히 이 평면 위의 거리라서, 설명이 아니라 **같은 것을 다르게 그린 것**이다.
 *
 * 당신 표시는 잉크 블랙이다. `--chart-*` 는 차트 데이터 전용이고 이건
 * 데이터 계열이 아니라 기준점이며, `--signal` 은 아이브로우 점과 궤도 호에
 * 예약돼 있다. → `.claude/rules/styling.md`
 *
 * 점 40개에 각각 초점을 주지 않는다 — 탭이 40번 걸린다. 스크린리더에는
 * `<svg>` 의 요약 하나로 말하고, 실제로 들을 수 있는 다섯 곡은 아래 목록에
 * 글로 있다. **보조 표시에만 있는 정보를 만들지 않는다.**
 */
export function MoodMap({ mood, pickedIds }: { mood: MoodVector; pickedIds: readonly string[] }) {
  const points = moodPoints(pickedIds);
  const you = { x: mapX(mood.valence), y: mapY(mood.energy) };

  return (
    <ChartTooltip>
      <div className="mt-14 rounded-stadium bg-lifted p-11 shadow-float max-sm:mt-10 max-sm:p-6">
        <svg
          viewBox={`0 0 ${MAP.width} ${MAP.height}`}
          className="block h-auto w-full overflow-visible"
          role="img"
          aria-label={`가로는 밝기, 세로는 에너지. 카탈로그 ${points.length}곡 가운데 당신과 가장 가까운 ${pickedIds.length}곡이 아래 목록에 있습니다.`}
        >
          {GRID.map((at) => (
            <g key={at} className="stroke-hair" strokeWidth={at === 0.5 ? 1.5 : 1}>
              <line x1={mapX(at * 100)} y1={MAP.top} x2={mapX(at * 100)} y2={MAP.height - MAP.bottom} />
              <line x1={MAP.left} y1={mapY(at * 100)} x2={MAP.width - MAP.right} y2={mapY(at * 100)} />
            </g>
          ))}

          {CORNERS.map((corner) => (
            <text
              key={corner.text}
              x={corner.x}
              y={corner.y}
              textAnchor={corner.anchor}
              className={AXIS_LABEL}
            >
              {corner.text}
            </text>
          ))}

          {/* 추천된 곡을 나중에 그려서 위에 올린다. 겹칠 때 가려지면 안 되는 쪽이다 */}
          {[...points].sort((a, b) => Number(a.picked) - Number(b.picked)).map((point) => (
            <circle
              key={point.track.id}
              cx={point.x}
              cy={point.y}
              r={point.picked ? 10 : 6}
              opacity={point.picked ? 0.95 : 0.34}
              strokeWidth={2}
              className={`stroke-lifted ${GENRE_FILL[point.genre]}`}
              data-tip-title={point.track.title}
              data-tip-sub={`${point.track.artist} · ${SUB_GENRES[point.track.subGenre].ko}`}
            />
          ))}

          {/* 당신. 흰 테를 깔아 어느 점 위에 놓여도 읽힌다 */}
          <g
            data-tip-title="당신"
            data-tip-sub={`밝기 ${mood.valence} · 에너지 ${mood.energy}`}
          >
            <circle cx={you.x} cy={you.y} r={17} fill="none" strokeWidth={6} className="stroke-lifted" />
            <circle cx={you.x} cy={you.y} r={17} fill="none" strokeWidth={2} className="stroke-ink" />
            <circle cx={you.x} cy={you.y} r={5} className="fill-ink" />
            <text
              x={you.x}
              y={you.y - 27}
              textAnchor="middle"
              className="fill-ink text-[13px] font-bold"
            >
              당신
            </text>
          </g>

          <text x={MAP.width / 2} y={MAP.height - 10} textAnchor="middle" className={AXIS_LABEL}>
            밝기 →
          </text>
          <text
            x={14}
            y={MAP.height / 2}
            textAnchor="middle"
            transform={`rotate(-90 14 ${MAP.height / 2})`}
            className={AXIS_LABEL}
          >
            에너지 →
          </text>
        </svg>

        {/* 색이 무엇을 뜻하는지 한 번만 말한다. 점마다 이름표를 달면 그게 잡음이다 */}
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-hair pt-6 text-[13px] text-slate">
          {GENRES.map((genre) => (
            <li key={genre.id} className="flex items-center gap-2">
              <svg viewBox="0 0 8 8" className="h-2 w-2" aria-hidden>
                <circle cx="4" cy="4" r="4" className={GENRE_FILL[genre.id]} />
              </svg>
              {GENRE_LABEL[genre.id]}
            </li>
          ))}
        </ul>
      </div>
    </ChartTooltip>
  );
}
