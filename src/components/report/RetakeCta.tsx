import { CATALOG } from "@/data/catalog";
import { GENRES, PARENT_OF } from "@/constants/genres";
import { NAV_FORWARD } from "@/constants/nav";
import { PERSONAS } from "@/constants/personas";
import { ButtonLink } from "@/components/ui/Button";
import { moodAffinity, nightScore } from "@/lib/quiz/scoring";
import { trackMood } from "@/lib/report/recommend";
import type { Genre, MoodVector, MusicPreference } from "@/types/music";

/** slot → 검증된 차트 색. Tailwind 는 클래스명을 정적으로 읽으므로 조립하지 않는다 */
const GENRE_FILL: Record<Genre, string> = {
  pop: "fill-chart-1",
  rock: "fill-chart-2",
  hiphop: "fill-chart-3",
  rnb: "fill-chart-4",
  electronic: "fill-chart-5",
};

const GENRE_LABEL = Object.fromEntries(GENRES.map((g) => [g.id, g.label])) as Record<Genre, string>;

/** 지문의 뷰박스. 막대가 `preserveAspectRatio="none"` 으로 늘어난다 */
const PRINT = { width: CATALOG.length * 3, height: 100, gap: 1 } as const;

/**
 * 청취 지문. **카탈로그 40곡에 대한 당신의 근접도**를 막대 하나씩으로 세운다.
 *
 * 프로토타입의 `.mini` 는 난수로 그린 장식인데, 같은 자리에 진짜 값을 넣을 수
 * 있으면 넣는 게 맞다. 카탈로그가 장르 순으로 정렬돼 있어서 색이 띠를 이루고,
 * **어느 장르 구간이 높은지가 그림으로 보인다** — 위 오각형이 축의 균형을
 * 말한다면 이건 취향의 결이다.
 */
function Fingerprint({ mood }: { mood: MoodVector }) {
  return (
    <svg
      viewBox={`0 0 ${PRINT.width} ${PRINT.height}`}
      preserveAspectRatio="none"
      className="my-7 block h-15 w-full"
      aria-hidden
    >
      {CATALOG.map((track, index) => {
        const height = Math.max(4, moodAffinity(mood, trackMood(track)));
        return (
          <rect
            key={track.id}
            x={index * 3}
            y={PRINT.height - height}
            width={3 - PRINT.gap}
            height={height}
            className={GENRE_FILL[PARENT_OF[track.subGenre]]}
          />
        );
      })}
    </svg>
  );
}

/**
 * 마지막 섹션. **다시 검사하러 가는 자리다.**
 *
 * `design/prototype.html` 의 `#connect` 구조를 가져왔다 — 왼쪽에 흰 필 카드,
 * 오른쪽에 제목·한 문장·버튼. 프로토타입은 계정 연결을 권하지만 여기는
 * 검사가 이미 끝난 사람이 보는 화면이라 권할 것이 재검사뿐이다.
 *
 * 카드에 들어가는 넷은 **위 오각형이 안 보여주는 것**이다. 오각형은 축의
 * 균형이고 여기는 이름 붙은 결과 — 어느 장르, 어느 분위기, 언제 잰 것인지.
 *
 * 버튼은 하나다. 프로토타입은 둘인데 둘째로 넣을 만한 행동이 이 화면에 없다.
 * 갈 곳 없는 버튼을 채워 넣지 않는다.
 */
export function RetakeCta({ preference }: { preference: MusicPreference }) {
  const { axes, moods, persona, computedAt } = preference;
  const { title } = PERSONAS[persona];

  const topGenre = (Object.keys(axes.genre) as Genre[]).reduce((best, genre) =>
    axes.genre[genre] > axes.genre[best] ? genre : best,
  );
  const topMood = (Object.entries(moods) as [string, number][]).reduce((best, entry) =>
    entry[1] > best[1] ? entry : best,
  )[0];

  // ISO 문자열을 그대로 자른다. `new Date()` 로 포맷하면 시간대에 따라 하루가
  // 밀리고, 서버와 클라이언트가 다른 날짜를 그릴 수 있다.
  const measuredOn = computedAt.slice(0, 10).replaceAll("-", ".");

  const rows = [
    { label: "주 장르", value: GENRE_LABEL[topGenre] },
    { label: "주 분위기", value: topMood },
    { label: "야간 청취", value: `${nightScore(axes.timeOfDay)}%` },
    { label: "검사일", value: measuredOn },
  ];

  return (
    <section className="mt-24 border-t border-hair pt-16 max-sm:mt-16 max-sm:pt-12">
      <div className="grid grid-cols-[minmax(0,420px)_1fr] items-center gap-[clamp(40px,7vw,96px)] max-lg:grid-cols-1 max-lg:gap-10">
        {/* 필 카드. 크림 캔버스 위에 뜬 표면이라 흰색 + shadow-float 다.
            좁아지면 `rounded-stadium` 으로 내린다 — 세로로 긴 알약이 화면 폭에
            맞춰 납작해지면 그냥 둥근 상자가 되고, 그때는 40px 이 맞는 반경이다. */}
        <div className="rounded-pill bg-white px-14 py-22 text-center shadow-float max-sm:rounded-stadium max-sm:px-8 max-sm:py-10">
          <span className="inline-block rounded-pill bg-canvas px-5 py-2 text-sm font-medium">
            MUSIC DNA {computedAt.slice(0, 4)}
          </span>

          <h3 className="mt-6 text-[30px] leading-[1.16]">{title}</h3>

          <Fingerprint mood={axes} />

          <dl className="grid grid-cols-2 gap-x-3 gap-y-4.5 text-left">
            {rows.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[13px] text-slate">{label}</dt>
                <dd className="mt-0.5 text-[17px] font-medium capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <span className="eyebrow text-ink">다시 검사</span>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(28px,3.4vw,40px)] leading-[1.1]">
            요즘 듣는 게 달라졌다면
          </h2>
          <p className="mt-5 max-w-[44ch] text-slate">
            취향은 한 번 재고 끝나지 않습니다. 다섯 문항이면 다시 잽니다. 이전 결과는 새 결과가
            나올 때까지 그대로 남습니다.
          </p>
          <ButtonLink href="/quiz" transitionTypes={NAV_FORWARD} className="mt-8">
            다시 검사하기
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
