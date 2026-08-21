import type { CatalogTrack } from "@/types/music";

/**
 * 곡 카탈로그 — 109곡, 하위 장르 20종.
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
 * > `videoEmbeddable=true` 로 걸렀지만 t003·t004·t011·t026·t048·t049·t076·
 * > t087·t097·t103 은 팬 업로드나 방송 라이브다. 원본이 없거나 임베드가
 * > 막혀 있어서인데, **언젠가 사라진다.** `pnpm enrich` 를 주기적으로 돌려
 * > 검사하고, 재생 실패는 화면에서 국소화한다(`blocked` → 다음 곡).
 * >
 * > 레이블 채널(HYBE LABELS · 1theK · Sub Pop · Atlantic · Hospital Records
 * > 같은)은 여기 안 넣는다. 아티스트 채널만큼, 때로는 더 오래 간다.
 *
 * 목표는 300곡이고 **하위 장르당 15곡이 하한**이다 — 이미 고른 곡을 빼고
 * 나면 추천 후보가 금방 줄어든다. 지금은 4~6곡이라 아직 한참 모자라다.
 *
 * > [!important] 한 번에 다 못 채운다 — 할당량 때문이다
 * > `search.list` 가 곡당 **100 units** 고 하루 한도가 10,000 이다.
 * > 남은 191곡이면 19,100 units = **이틀 더**. 배치로 나눠 넣되,
 * > **한 배치가 끝날 때마다 커밋을 초록으로 남긴다** — `check-catalog` 가
 * > 모든 곡에 `youtubeId` 를 요구하므로 보강 안 된 곡을 커밋하면 CI 가 깨진다.
 * >
 * > 1차(t041~t120): 80곡 검색 → **11곡 반려**. 검색이 다른 곡을 집었다
 * > (죠지 "Loving U" → Joji "Die For You", 쿤디판다 "붕붕" → 김하온,
 * > Redbone → 213초짜리 편집본). **표를 눈으로 안 봤으면 다 들어갔다.**
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

  /* ── 확장 1차 ─────────────────────────────────────────
     하위 장르당 4곡씩. `youtubeId`·`duration` 은 `pnpm enrich` 가 채우고,
     검색이 집어 온 제목·채널을 눈으로 확인한 뒤 `apply-enrich` 로 넣는다.
     한 번에 300곡을 못 채우는 이유는 할당량이다 — 검색이 곡당 100 units,
     하루 한도가 10,000 이라 260곡이면 사흘이다. */

  // ── Pop ──────────────────────────────────────────────
  { id: "t041", title: "Hype Boy", artist: "NewJeans", subGenre: "kpop", mood: { valence: 88 }, youtubeId: "11cta61wi0g", duration: 178 },
  { id: "t042", title: "How Sweet", artist: "NewJeans", subGenre: "kpop", mood: { energy: 85 }, youtubeId: "Q3K0TOvTOno", duration: 243 },
  { id: "t043", title: "Magnetic", artist: "ILLIT", subGenre: "kpop", mood: { valence: 90 }, youtubeId: "Vk5-c_v4gMU", duration: 189 },
  { id: "t044", title: "Super Shy", artist: "NewJeans", subGenre: "kpop", mood: { energy: 82, valence: 88 }, youtubeId: "ArmDp-zijuc", duration: 201 },
  { id: "t045", title: "봄날", artist: "방탄소년단", subGenre: "ballad", mood: { energy: 42, valence: 40, dreamy: 58 }, youtubeId: "xEeFrLSkMm8", duration: 329 },
  { id: "t046", title: "밤편지", artist: "아이유", subGenre: "ballad", mood: { valence: 45, dreamy: 62 }, youtubeId: "BzYnNdJhZQw", duration: 283 },
  { id: "t047", title: "너의 모든 순간", artist: "성시경", subGenre: "ballad", mood: { valence: 52 }, youtubeId: "i2aRMXZR1k0", duration: 241 },
  { id: "t048", title: "이 밤을 빌려 말해요", artist: "십센치", subGenre: "ballad", mood: { valence: 48, dreamy: 55 }, youtubeId: "dQks31Ml4_M", duration: 189 },
  { id: "t049", title: "나랑 같이 걸을래", artist: "적재", subGenre: "indie-pop", mood: { energy: 42, valence: 62 }, youtubeId: "U4V0fBnVY-Q", duration: 227 },
  { id: "t050", title: "밤하늘의 별을", artist: "경서", subGenre: "indie-pop", mood: { energy: 45, valence: 55, dreamy: 65 }, youtubeId: "ZAHtwfJrJp0", duration: 218 },
  { id: "t051", title: "Sofia", artist: "Clairo", subGenre: "indie-pop", mood: { energy: 62, valence: 78 }, youtubeId: "L9l8zCOwEII", duration: 189 },
  { id: "t052", title: "Space Song", artist: "Beach House", subGenre: "indie-pop", mood: { energy: 45, valence: 42, dreamy: 88 }, youtubeId: "RBtlPT23PTM", duration: 321 },
  { id: "t053", title: "真夜中のドア", artist: "松原みき", subGenre: "city-pop", mood: { valence: 70 }, youtubeId: "nuU2YHtxMik", duration: 311 },
  { id: "t054", title: "SPARKLE", artist: "山下達郎", subGenre: "city-pop", mood: { energy: 62 }, youtubeId: "pqobRu9aR3M", duration: 257 },
  { id: "t055", title: "君は天然色", artist: "大滝詠一", subGenre: "city-pop", mood: { valence: 82 }, youtubeId: "L-hyY-1luHs", duration: 290 },
  { id: "t056", title: "Soul Lady", artist: "YUKIKA", subGenre: "city-pop", mood: { valence: 80 }, youtubeId: "942NkXvAtAM", duration: 236 },

  // ── Rock ─────────────────────────────────────────────
  { id: "t058", title: "가을 아침", artist: "아이유", subGenre: "indie-rock", mood: { energy: 48, valence: 72 }, youtubeId: "ZDoH5dQ58ps", duration: 219 },
  { id: "t059", title: "Do I Wanna Know?", artist: "Arctic Monkeys", subGenre: "indie-rock", mood: { energy: 62, valence: 32 }, youtubeId: "bpOSxM0rNPM", duration: 266 },
  { id: "t060", title: "Mr. Brightside", artist: "The Killers", subGenre: "indie-rock", mood: { energy: 88, valence: 48 }, youtubeId: "gGdGFtwCNBE", duration: 228 },
  { id: "t062", title: "Creep", artist: "Radiohead", subGenre: "modern-rock", mood: { energy: 58, valence: 22, dreamy: 38 }, youtubeId: "XFkzRNyygfk", duration: 237 },
  { id: "t063", title: "Everlong", artist: "Foo Fighters", subGenre: "modern-rock", mood: { energy: 88, valence: 58 }, youtubeId: "eBG7P-K-r1Y", duration: 292 },
  { id: "t064", title: "Yellow", artist: "Coldplay", subGenre: "modern-rock", mood: { energy: 55, valence: 62, dreamy: 48 }, youtubeId: "yKNxeF4KMsY", duration: 273 },
  { id: "t065", title: "When the Sun Hits", artist: "Slowdive", subGenre: "shoegaze", mood: { energy: 62 }, youtubeId: "MKYY0IlTMw4", duration: 290 },
  { id: "t066", title: "Sometimes", artist: "My Bloody Valentine", subGenre: "shoegaze", mood: { energy: 38 }, youtubeId: "hSI_9P9rRt4", duration: 320 },
  { id: "t067", title: "Vapour Trail", artist: "Ride", subGenre: "shoegaze", mood: { energy: 62, valence: 48 }, youtubeId: "4NrGCLSlMj0", duration: 258 },
  { id: "t068", title: "Cherry-coloured Funk", artist: "Cocteau Twins", subGenre: "shoegaze", mood: { valence: 52 }, youtubeId: "PbbUeLkZt74", duration: 193 },
  { id: "t069", title: "밤이 깊었네", artist: "크라잉넛", subGenre: "punk", mood: { valence: 58 }, youtubeId: "ct9pZdJHMrs", duration: 249 },
  { id: "t070", title: "American Idiot", artist: "Green Day", subGenre: "punk", mood: { valence: 38 }, youtubeId: "Ee_uujKuJMI", duration: 182 },
  { id: "t071", title: "Blitzkrieg Bop", artist: "Ramones", subGenre: "punk", mood: { valence: 68 }, youtubeId: "skdE0KAFCEA", duration: 135 },
  { id: "t072", title: "Should I Stay or Should I Go", artist: "The Clash", subGenre: "punk", mood: { energy: 85, valence: 58 }, youtubeId: "xMaE6toi4mk", duration: 190 },

  // ── Hip-hop ──────────────────────────────────────────
  { id: "t073", title: "C.R.E.A.M.", artist: "Wu-Tang Clan", subGenre: "boombap", mood: { valence: 28 }, youtubeId: "PBwAxmrE194", duration: 243 },
  { id: "t074", title: "They Reminisce Over You", artist: "Pete Rock & CL Smooth", subGenre: "boombap", mood: { valence: 55 }, youtubeId: "k6mdRv0ZdR8", duration: 244 },
  { id: "t075", title: "Shook Ones Pt. II", artist: "Mobb Deep", subGenre: "boombap", mood: { energy: 72, valence: 22 }, youtubeId: "yoYZf-lBF_U", duration: 265 },
  { id: "t076", title: "영순위", artist: "가리온", subGenre: "boombap", mood: { energy: 68 }, youtubeId: "Bwdv5yCUy5w", duration: 262 },
  { id: "t077", title: "Goosebumps", artist: "Travis Scott", subGenre: "trap", mood: { energy: 85, dreamy: 45 }, youtubeId: "Dst9gZkq1a8", duration: 251 },
  { id: "t078", title: "Mask Off", artist: "Future", subGenre: "trap", mood: { valence: 40 }, youtubeId: "xvZqHgFz51I", duration: 290 },
  { id: "t079", title: "XO TOUR Llif3", artist: "Lil Uzi Vert", subGenre: "trap", mood: { valence: 22 }, youtubeId: "k5PO17AC3Kg", duration: 183 },
  { id: "t081", title: "Marvins Room", artist: "Drake", subGenre: "melodic-rap", mood: { energy: 32, valence: 20, dreamy: 68 }, youtubeId: "JDb3ZZD4bA0", duration: 348 },
  { id: "t082", title: "Lucid Dreams", artist: "Juice WRLD", subGenre: "melodic-rap", mood: { valence: 25, dreamy: 62 }, youtubeId: "hHtv2XMZlKs", duration: 240 },
  { id: "t084", title: "사랑을 했다", artist: "iKON", subGenre: "melodic-rap", mood: { energy: 65, valence: 70 }, youtubeId: "vecSVX1QYbQ", duration: 212 },
  { id: "t085", title: "Luv(sic) Part 3", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { valence: 60 }, youtubeId: "Fwv2gnCFDOc", duration: 337 },
  { id: "t086", title: "Counting Stars", artist: "Nujabes", subGenre: "lofi-hiphop", mood: { energy: 35 }, youtubeId: "IXa0kLOKfwQ", duration: 248 },
  { id: "t087", title: "Coastline", artist: "Hollow Coves", subGenre: "lofi-hiphop", mood: { energy: 32, valence: 65 }, youtubeId: "eNMttIx5BWE", duration: 235 },

  // ── R&B ──────────────────────────────────────────────
  { id: "t089", title: "Brown Sugar", artist: "D'Angelo", subGenre: "neo-soul", mood: { energy: 52, valence: 70 }, youtubeId: "Uon7iKGqqaA", duration: 263 },
  { id: "t090", title: "On & On", artist: "Erykah Badu", subGenre: "neo-soul", mood: { valence: 58 }, youtubeId: "TW28iWV7nxE", duration: 227 },
  { id: "t091", title: "The Light", artist: "Common", subGenre: "neo-soul", mood: { energy: 48, valence: 72 }, youtubeId: "OjHX7jf-znA", duration: 256 },
  { id: "t092", title: "Officially Missing You", artist: "Tamia", subGenre: "neo-soul", mood: { valence: 35 }, youtubeId: "HeK1zQFJtXE", duration: 233 },
  { id: "t093", title: "Nights", artist: "Frank Ocean", subGenre: "alt-rnb", mood: { energy: 55, valence: 40 }, youtubeId: "Fx3b85eDQvw", duration: 308 },
  { id: "t095", title: "D (Half Moon)", artist: "DEAN", subGenre: "alt-rnb", mood: { valence: 38 }, youtubeId: "eelfrHtmk68", duration: 232 },
  { id: "t097", title: "Superstition", artist: "Stevie Wonder", subGenre: "funk", mood: { valence: 80 }, youtubeId: "0CFuCYNx-1g", duration: 268 },
  { id: "t098", title: "Get Lucky", artist: "Daft Punk", subGenre: "funk", mood: { energy: 72, valence: 88 }, youtubeId: "5NV6Rdv1a3I", duration: 249 },
  { id: "t099", title: "Uptown Funk", artist: "Mark Ronson", subGenre: "funk", mood: { energy: 92 }, youtubeId: "OPf0YbXqDm0", duration: 271 },
  { id: "t101", title: "Adorn", artist: "Miguel", subGenre: "slow-jam", mood: { energy: 42, valence: 68 }, youtubeId: "8dM5QYdTo08", duration: 220 },
  { id: "t102", title: "Best Part", artist: "Daniel Caesar", subGenre: "slow-jam", mood: { valence: 72, dreamy: 58 }, youtubeId: "vBy7FaapGRo", duration: 211 },
  { id: "t103", title: "다정히 내 이름을 부르면", artist: "경서예지", subGenre: "slow-jam", mood: { valence: 62 }, youtubeId: "b_6EfFZyBxY", duration: 264 },
  { id: "t104", title: "우주를 줄게", artist: "볼빨간사춘기", subGenre: "slow-jam", mood: { energy: 45, valence: 78 }, youtubeId: "9U8uA702xrE", duration: 217 },

  // ── Electronic ───────────────────────────────────────
  { id: "t106", title: "One More Time", artist: "Daft Punk", subGenre: "house", mood: { valence: 92 }, youtubeId: "FGBhQbmPwH8", duration: 322 },
  { id: "t108", title: "Starry Night", artist: "Peggy Gou", subGenre: "house", mood: { energy: 82 }, youtubeId: "r_wwmmo6UGY", duration: 399 },
  { id: "t109", title: "Weightless", artist: "Marconi Union", subGenre: "ambient", mood: { valence: 50 }, youtubeId: "UfcAVejslrU", duration: 489 },
  { id: "t110", title: "Music for Airports 1/1", artist: "Brian Eno", subGenre: "ambient", mood: { valence: 48 }, youtubeId: "LKZ3fGR2SDY", duration: 1042 },
  { id: "t111", title: "Avril 14th", artist: "Aphex Twin", subGenre: "ambient", mood: { energy: 20, valence: 35 }, youtubeId: "uxTdTaNIUxo", duration: 126 },
  { id: "t113", title: "Midnight City", artist: "M83", subGenre: "synth-pop", mood: { energy: 82, valence: 68, dreamy: 62 }, youtubeId: "dX3k_QDnzHE", duration: 244 },
  { id: "t114", title: "Take On Me", artist: "a-ha", subGenre: "synth-pop", mood: { valence: 88 }, youtubeId: "djV11Xbc914", duration: 244 },
  { id: "t115", title: "Nightcall", artist: "Kavinsky", subGenre: "synth-pop", mood: { energy: 52, valence: 28, dreamy: 72 }, youtubeId: "MV_3Dpw-BRY", duration: 257 },
  { id: "t116", title: "Instant Crush", artist: "Daft Punk", subGenre: "synth-pop", mood: { energy: 62, valence: 45, dreamy: 58 }, youtubeId: "a5uQMwRMHcs", duration: 340 },
  { id: "t117", title: "Inner Bloom", artist: "RÜFÜS DU SOL", subGenre: "dnb", mood: { energy: 62, valence: 55, dreamy: 78 }, youtubeId: "Tx9zMFodNtA", duration: 579 },
  { id: "t118", title: "Watercolour", artist: "Pendulum", subGenre: "dnb", mood: { valence: 65 }, youtubeId: "tEPB7uzKuh4", duration: 213 },
  { id: "t119", title: "Come Alive", artist: "Netsky", subGenre: "dnb", mood: { valence: 72 }, youtubeId: "0z7omu2UNVA", duration: 190 },
  { id: "t120", title: "Original Don", artist: "Major Lazer", subGenre: "dnb", mood: { energy: 92, valence: 45 }, youtubeId: "RQsNQATtdNk", duration: 254 },
];
