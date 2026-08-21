import { CATALOG } from "@/data/catalog";
import { GENRES, PARENT_OF } from "@/constants/genres";
import { NAV_FORWARD } from "@/constants/nav";
import { PERSONAS } from "@/constants/personas";
import { ButtonLink } from "@/components/ui/Button";
import { QUESTIONS } from "@/lib/quiz/questions";
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

/**
 * 다시 하는 데 드는 비용. 오른쪽 열의 문장 아래에 줄로 세운다.
 *
 * 문항 수는 카탈로그가 아니라 `QUESTIONS` 를 센다 — 문항을 늘리는 날
 * 여기 "5" 가 조용히 거짓말이 되는 걸 막는다. 나머지 둘은 세는 값이 아니라
 * 이 화면이 지키는 약속이라 글로 적는다.
 */
const facts = [
  { label: "문항", value: `${QUESTIONS.length}개` },
  { label: "걸리는 시간", value: "약 1분" },
  { label: "이전 결과", value: "그대로 유지" },
];

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
 * 오른쪽에 제목·한 문장·드는 비용·버튼. 프로토타입은 계정 연결을 권하지만
 * 여기는 검사가 이미 끝난 사람이 보는 화면이라 권할 것이 재검사뿐이다.
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

          {/* 카드는 통째로 가운데 정렬이다. 여기만 왼쪽으로 두면 칩·제목·지문의
              축과 어긋나서 네 칸이 카드에서 떨어져 나온 것처럼 보인다 */}
          <dl className="grid grid-cols-2 gap-x-3 gap-y-4.5">
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
          <h2 className="mt-5 text-[clamp(28px,3.6vw,44px)] leading-[1.1]">
            요즘 듣는 게 달라졌다면
          </h2>
          {/* 문단 폭을 제목보다 좁게 잡는다. 읽는 줄은 길어지면 다음 줄
              첫 글자를 찾는 데 시간이 걸린다 — 제목은 한눈에 들어오는 덩어리라
              그 제약을 안 받는다. */}
          <p className="mt-6 max-w-[46ch] text-lg text-slate max-sm:text-base">
            취향은 한 번 재고 끝나지 않습니다. 계절이 바뀌거나 앨범 하나에 빠지면 좌표도 같이
            움직입니다.
          </p>

          {/* 문장에 흩어져 있던 사실 셋을 줄로 세운다. "다섯 문항이면 다시
              잽니다" 를 읽는 것과 5·1분·유지를 한눈에 보는 것은 다르다 —
              다시 할지 말지는 드는 비용을 보고 정하는 일이다.
              문항 수는 세어서 쓴다. 문항을 늘리면 여기도 같이 바뀐다. */}
          <dl className="mt-9 flex flex-wrap gap-x-14 gap-y-6 border-t border-hair pt-7 max-sm:gap-x-10">
            {facts.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[13px] text-slate">{label}</dt>
                <dd className="mt-1 text-xl font-medium tracking-[-0.02em]">{value}</dd>
              </div>
            ))}
          </dl>

          <ButtonLink href="/quiz" transitionTypes={NAV_FORWARD} className="mt-9">
            다시 검사하기
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
