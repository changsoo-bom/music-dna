import type { QuizQuestion } from "@/types/quiz";

/**
 * 5문항. 목표는 **1분 안에 끝나는 검사**다.
 *
 * 첫 화면에 보이는 숫자가 이탈을 만든다 — 이탈은 앞에서 몰려서 나오고,
 * `01 / 14` 는 각오해야 하는 숫자로, `01 / 05` 는 짧게 읽힌다.
 *
 * 대신 문항 하나가 축 하나를 통째로 감당한다. 선택지를 5개로 맞춘 건
 * 취향이 아니라 필요다 — 장르도 시간대도 5방향이고,
 * 분위기·탐험도 5단계여야 한 문항으로 눈금이 선다.
 */
export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q1",
    axis: "genre",
    prompt: "어떤 음악을 듣나요?",
    hint: "좋아하는 순서대로 최대 3개",
    maxPicks: 3,
    options: [
      { label: "Pop", sub: "케이팝 · 발라드 · 인디팝 · 시티팝", genre: "pop" },
      { label: "Rock", sub: "인디록 · 모던록 · 슈게이즈 · 펑크", genre: "rock" },
      { label: "Hip-hop", sub: "붐뱁 · 트랩 · 멜로딕 랩 · 로파이", genre: "hiphop" },
      { label: "R&B", sub: "네오소울 · 얼터너티브 R&B · 소울 · 슬로우잼", genre: "rnb" },
      { label: "Electronic", sub: "하우스 · 앰비언트 · 신스팝 · 드럼앤베이스", genre: "electronic" },
    ],
  },
  {
    id: "q2",
    axis: "timeOfDay",
    prompt: "음악이 가장 자연스럽게 켜지는 시간은?",
    options: [
      { label: "눈뜨고 나갈 준비를 하는 아침", slot: "morning" },
      { label: "일하거나 이동하는 한낮", slot: "afternoon" },
      { label: "해 질 무렵 돌아오는 길", slot: "evening" },
      { label: "하루를 정리하는 밤", slot: "night" },
      { label: "다들 잠든 새벽", slot: "dawn" },
    ],
  },
  {
    id: "q3",
    axis: "mood",
    prompt: "지금 이어폰을 꽂으면 뭐가 나오면 좋겠어요?",
    options: [
      { label: "심장이 먼저 뛰는 트랙", mood: { energy: 95, valence: 75, dreamy: 15 } },
      { label: "기분이 확 밝아지는 것", mood: { energy: 75, valence: 95, dreamy: 25 } },
      { label: "편안하게 흘러가는 것", mood: { energy: 30, valence: 65, dreamy: 35 } },
      { label: "안개처럼 번지는 것", mood: { energy: 30, valence: 50, dreamy: 95 } },
      { label: "어둡고 무거운 것", mood: { energy: 60, valence: 12, dreamy: 40 } },
    ],
  },
  {
    id: "q4",
    axis: "mood",
    prompt: "음악을 트는 이유에 가장 가까운 건?",
    options: [
      { label: "텐션을 끌어올리려고", mood: { energy: 92, valence: 78, dreamy: 18 } },
      { label: "하루를 기분 좋게 두려고", mood: { energy: 70, valence: 92, dreamy: 25 } },
      { label: "마음을 가라앉히려고", mood: { energy: 25, valence: 60, dreamy: 40 } },
      { label: "감정에 더 깊이 들어가려고", mood: { energy: 55, valence: 12, dreamy: 45 } },
      { label: "다른 데로 잠깐 떠나려고", mood: { energy: 30, valence: 50, dreamy: 92 } },
    ],
  },
  {
    id: "q5",
    axis: "explorer",
    prompt: "1년 뒤 내 플레이리스트는?",
    options: [
      { label: "지금 곡이 거의 안 남아 있을 것", value: 100 },
      { label: "대부분 새로운 곡으로 바뀌어 있을 것", value: 75 },
      { label: "절반쯤 바뀌어 있을 것", value: 50 },
      { label: "몇 곡만 늘어나 있을 것", value: 25 },
      { label: "거의 그대로일 것", value: 0 },
    ],
  },
];
