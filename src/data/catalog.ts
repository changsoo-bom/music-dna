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
 * `youtubeId` · `duration` 은 `pnpm enrich` 가 채운다. 손으로 적지 않는다 —
 * 지어낸 id 는 재생도 썸네일도 안 되는 곡을 조용히 섞어 넣는다.
 * 검색이 틀린 곡을 집는 경우가 있어서(t009 가 그랬다) **눈으로 확인하고 넣는다.**
 * 확인 절차와 비용은 `scripts/enrich-catalog.ts` 주석에 있다.
 *
 * > [!note] 공식 채널이 아닌 업로드가 섞여 있다
 * > `videoEmbeddable=true` 로 걸렀지만 t003·t004·t011·t026 은 팬 업로드나
 * > 방송 라이브다. 원본이 없거나 임베드가 막혀 있어서인데, **언젠가 사라진다.**
 * > `pnpm enrich` 를 주기적으로 돌려 검사하고, 재생 실패는 화면에서 국소화한다.
 *
 * 300곡까지 늘릴 계획이고, 그때는 하위 장르당 15곡이 하한이다 —
 * 이미 고른 곡을 빼고 나면 추천 후보가 금방 줄어든다.
 */
export const CATALOG: readonly CatalogTrack[] = [
  // ── Pop ──────────────────────────────────────────────
  { id: "t001", title: "Ditto", artist: "NewJeans", subGenre: "kpop", mood: { energy: 62, dreamy: 55 }, youtubeId: "pSUydWEqKwE", duration: 334 },
  { id: "t002", title: "Next Level", artist: "aespa", subGenre: "kpop", mood: { energy: 92, valence: 70 }, youtubeId: "4TWR90KJl84", duration: 236 },
  { id: "t003", title: "옛사랑", artist: "이문세", subGenre: "ballad", mood: { valence: 22 }, youtubeId: "n_dA3T2jWkI", duration: 286 },
  { id: "t004", title: "모든 날, 모든 순간", artist: "폴킴", subGenre: "ballad", mood: { valence: 62 }, youtubeId: "EXV8TwTo0A0", duration: 218 },
  { id: "t005", title: "난춘", artist: "새소년", subGenre: "indie-pop", mood: { valence: 48, dreamy: 68 }, youtubeId: "KsznX5j2oQ0", duration: 251 },
  { id: "t006", title: "Bags", artist: "Clairo", subGenre: "indie-pop", mood: { energy: 42 }, youtubeId: "L9HYJbe9Y18", duration: 261 },
  { id: "t007", title: "Plastic Love", artist: "竹内まりや", subGenre: "city-pop", youtubeId: "T_lC2O1oIew", duration: 309 },
  { id: "t008", title: "Neon", artist: "YUKIKA", subGenre: "city-pop", mood: { energy: 62 }, youtubeId: "67jSYCSrnE4", duration: 276 },

  // ── Rock ─────────────────────────────────────────────
  { id: "t009", title: "Tik Tak Tok", artist: "실리카겔", subGenre: "indie-rock", mood: { energy: 82, dreamy: 58 }, youtubeId: "DIPxnt5vnhU", duration: 451 },
  { id: "t010", title: "주저하는 연인들을 위해", artist: "잔나비", subGenre: "indie-rock", mood: { energy: 45, valence: 48 }, youtubeId: "GpQ222I1ULc", duration: 279 },
  { id: "t011", title: "기억을 걷는 시간", artist: "넬", subGenre: "modern-rock", mood: { valence: 25, dreamy: 55 }, youtubeId: "83IfZhO4Pd0", duration: 345 },
  { id: "t012", title: "Somebody Else", artist: "The 1975", subGenre: "modern-rock", mood: { energy: 58, valence: 30, dreamy: 62 }, youtubeId: "jUj5h_IdPJI", duration: 348 },
  { id: "t013", title: "Alison", artist: "Slowdive", subGenre: "shoegaze", youtubeId: "jkM3M3zGcGE", duration: 228 },
  { id: "t014", title: "Only Shallow", artist: "My Bloody Valentine", subGenre: "shoegaze", mood: { energy: 82 }, youtubeId: "FyYMzEplnfU", duration: 224 },
  { id: "t015", title: "말달리자", artist: "크라잉넛", subGenre: "punk", mood: { valence: 72 }, youtubeId: "VcjbIbwJOzc", duration: 187 },
  { id: "t016", title: "Basket Case", artist: "Green Day", subGenre: "punk", mood: { valence: 55 }, youtubeId: "NUTGr5t3MoY", duration: 195 },

  // ── Hip-hop ──────────────────────────────────────────
  { id: "t017", title: "N.Y. State of Mind", artist: "Nas", subGenre: "boombap", mood: { valence: 25 }, youtubeId: "hI8A14Qcv68", duration: 296 },
  { id: "t018", title: "무투", artist: "가리온", subGenre: "boombap", mood: { energy: 72 }, youtubeId: "B3fWqo43FYo", duration: 233 },
  { id: "t019", title: "SICKO MODE", artist: "Travis Scott", subGenre: "trap", mood: { energy: 90 }, youtubeId: "6ONRf7h3Mdk", duration: 323 },
  { id: "t020", title: "Day Day", artist: "BewhY", subGenre: "trap", mood: { valence: 52 }, youtubeId: "AMWOLv4Y_0Y", duration: 210 },
  { id: "t021", title: "Passionfruit", artist: "Drake", subGenre: "melodic-rap", mood: { energy: 45, dreamy: 65 }, youtubeId: "COz9lDCFHjw", duration: 299 },
  { id: "t022", title: "Nerdy Love", artist: "pH-1", subGenre: "melodic-rap", mood: { valence: 72 }, youtubeId: "FFkLoUwQ9a4", duration: 200 },
  { id: "t023", title: "Aruarian Dance", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { valence: 62 }, youtubeId: "qYcoJpqCha4", duration: 251 },
  { id: "t024", title: "Feather", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { energy: 45 }, youtubeId: "hQ5x8pHoIPA", duration: 176 },

  // ── R&B ──────────────────────────────────────────────
  { id: "t025", title: "Untitled (How Does It Feel)", artist: "D'Angelo", subGenre: "neo-soul", mood: { energy: 32 }, youtubeId: "SxVNOnPyvIU", duration: 264 },
  { id: "t026", title: "Boat", artist: "죠지", subGenre: "neo-soul", mood: { valence: 55, dreamy: 60 }, youtubeId: "PHU06V7BhEc", duration: 198 },
  { id: "t027", title: "Pink + White", artist: "Frank Ocean", subGenre: "alt-rnb", mood: { valence: 68 }, youtubeId: "9cHbvRUALrc", duration: 185 },
  { id: "t028", title: "instagram", artist: "DEAN", subGenre: "alt-rnb", mood: { valence: 20 }, youtubeId: "wKyMIrBClYw", duration: 279 },
  { id: "t029", title: "September", artist: "Earth, Wind & Fire", subGenre: "funk", youtubeId: "Gs069dndIYk", duration: 216 },
  { id: "t030", title: "정말 사랑했을까", artist: "브라운 아이드 소울", subGenre: "funk", mood: { energy: 58, valence: 55 }, youtubeId: "NsRHHcTJYUs", duration: 273 },
  { id: "t031", title: "Good Days", artist: "SZA", subGenre: "slow-jam", mood: { dreamy: 68 }, youtubeId: "0BdlKkvjEgA", duration: 281 },
  { id: "t032", title: "Square", artist: "백예린", subGenre: "slow-jam", mood: { valence: 48, dreamy: 62 }, youtubeId: "4iFP_wd6QU8", duration: 263 },

  // ── Electronic ───────────────────────────────────────
  { id: "t033", title: "Latch", artist: "Disclosure", subGenre: "house", mood: { valence: 78 }, youtubeId: "93ASUImTedo", duration: 257 },
  { id: "t034", title: "It Makes You Forget", artist: "Peggy Gou", subGenre: "house", mood: { dreamy: 52 }, youtubeId: "SlbVgjFvE3I", duration: 396 },
  { id: "t035", title: "An Ending (Ascent)", artist: "Brian Eno", subGenre: "ambient", mood: { valence: 55 }, youtubeId: "OlaTeXX3uH8", duration: 262 },
  { id: "t036", title: "A Walk", artist: "Tycho", subGenre: "ambient", mood: { energy: 42, valence: 62, dreamy: 78 }, youtubeId: "SDNA934EEVk", duration: 317 },
  { id: "t037", title: "Blinding Lights", artist: "The Weeknd", subGenre: "synth-pop", mood: { energy: 88, valence: 62 }, youtubeId: "4NRXx6U8ABQ", duration: 263 },
  { id: "t038", title: "Levitating", artist: "Dua Lipa", subGenre: "synth-pop", mood: { valence: 92 }, youtubeId: "TUVcZfQe-Kw", duration: 231 },
  { id: "t039", title: "The Island", artist: "Pendulum", subGenre: "dnb", mood: { valence: 72 }, youtubeId: "hszZmFRPqx8", duration: 229 },
  { id: "t040", title: "Rio", artist: "Netsky", subGenre: "dnb", mood: { valence: 68 }, youtubeId: "qFDP9egTwfM", duration: 236 },
];
