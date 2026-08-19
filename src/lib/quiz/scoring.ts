import { QUESTIONS } from "@/lib/quiz/questions";
import type {
  Genre,
  Mood,
  MoodVector,
  MusicPreference,
  PersonaId,
  PreferenceAxes,
  TimeSlot,
} from "@/types/music";
import type { QuizAnswers } from "@/types/quiz";

const GENRE_IDS: readonly Genre[] = ["pop", "rock", "hiphop", "rnb", "electronic"];

/** 시간대는 원형이다. 새벽 다음이 아침이다. */
const TIME_CYCLE: readonly TimeSlot[] = ["morning", "afternoon", "evening", "night", "dawn"];

/**
 * 순위별 가중치. 1위에 5를 몰아준다.
 *
 * 5/2/1 이 아니라 3/2/1 이면 3개를 고른 사람이 전부 50/33/17 로 평평해진다.
 * 1위를 확실히 띄워야 "당신은 Rock 을 듣는 사람" 이 성립한다.
 */
const RANK_WEIGHTS = [5, 2, 1];

/**
 * MOOD 7종의 좌표. 문항 선택지와 같은 공간에 있다.
 *
 * 7종을 직접 묻지 않는다 — 서로 독립이 아니라서 따로 물으면 같은 걸 두 번 묻는 게
 * 되고 답이 흔들린다. 고른 좌표들의 평균에서 거리로 환산한다.
 */
const MOOD_ANCHORS: Readonly<Record<Mood, MoodVector>> = {
  melancholic: { energy: 25, valence: 15, dreamy: 55 },
  dreamy: { energy: 30, valence: 55, dreamy: 95 },
  energetic: { energy: 92, valence: 80, dreamy: 20 },
  romantic: { energy: 40, valence: 75, dreamy: 65 },
  chill: { energy: 30, valence: 60, dreamy: 35 },
  dark: { energy: 65, valence: 12, dreamy: 40 },
  happy: { energy: 78, valence: 95, dreamy: 25 },
};

/**
 * 거리를 점수로 바꿀 때의 사거리.
 *
 * 3축 공간의 최대 거리는 173 이지만 그 값을 쓰면 실제 거리가 대개 40 언저리라
 * 모든 무드가 75~90 에 몰려 차트가 평평해진다. 120 이면 거리 0→100, 60→50,
 * 120 이상→0 으로 떨어져 순위가 눈에 보인다.
 */
const MOOD_REACH = 120;

/** 답이 하나도 없을 때 앉히는 좌표. 정중앙이라 어느 무드로도 기울지 않는다 */
const NEUTRAL_MOOD: MoodVector = { energy: 50, valence: 50, dreamy: 50 };

/** 소수점을 버리면 합이 100 이 안 된다. 나머지가 큰 칸부터 1 씩 돌려준다 */
function toPercent<K extends string>(weights: Record<K, number>, keys: readonly K[]): Record<K, number> {
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  if (total === 0) {
    const even = Math.floor(100 / keys.length);
    const flat = Object.fromEntries(keys.map((k) => [k, even])) as Record<K, number>;
    flat[keys[0]] += 100 - even * keys.length;
    return flat;
  }

  const exact = keys.map((k) => ({ k, value: (weights[k] / total) * 100 }));
  const result = Object.fromEntries(exact.map(({ k, value }) => [k, Math.floor(value)])) as Record<K, number>;
  let short = 100 - keys.reduce((sum, k) => sum + result[k], 0);

  for (const { k } of [...exact].sort((a, b) => (b.value % 1) - (a.value % 1))) {
    if (short <= 0) break;
    result[k] += 1;
    short -= 1;
  }
  return result;
}

