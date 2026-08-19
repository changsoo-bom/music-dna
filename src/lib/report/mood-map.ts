import { PARENT_OF } from "@/constants/genres";
import { CATALOG } from "@/data/catalog";
import { trackMood } from "@/lib/report/recommend";
import type { CatalogTrack, Genre, MoodVector } from "@/types/music";

/**
 * 지도의 뷰박스와 여백. 프로토타입(`design/prototype.html` 의 `#mood`)과 같은 값이다.
 * 축 라벨이 네 모서리 바깥에 앉아야 해서 위아래 여백이 다르다.
 */
export const MAP = { width: 1160, height: 540, left: 56, right: 56, top: 44, bottom: 56 } as const;

/** 격자선을 그을 위치. 가운데(0.5)만 굵다 — 사분면을 나누는 선이기 때문이다 */
export const GRID = [0.25, 0.5, 0.75] as const;

export function mapX(valence: number): number {
  return MAP.left + (valence / 100) * (MAP.width - MAP.left - MAP.right);
}

export function mapY(energy: number): number {
  return MAP.height - MAP.bottom - (energy / 100) * (MAP.height - MAP.top - MAP.bottom);
}

export type MoodPoint = {
  track: CatalogTrack;
  genre: Genre;
  x: number;
  y: number;
  /** 추천에 오른 곡. 크고 진하게 그리고 이름표를 단다 */
  picked: boolean;
};

/**
 * 카탈로그 40곡을 밝기(valence) × 에너지(energy) 평면에 놓는다.
 *
 * **추천이 왜 그 곡인지를 이 그림이 대신 말한다.** 목록에서는 다섯 곡이
 * 그냥 주어지지만, 지도 위에서는 당신 표시 주변에 모여 있는 게 보인다.
 * `recommend()` 가 하는 계산이 정확히 이 평면 위의 거리다.
 *
 * 세 번째 축(dreamy)은 그리지 않는다. 종이는 2차원이고, 억지로 넣으면
 * 점 크기나 투명도를 써야 하는데 그 둘은 이미 "추천됐는가" 가 쓰고 있다.
 * 대신 화면에 그렇게 적는다 — 안 적으면 이 그림이 전부인 줄 안다.
 */
export function moodPoints(pickedIds: readonly string[]): MoodPoint[] {
  const picked = new Set(pickedIds);

  return CATALOG.map((track) => {
    const mood = trackMood(track);
    return {
      track,
      genre: PARENT_OF[track.subGenre],
      x: mapX(mood.valence),
      y: mapY(mood.energy),
      picked: picked.has(track.id),
    };
  });
}

/**
 * 사분면 이름. 지도의 네 모서리 라벨과 같은 말을 쓴다 —
 * 문장에서 읽은 단어를 그림에서 다시 찾을 수 있어야 한다.
 *
 * 정중앙 근처는 방향을 말하지 않는다. 50 을 기준으로 갈라 놓으면
 * **1점 차이로 문장이 뒤집힌다.**
 */
export function moodQuadrant(mood: MoodVector): string | null {
  if (Math.abs(mood.valence - 50) < 8 && Math.abs(mood.energy - 50) < 8) return null;
  return `${mood.valence >= 50 ? "밝고" : "어둡고"} ${mood.energy >= 50 ? "격렬한" : "차분한"}`;
}
