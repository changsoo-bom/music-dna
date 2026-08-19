import type { CatalogTrack } from "@/types/music";

/**
 * 곡 카탈로그 v1 — 하위 장르 20종 × 2곡.
 *
 * 장르는 **사람이 직접 적는다.** YouTube 는 장르를 주지 않고
 * (`videoCategoryId` 는 "Music" 하나뿐), Spotify 태그는 `korean indie rock` 처럼
 * 세분화가 심해 어차피 상위로 묶는 매핑표가 필요했다. 처음부터 20종 중 하나로
 * 적으면 그 단계가 사라진다.
 *
 * `mood` 는 하위 장르 기본값에서 **달라지는 축만** 적는다.
 *
 * > [!warning] `youtubeId` 와 `duration` 이 비어 있다
 * > `videos.list` 보강을 아직 안 돌렸다. 없는 id 를 지어내면 재생도 썸네일도
 * > 안 되는 곡이 조용히 섞인다 — 비워 두는 쪽이 정직하다.
 * > 보강할 때 `status.embeddable` 이 false 인 곡은 카탈로그에서 뺀다.
 *
 * 300곡까지 늘릴 계획이고, 그때는 하위 장르당 15곡이 하한이다 —
 * 이미 고른 곡을 빼고 나면 추천 후보가 금방 줄어든다.
 */
export const CATALOG: readonly CatalogTrack[] = [
  // ── Pop ──────────────────────────────────────────────
  { id: "t001", title: "Ditto", artist: "NewJeans", subGenre: "kpop", mood: { energy: 62, dreamy: 55 } },
  { id: "t002", title: "Next Level", artist: "aespa", subGenre: "kpop", mood: { energy: 92, valence: 70 } },
  { id: "t003", title: "옛사랑", artist: "이문세", subGenre: "ballad", mood: { valence: 22 } },
  { id: "t004", title: "모든 날, 모든 순간", artist: "폴킴", subGenre: "ballad", mood: { valence: 62 } },
  { id: "t005", title: "난춘", artist: "새소년", subGenre: "indie-pop", mood: { valence: 48, dreamy: 68 } },
  { id: "t006", title: "Bags", artist: "Clairo", subGenre: "indie-pop", mood: { energy: 42 } },
  { id: "t007", title: "Plastic Love", artist: "竹内まりや", subGenre: "city-pop" },
  { id: "t008", title: "Neon", artist: "YUKIKA", subGenre: "city-pop", mood: { energy: 62 } },

  // ── Rock ─────────────────────────────────────────────
  { id: "t009", title: "Tidal Wave", artist: "실리카겔", subGenre: "indie-rock", mood: { energy: 82, dreamy: 58 } },
  { id: "t010", title: "주저하는 연인들을 위해", artist: "잔나비", subGenre: "indie-rock", mood: { energy: 45, valence: 48 } },
  { id: "t011", title: "기억을 걷는 시간", artist: "넬", subGenre: "modern-rock", mood: { valence: 25, dreamy: 55 } },
  { id: "t012", title: "Somebody Else", artist: "The 1975", subGenre: "modern-rock", mood: { energy: 58, valence: 30, dreamy: 62 } },
  { id: "t013", title: "Alison", artist: "Slowdive", subGenre: "shoegaze" },
  { id: "t014", title: "Only Shallow", artist: "My Bloody Valentine", subGenre: "shoegaze", mood: { energy: 82 } },
  { id: "t015", title: "말달리자", artist: "크라잉넛", subGenre: "punk", mood: { valence: 72 } },
  { id: "t016", title: "Basket Case", artist: "Green Day", subGenre: "punk", mood: { valence: 55 } },

  // ── Hip-hop ──────────────────────────────────────────
  { id: "t017", title: "N.Y. State of Mind", artist: "Nas", subGenre: "boombap", mood: { valence: 25 } },
  { id: "t018", title: "무투", artist: "가리온", subGenre: "boombap", mood: { energy: 72 } },
  { id: "t019", title: "SICKO MODE", artist: "Travis Scott", subGenre: "trap", mood: { energy: 90 } },
  { id: "t020", title: "Day Day", artist: "BewhY", subGenre: "trap", mood: { valence: 52 } },
  { id: "t021", title: "Passionfruit", artist: "Drake", subGenre: "melodic-rap", mood: { energy: 45, dreamy: 65 } },
  { id: "t022", title: "Nerdy Love", artist: "pH-1", subGenre: "melodic-rap", mood: { valence: 72 } },
  { id: "t023", title: "Aruarian Dance", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { valence: 62 } },
  { id: "t024", title: "Feather", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { energy: 45 } },

  // ── R&B ──────────────────────────────────────────────
  { id: "t025", title: "Untitled (How Does It Feel)", artist: "D'Angelo", subGenre: "neo-soul", mood: { energy: 32 } },
  { id: "t026", title: "Boat", artist: "죠지", subGenre: "neo-soul", mood: { valence: 55, dreamy: 60 } },
  { id: "t027", title: "Pink + White", artist: "Frank Ocean", subGenre: "alt-rnb", mood: { valence: 68 } },
  { id: "t028", title: "instagram", artist: "DEAN", subGenre: "alt-rnb", mood: { valence: 20 } },
  { id: "t029", title: "September", artist: "Earth, Wind & Fire", subGenre: "funk" },
  { id: "t030", title: "정말 사랑했을까", artist: "브라운 아이드 소울", subGenre: "funk", mood: { energy: 58, valence: 55 } },
  { id: "t031", title: "Good Days", artist: "SZA", subGenre: "slow-jam", mood: { dreamy: 68 } },
  { id: "t032", title: "Square", artist: "백예린", subGenre: "slow-jam", mood: { valence: 48, dreamy: 62 } },

  // ── Electronic ───────────────────────────────────────
  { id: "t033", title: "Latch", artist: "Disclosure", subGenre: "house", mood: { valence: 78 } },
  { id: "t034", title: "It Makes You Forget", artist: "Peggy Gou", subGenre: "house", mood: { dreamy: 52 } },
  { id: "t035", title: "An Ending (Ascent)", artist: "Brian Eno", subGenre: "ambient", mood: { valence: 55 } },
  { id: "t036", title: "A Walk", artist: "Tycho", subGenre: "ambient", mood: { energy: 42, valence: 62, dreamy: 78 } },
  { id: "t037", title: "Blinding Lights", artist: "The Weeknd", subGenre: "synth-pop", mood: { energy: 88, valence: 62 } },
  { id: "t038", title: "Levitating", artist: "Dua Lipa", subGenre: "synth-pop", mood: { valence: 92 } },
  { id: "t039", title: "The Island", artist: "Pendulum", subGenre: "dnb", mood: { valence: 72 } },
  { id: "t040", title: "Rio", artist: "Netsky", subGenre: "dnb", mood: { valence: 68 } },
];