function scoreAxes(answers: QuizAnswers): PreferenceAxes {
  const genre = Object.fromEntries(GENRE_IDS.map((g) => [g, 0])) as Record<Genre, number>;
  const timeOfDay = Object.fromEntries(TIME_CYCLE.map((t) => [t, 0])) as Record<TimeSlot, number>;
  const moodPicks: MoodVector[] = [];
  const explorerPicks: number[] = [];

  for (const question of QUESTIONS) {
    const picked = answers[question.id] ?? [];

    if (question.axis === "genre") {
      // 순위가 곧 가중치. 고른 만큼만 점수가 간다 —
      // 한 장르만 고른 사람에게 억지로 2·3위를 만들어 주지 않는다.
      picked.forEach((optionIndex, rank) => {
        const option = question.options[optionIndex];
        if (option && rank < RANK_WEIGHTS.length) genre[option.genre] += RANK_WEIGHTS[rank];
      });
    } else if (question.axis === "timeOfDay") {
      // 고른 칸에 3, 앞뒤 칸에 1씩.
      // 문항이 하나뿐이라 이웃 가중치가 없으면 밤 비중이 0 아니면 100 이고,
      // 페르소나 임계값 50 이 무의미해진다.
      const option = question.options[picked[0]];
      if (!option) continue;
      const at = TIME_CYCLE.indexOf(option.slot);
      timeOfDay[option.slot] += 3;
      timeOfDay[TIME_CYCLE[(at + 1) % TIME_CYCLE.length]] += 1;
      timeOfDay[TIME_CYCLE[(at + TIME_CYCLE.length - 1) % TIME_CYCLE.length]] += 1;
    } else if (question.axis === "mood") {
      const option = question.options[picked[0]];
      if (option) moodPicks.push(option.mood);
    } else {
      const option = question.options[picked[0]];
      if (option) explorerPicks.push(option.value);
    }
  }

  const centroid = (points: MoodVector[]): MoodVector =>
    points.length === 0
      ? NEUTRAL_MOOD
      : {
          energy: Math.round(points.reduce((s, p) => s + p.energy, 0) / points.length),
          valence: Math.round(points.reduce((s, p) => s + p.valence, 0) / points.length),
          dreamy: Math.round(points.reduce((s, p) => s + p.dreamy, 0) / points.length),
        };

  return {
    ...centroid(moodPicks),
    genre: toPercent(genre, GENRE_IDS),
    timeOfDay: toPercent(timeOfDay, TIME_CYCLE),
    explorer:
      explorerPicks.length === 0
        ? 50
        : Math.round(explorerPicks.reduce((a, b) => a + b, 0) / explorerPicks.length),
  };
}

/** 두 좌표가 얼마나 가까운지 0~100. 추천 매칭도 이 함수를 그대로 쓴다 */
export function moodAffinity(a: MoodVector, b: MoodVector): number {
  const distance = Math.hypot(a.energy - b.energy, a.valence - b.valence, a.dreamy - b.dreamy);
  return Math.max(0, Math.round((1 - distance / MOOD_REACH) * 100));
}

function deriveMoods(axes: MoodVector): Record<Mood, number> {
  const entries = Object.entries(MOOD_ANCHORS) as [Mood, MoodVector][];
  return Object.fromEntries(entries.map(([mood, anchor]) => [mood, moodAffinity(axes, anchor)])) as Record<
    Mood,
    number
  >;
}

/** 밤 성향 = 밤 + 새벽 비중. MY DNA 의 `Night Listener` 가 이 값이다 */
export function nightScore(timeOfDay: Record<TimeSlot, number>): number {
  return timeOfDay.night + timeOfDay.dawn;
}

/**
 * 4분면 + 예외 1개.
 *
 * 임계값 50 은 고정이 아니라 **조정 대상**이다. 실제 답변이 한쪽으로 몰리면
 * (예: 다들 밤을 고른다) 여기 숫자를 옮긴다. 문항이나 배점을 건드리지 않는다.
 */
export function resolvePersona(axes: PreferenceAxes): PersonaId {
  // 밝고 강한 쪽은 시간대와 무관하게 성격이 다르다. 4분면보다 먼저 본다
  if (axes.energy >= 75 && axes.valence >= 60) return "hype-player";

  const isNight = nightScore(axes.timeOfDay) >= 50;
  const isExplorer = axes.explorer >= 50;

  if (isNight) return isExplorer ? "dawn-explorer" : "deep-diver";
  return isExplorer ? "genre-collector" : "daylight-charger";
}

/**
 * 답 → 저장할 결과. **순수 함수다.** 같은 답이면 항상 같은 결과가 나온다.
 * 랜덤 요소를 넣지 않는다 — 재검사할 때마다 유형이 바뀌면 결과를 못 믿는다.
 */
export function computePreference(answers: QuizAnswers, computedAt: string): MusicPreference {
  const axes = scoreAxes(answers);
  return {
    version: 1,
    answers,
    axes,
    moods: deriveMoods(axes),
    persona: resolvePersona(axes),
    computedAt,
  };
}
