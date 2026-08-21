import { PARENT_OF, SUB_GENRES } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { moodAffinity } from "@/lib/quiz/scoring";
import type { CatalogTrack, Genre, MoodVector, MusicPreference } from "@/types/music";

/**
 * 장르와 분위기의 무게.
 *
 * 장르를 더 준다 — 사람은 "내가 듣는 장르" 를 자기 취향의 이름으로 여긴다.
 * 분위기만 보면 Rock 을 1순위로 고른 사람에게 같은 분위기의 Ambient 가 올라오고,
 * 그건 맞는 추천이어도 납득이 안 된다.
 */
const GENRE_WEIGHT = 0.55;
const MOOD_WEIGHT = 0.45;

/**
 * 한 장르가 목록을 다 먹지 못하게 막는다.
 *
 * 가중치만으로는 안 된다. 장르를 하나만 고른 사람은 그 장르 점수가 100,
 * 나머지가 0 이라 **어떤 무게를 줘도 6칸이 전부 한 장르로 찬다.**
 * 그러면 [[서비스-방향]] 의 마지막 칸인 "새로운 음악 발견" 이 성립하지 않고,
 * 카탈로그가 커져도 같은 장르 안에서만 돈다.
 *
 * 탐험 성향이 높으면 더 벌린다 — 검사에서 잰 축이 추천에서도 일을 해야 한다.
 */
export function maxPerGenre(explorer: number): number {
  return explorer >= 50 ? 2 : 3;
}

export type Recommendation = {
  track: CatalogTrack;
  score: number;
  /** 0~100. 화면에서는 숫자가 아니라 궤도 호의 채워진 길이로 나온다 */
  moodMatch: number;
  /** 이 곡이 올라온 이유. **실제 지표에서만 만든다** */
  reasons: string[];
};

/** 하위 장르 기본 좌표 + 곡별 보정 */
export function trackMood(track: CatalogTrack): MoodVector {
  return { ...SUB_GENRES[track.subGenre].mood, ...track.mood };
}

function genreScore(genre: Genre, shares: Record<Genre, number>, topShare: number): number {
  return topShare === 0 ? 0 : Math.round((shares[genre] / topShare) * 100);
}

/**
 * 추천을 만든다. **외부 API 호출이 0회다** — 카탈로그가 메모리에 있으니
 * 스코어링은 즉시 끝난다.
 *
 * 추천 품질보다 **이유를 설명하는 인터페이스**가 이 프로젝트의 주장이다.
 * 그래서 점수와 함께 그 점수가 어디서 왔는지를 같이 돌려준다.
 */
export function recommend(
  preference: MusicPreference,
  limit = 5,
  exclude: readonly string[] = [],
): Recommendation[] {
  const shares = preference.axes.genre;
  const topShare = Math.max(...Object.values(shares));
  const topGenre = (Object.keys(shares) as Genre[]).reduce((best, g) =>
    shares[g] > shares[best] ? g : best,
  );
  const userMood: MoodVector = {
    energy: preference.axes.energy,
    valence: preference.axes.valence,
    dreamy: preference.axes.dreamy,
  };

  const excluded = new Set(exclude);

  const scored = CATALOG.filter((track) => !excluded.has(track.id))
    .map((track) => {
      const genre = PARENT_OF[track.subGenre];
      const genreMatch = genreScore(genre, shares, topShare);
      const moodMatch = moodAffinity(userMood, trackMood(track));

      const reasons: string[] = [];
      if (genre === topGenre) reasons.push(`${shares[genre]}% 로 1순위인 장르`);
      else if (shares[genre] > 0) reasons.push(`고른 장르 중 ${shares[genre]}%`);
      else reasons.push("아직 안 고른 장르");
      reasons.push(`분위기 근접도 ${moodMatch}`);

      return {
        track,
        score: Math.round(genreMatch * GENRE_WEIGHT + moodMatch * MOOD_WEIGHT),
        moodMatch,
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score || a.track.id.localeCompare(b.track.id));

  // 점수 순으로 담되 장르당 상한을 지킨다. 상한에 걸려 자리가 남으면
  // 마지막에 점수 순으로 채운다 — 목록이 6칸보다 짧아지는 게 더 나쁘다.
  const cap = maxPerGenre(preference.axes.explorer);
  const taken: Recommendation[] = [];
  const perGenre = new Map<Genre, number>();

  for (const item of scored) {
    if (taken.length === limit) break;
    const genre = PARENT_OF[item.track.subGenre];
    const count = perGenre.get(genre) ?? 0;
    if (count >= cap) continue;
    perGenre.set(genre, count + 1);
    taken.push(item);
  }

  if (taken.length < limit) {
    const already = new Set(taken.map((t) => t.track.id));
    taken.push(...scored.filter((s) => !already.has(s.track.id)).slice(0, limit - taken.length));
  }

  return taken;
}


/**
 * 다시 찾기. 이미 본 곡을 빼고 다음 판을 뽑을 제외 목록을 만든다.
 *
 * **남은 곡이 한 판보다 적으면 비운다.** 안 그러면 `recommend` 의 backfill 이
 * 제외했어야 할 곡을 도로 채워 넣어서, 누를 때마다 같은 목록이 나온다.
 * 카탈로그를 한 바퀴 돌면 처음으로 돌아가는 셈이고, 그게 정직하다 —
 * 40곡뿐인데 무한히 새 곡이 나오는 척할 수는 없다.
 */
export function nextExclusions(
  seen: readonly string[],
  justSeen: readonly string[],
  limit = 5,
): string[] {
  const next = [...new Set([...seen, ...justSeen])];
  return CATALOG.length - next.length < limit ? [] : next;
}
