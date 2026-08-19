import { buttonClass } from "@/components/ui/Button";
import { GENRES } from "@/constants/genres";
import { PERSONAS } from "@/constants/personas";
import { nightScore } from "@/lib/quiz/scoring";
import type { Genre, MusicPreference } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_COLOR: Record<Genre, string> = {
  pop: "bg-chart-1",
  rock: "bg-chart-2",
  hiphop: "bg-chart-3",
  rnb: "bg-chart-4",
  electronic: "bg-chart-5",
};

const AXIS_LABELS = [
  { key: "night", label: "Night Listener" },
  { key: "explorer", label: "Genre Explorer" },
  { key: "energy", label: "Energy" },
] as const;

export function QuizResult({
  preference,
  onRetry,
}: {
  preference: MusicPreference;
  onRetry: () => void;
}) {
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

  const genres = GENRES.map((g) => ({ ...g, share: axes.genre[g.id] })).filter((g) => g.share > 0);
  const topShare = genres[0]?.share ?? 1;

  return (
    <div className="q-enter">
      <span className="eyebrow text-ink">결과</span>

      <h1 className="mt-5 text-[clamp(40px,6vw,72px)] leading-[1.05]">{title}</h1>
      <p className="mt-6 max-w-[52ch] text-lg text-slate max-sm:text-base">{line}</p>

      <dl className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-btn bg-hair max-sm:grid-cols-1">
        {AXIS_LABELS.map(({ key, label }) => (
          <div key={key} className="px-7 py-6 bg-lifted">
            <dt className="text-[13px] font-bold uppercase tracking-[0.04em] text-slate">{label}</dt>
            <dd className="mt-2 text-[32px] font-medium tabular-nums tracking-[-0.03em]">
              {scores[key]}
              <span className="ml-0.5 text-lg text-slate">%</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 grid grid-cols-2 gap-16 max-md:grid-cols-1 max-md:gap-12">
        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.04em] text-slate">장르</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {genres.map((genre) => (
              <li key={genre.id} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-[15px] font-medium">{genre.label}</span>
                <span className="h-2.5 flex-1 rounded-pill bg-ghost">
                  <span
                    className={`block h-full origin-left rounded-pill ${GENRE_COLOR[genre.id]}`}
                    style={{ transform: `scaleX(${genre.share / topShare})` }}
                  />
                </span>
                <span className="w-11 shrink-0 text-right text-sm tabular-nums text-slate">
                  {genre.share}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-[13px] font-bold uppercase tracking-[0.04em] text-slate">분위기</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {topMoods.map(([mood, score]) => (
              <li key={mood} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-[15px] font-medium capitalize">{mood}</span>
                {/* Mood 는 배타적 분류가 아니라 같은 축 위의 순위다.
                    색을 나누면 "다른 종류" 라는 잘못된 신호를 준다 → 단색 시퀀셜 */}
                <span className="h-2.5 flex-1 rounded-pill bg-ghost">
                  <span
                    className="block h-full origin-left rounded-pill bg-ink"
                    style={{ transform: `scaleX(${score / 100})`, opacity: 0.35 + (score / 100) * 0.65 }}
                  />
                </span>
                <span className="w-11 shrink-0 text-right text-sm tabular-nums text-slate">{score}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-20 flex items-center gap-6 border-t border-hair pt-10 max-sm:mt-14 max-sm:flex-col max-sm:items-start max-sm:gap-4">
        <button type="button" onClick={onRetry} className={buttonClass("secondary")}>
          다시 검사하기
        </button>
        {/* 결과가 어디 갔는지 안 알려주면 새로고침하면 사라지는 줄 안다 */}
        <p className="text-sm text-slate">
          결과는 이 브라우저에 저장됐습니다. 다시 검사하면 덮어씁니다.
        </p>
      </footer>
    </div>
  );
}
