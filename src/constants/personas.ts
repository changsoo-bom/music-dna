import type { PersonaId } from "@/types/music";

/**
 * 5 유형 = 축 2개(밤/낮 × 탐험/정착)의 4분면 + 예외 1개.
 *
 * 축을 3개로 늘리면 8분면이 되고, 어느 칸에도 사람이 안 들어가는 유형이 생긴다.
 * 판정 규칙은 lib/quiz/scoring.ts 의 resolvePersona 에 있다.
 */
export const PERSONAS: Readonly<Record<PersonaId, { title: string; line: string }>> = {
  "dawn-explorer": {
    title: "새벽형 감성 탐험가",
    line: "하루가 끝난 늦은 밤 음악을 가장 많이 듣고, 하나의 장르에 머무르기보다 새로운 음악을 계속 찾아 나서는 타입입니다.",
  },
  "deep-diver": {
    title: "감성 몰입러",
    line: "밤에 음악을 가장 깊게 듣습니다. 새로운 걸 찾기보다 마음에 든 곡을 오래 곁에 두는 쪽입니다.",
  },
  "genre-collector": {
    title: "장르 수집가",
    line: "낮 시간을 음악으로 채웁니다. 한곳에 정착하지 않고 장르를 옮겨 다니며 모으는 타입입니다.",
  },
  "daylight-charger": {
    title: "낮의 에너지 충전러",
    line: "하루를 여는 시간에 음악을 켭니다. 익숙한 곡을 반복해 들으며 리듬을 만드는 쪽입니다.",
  },
  "hype-player": {
    title: "텐션 충전형 플레이어",
    line: "시간대와 상관없이 음악으로 텐션을 올립니다. 밝고 강한 사운드가 취향의 중심에 있습니다.",
  },
};
