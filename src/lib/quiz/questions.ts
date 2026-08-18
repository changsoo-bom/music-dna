import type { QuizQuestion } from "@/types/quiz";

/**
 * 14 문항. 축 6개 × 문항 2개 + 장르만 4개.
 *
 * 문항 수는 20 이 상한이다 — 그 위로는 끝까지 안 간다.
 * 장르에 4개를 주는 건 5방향 분포라 증거가 제일 많이 필요해서다.
 * 나머지 축은 0/33/67/100 짜리 문항 2개로 9단계가 나오고, 그걸로 충분하다.
 *
 * **장르 문항의 선택지는 하위 장르 20종이 정확히 한 번씩** 들어간다.
 * 같은 선택지가 두 번 나오지 않고, 문항마다 상위 5장르가 한 번씩 커버된다.
 * 하위 장르를 바꾸면 이 불변식을 깨는지 확인할 것 — 아래 assertQuestions 가 잡는다.
 *
 * 같은 축 문항은 연달아 놓지 않는다. 두 번 같은 걸 묻는 것처럼 읽힌다.
 */
export const QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "q01",
    axis: "genre",
    prompt: "요즘 재생 버튼을 가장 자주 누르는 쪽은?",
    options: [
      { label: "지금 차트에 있는 케이팝", subGenre: "kpop" },
      { label: "밴드 사운드가 살아 있는 인디록", subGenre: "indie-rock" },
      { label: "랩 벌스가 중심인 힙합", subGenre: "boombap" },
      { label: "목소리가 앞에 있는 네오소울", subGenre: "neo-soul" },
      { label: "비트가 끌고 가는 하우스", subGenre: "house" },
    ],
  },
  {
    id: "q02",
    axis: "energy",
    prompt: "볼륨을 최대로 올리게 되는 순간은?",
    options: [
      { label: "드럼이 터지면서 몸이 먼저 반응할 때", value: 100 },
      { label: "후렴에서 소리가 확 넓어질 때", value: 67 },
      { label: "목소리 하나가 또렷하게 들릴 때", value: 33 },
      { label: "거의 안 들릴 만큼 조용해질 때", value: 0 },
    ],
  },
  {
    id: "q03",
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
    id: "q04",
    axis: "genre",
    prompt: "빠르게 걷거나 운동할 때 손이 가는 트랙은?",
    options: [
      { label: "리듬이 굴러가는 시티팝", subGenre: "city-pop" },
      { label: "속도감 있는 모던록", subGenre: "modern-rock" },
      { label: "묵직하게 밀어붙이는 트랩", subGenre: "trap" },
      { label: "그루브가 꽉 찬 펑크·소울", subGenre: "funk" },
      { label: "쉬지 않고 달리는 드럼앤베이스", subGenre: "dnb" },
    ],
  },
  {
    id: "q05",
    axis: "dreamy",
    prompt: "이런 소리에 더 끌린다.",
    options: [
      { label: "안개처럼 번져서 경계가 없는 소리", value: 100 },
      { label: "신시사이저가 넓게 깔린 공간감", value: 67 },
      { label: "또렷하게 잡히는 기타와 드럼", value: 33 },
      { label: "마이크 앞의 목소리, 그게 전부", value: 0 },
    ],
  },
  {
    id: "q06",
    axis: "explorer",
    prompt: "새 앨범이 나왔다는 알림을 받으면?",
    options: [
      { label: "모르는 이름이어도 일단 눌러본다", value: 100 },
      { label: "취향에 맞을 것 같으면 들어본다", value: 67 },
      { label: "아는 아티스트일 때만 듣는다", value: 33 },
      { label: "듣던 걸 계속 듣는다", value: 0 },
    ],
  },
  {
    id: "q07",
    axis: "genre",
    prompt: "가사가 마음에 박히는 건 어떤 목소리일 때?",
    options: [
      { label: "담담하게 눌러 부르는 발라드", subGenre: "ballad" },
      { label: "소리 지르듯 뱉는 펑크", subGenre: "punk" },
      { label: "라임이 촘촘하게 꽂히는 멜로딕 랩", subGenre: "melodic-rap" },
      { label: "낮게 흘리는 슬로우잼", subGenre: "slow-jam" },
      { label: "레트로한 신스팝의 후렴", subGenre: "synth-pop" },
    ],
  },
  {
    id: "q08",
    axis: "valence",
    prompt: "혼자 있을 때 트는 음악의 색깔은?",
    options: [
      { label: "창을 열어놓은 것처럼 환하다", value: 100 },
      { label: "따뜻하고 편안하다", value: 67 },
      { label: "조금 가라앉아 있다", value: 33 },
      { label: "어둡고 무겁다", value: 0 },
    ],
  },
  {
    id: "q09",
    axis: "timeOfDay",
    prompt: "이 문장에 가장 가까운 건?",
    options: [
      { label: "아침에 음악이 없으면 하루가 시작되지 않는다", slot: "morning" },
      { label: "일할 때 배경음악이 계속 돌아간다", slot: "afternoon" },
      { label: "퇴근길 플레이리스트가 따로 있다", slot: "evening" },
      { label: "불 끄고 나서 한 곡 더 듣는다", slot: "night" },
      { label: "새벽 두 시가 제일 잘 들린다", slot: "dawn" },
    ],
  },
  {
    id: "q10",
    axis: "genre",
    prompt: "아무 방해 없이 혼자 있는 밤, 무엇을 트나?",
    options: [
      { label: "아무도 모르는 인디팝", subGenre: "indie-pop" },
      { label: "벽처럼 밀려오는 슈게이즈", subGenre: "shoegaze" },
      { label: "끊기지 않게 도는 로파이 힙합", subGenre: "lofi-hiphop" },
      { label: "밤에 어울리는 얼터너티브 R&B", subGenre: "alt-rnb" },
      { label: "소리가 거의 없는 앰비언트", subGenre: "ambient" },
    ],
  },
  {
    id: "q11",
    axis: "energy",
    prompt: "플레이리스트가 가장 잘 굴러가는 상태는?",
    options: [
      { label: "처음부터 끝까지 몰아친다", value: 100 },
      { label: "중간중간 텐션이 올라온다", value: 67 },
      { label: "잔잔하게 흐르다 가끔 커진다", value: 33 },
      { label: "처음부터 끝까지 잔잔하다", value: 0 },
    ],
  },
  {
    id: "q12",
    axis: "valence",
    prompt: "음악을 트는 이유에 가장 가까운 건?",
    options: [
      { label: "기분을 끌어올리려고", value: 100 },
      { label: "하루를 기분 좋게 두려고", value: 67 },
      { label: "가라앉은 마음을 가만히 두려고", value: 33 },
      { label: "감정에 더 깊이 들어가려고", value: 0 },
    ],
  },
  {
    id: "q13",
    axis: "dreamy",
    prompt: "좋아하는 곡의 마지막 30초는?",
    options: [
      { label: "소리가 서서히 번지다 사라진다", value: 100 },
      { label: "여운이 길게 남는다", value: 67 },
      { label: "깔끔하게 끝난다", value: 33 },
      { label: "마지막까지 꽉 차 있다", value: 0 },
    ],
  },
  {
    id: "q14",
    axis: "explorer",
    prompt: "1년 뒤 내 플레이리스트는?",
    options: [
      { label: "지금 곡이 거의 안 남아 있을 것", value: 100 },
      { label: "절반쯤 바뀌어 있을 것", value: 67 },
      { label: "몇 곡만 늘어나 있을 것", value: 33 },
      { label: "거의 그대로일 것", value: 0 },
    ],
  },
];
