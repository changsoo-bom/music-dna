import type { CatalogTrack } from "@/types/music";

/**
 * 곡 카탈로그 — 178곡, 하위 장르 20종.
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
 * > t087·t097·t103 과 2차의 t126·t138~t142·t146·t147·t154·t159·t160·t167·
 * > t168·t171·t173·t176·t179·t180·t183·t185 는 팬 업로드나 방송 라이브다. 원본이 없거나 임베드가
 * > 막혀 있어서인데, **언젠가 사라진다.** `pnpm enrich` 를 주기적으로 돌려
 * > 검사하고, 재생 실패는 화면에서 국소화한다(`blocked` → 다음 곡).
 * >
 * > 레이블 채널(HYBE LABELS · 1theK · Sub Pop · Atlantic · Hospital Records
 * > 같은)은 여기 안 넣는다. 아티스트 채널만큼, 때로는 더 오래 간다.
 *
 * 목표는 300곡이고 **하위 장르당 15곡이 하한**이다 — 이미 고른 곡을 빼고
 * 나면 추천 후보가 금방 줄어든다. 지금은 국내가 하한에 가깝고 해외가 4~6곡이다.
 *
 * > [!important] 한 번에 다 못 채운다 — 할당량 때문이다
 * > `search.list` 가 곡당 **100 units** 고 하루 한도가 10,000 이다.
 * > 남은 122곡이면 12,200 units = **이틀 더**. 배치로 나눠 넣되,
 * > **한 배치가 끝날 때마다 커밋을 초록으로 남긴다** — `check-catalog` 가
 * > 모든 곡에 `youtubeId` 를 요구하므로 보강 안 된 곡을 커밋하면 CI 가 깨진다.
 * >
 * > 1차(t041~t120): 80곡 검색 → **11곡 반려**. 검색이 다른 곡을 집었다
 * > (죠지 "Loving U" → Joji "Die For You", 쿤디판다 "붕붕" → 김하온,
 * > Redbone → 213초짜리 편집본). **표를 눈으로 안 봤으면 다 들어갔다.**
 * >
 * > 2차(t121~t189): 국내 100곡 검색 → **69곡 통과**. 반려 사유가 셋이다.
 * > 레이블 채널 18곡(HYBE·JYP·SM·STARSHIP·1theK·STONE) — 위 규칙대로 뺐다.
 * > 오매칭 12곡(Colde "우리의 밤" → Sondia 동명곡, 나플라 "Visionary" →
 * > 다른 아티스트 피처링곡, 릴보이 → 50초 쇼츠). 남은 곡은 검색 할당량이
 * > 하루치(100곡 = 10,000 units)를 정확히 채워 다음 날로 넘겼다.
 */
export const CATALOG: readonly CatalogTrack[] = [
  // ── Pop ──────────────────────────────────────────────
  { id: "t001", title: "Ditto", artist: "NewJeans", subGenre: "kpop", region: "kr", mood: { energy: 62, dreamy: 55 }, youtubeId: "pSUydWEqKwE", duration: 334 },
  { id: "t002", title: "Next Level", artist: "aespa", subGenre: "kpop", region: "kr", mood: { energy: 92, valence: 70 }, youtubeId: "4TWR90KJl84", duration: 236 },
  { id: "t003", title: "옛사랑", artist: "이문세", subGenre: "ballad", region: "kr", mood: { valence: 22 }, youtubeId: "n_dA3T2jWkI", duration: 286 },
  { id: "t004", title: "모든 날, 모든 순간", artist: "폴킴", subGenre: "ballad", region: "kr", mood: { valence: 62 }, youtubeId: "EXV8TwTo0A0", duration: 218 },
  { id: "t005", title: "난춘", artist: "새소년", subGenre: "indie-pop", region: "kr", mood: { valence: 48, dreamy: 68 }, youtubeId: "KsznX5j2oQ0", duration: 251 },
  { id: "t006", title: "Bags", artist: "Clairo", subGenre: "indie-pop", region: "intl", mood: { energy: 42 }, youtubeId: "L9HYJbe9Y18", duration: 261 },
  { id: "t007", title: "Plastic Love", artist: "竹内まりや", subGenre: "city-pop", region: "intl", youtubeId: "T_lC2O1oIew", duration: 309 },
  { id: "t008", title: "Neon", artist: "YUKIKA", subGenre: "city-pop", region: "kr", mood: { energy: 62 }, youtubeId: "67jSYCSrnE4", duration: 276 },

  // ── Rock ─────────────────────────────────────────────
  { id: "t009", title: "Tik Tak Tok", artist: "실리카겔", subGenre: "indie-rock", region: "kr", mood: { energy: 82, dreamy: 58 }, youtubeId: "DIPxnt5vnhU", duration: 451 },
  { id: "t010", title: "주저하는 연인들을 위해", artist: "잔나비", subGenre: "indie-rock", region: "kr", mood: { energy: 45, valence: 48 }, youtubeId: "GpQ222I1ULc", duration: 279 },
  { id: "t011", title: "기억을 걷는 시간", artist: "넬", subGenre: "modern-rock", region: "kr", mood: { valence: 25, dreamy: 55 }, youtubeId: "83IfZhO4Pd0", duration: 345 },
  { id: "t012", title: "Somebody Else", artist: "The 1975", subGenre: "modern-rock", region: "intl", mood: { energy: 58, valence: 30, dreamy: 62 }, youtubeId: "jUj5h_IdPJI", duration: 348 },
  { id: "t013", title: "Alison", artist: "Slowdive", subGenre: "shoegaze", region: "intl", youtubeId: "jkM3M3zGcGE", duration: 228 },
  { id: "t014", title: "Only Shallow", artist: "My Bloody Valentine", subGenre: "shoegaze", region: "intl", mood: { energy: 82 }, youtubeId: "FyYMzEplnfU", duration: 224 },
  { id: "t015", title: "말달리자", artist: "크라잉넛", subGenre: "punk", region: "kr", mood: { valence: 72 }, youtubeId: "VcjbIbwJOzc", duration: 187 },
  { id: "t016", title: "Basket Case", artist: "Green Day", subGenre: "punk", region: "intl", mood: { valence: 55 }, youtubeId: "NUTGr5t3MoY", duration: 195 },

  // ── Hip-hop ──────────────────────────────────────────
  { id: "t017", title: "N.Y. State of Mind", artist: "Nas", subGenre: "boombap", region: "intl", mood: { valence: 25 }, youtubeId: "hI8A14Qcv68", duration: 296 },
  { id: "t018", title: "무투", artist: "가리온", subGenre: "boombap", region: "kr", mood: { energy: 72 }, youtubeId: "B3fWqo43FYo", duration: 233 },
  { id: "t019", title: "SICKO MODE", artist: "Travis Scott", subGenre: "trap", region: "intl", mood: { energy: 90 }, youtubeId: "6ONRf7h3Mdk", duration: 323 },
  { id: "t020", title: "Day Day", artist: "BewhY", subGenre: "trap", region: "kr", mood: { valence: 52 }, youtubeId: "AMWOLv4Y_0Y", duration: 210 },
  { id: "t021", title: "Passionfruit", artist: "Drake", subGenre: "melodic-rap", region: "intl", mood: { energy: 45, dreamy: 65 }, youtubeId: "COz9lDCFHjw", duration: 299 },
  { id: "t022", title: "Nerdy Love", artist: "pH-1", subGenre: "melodic-rap", region: "kr", mood: { valence: 72 }, youtubeId: "FFkLoUwQ9a4", duration: 200 },
  { id: "t023", title: "Aruarian Dance", artist: "Nujabes", subGenre: "lofi-hiphop", region: "intl", mood: { valence: 62 }, youtubeId: "qYcoJpqCha4", duration: 251 },
  { id: "t024", title: "Feather", artist: "Nujabes", subGenre: "lofi-hiphop", region: "intl", mood: { energy: 45 }, youtubeId: "hQ5x8pHoIPA", duration: 176 },

  // ── R&B ──────────────────────────────────────────────
  { id: "t025", title: "Untitled (How Does It Feel)", artist: "D'Angelo", subGenre: "neo-soul", region: "intl", mood: { energy: 32 }, youtubeId: "SxVNOnPyvIU", duration: 264 },
  { id: "t026", title: "Boat", artist: "죠지", subGenre: "neo-soul", region: "kr", mood: { valence: 55, dreamy: 60 }, youtubeId: "PHU06V7BhEc", duration: 198 },
  { id: "t027", title: "Pink + White", artist: "Frank Ocean", subGenre: "alt-rnb", region: "intl", mood: { valence: 68 }, youtubeId: "9cHbvRUALrc", duration: 185 },
  { id: "t028", title: "instagram", artist: "DEAN", subGenre: "alt-rnb", region: "kr", mood: { valence: 20 }, youtubeId: "wKyMIrBClYw", duration: 279 },
  { id: "t029", title: "September", artist: "Earth, Wind & Fire", subGenre: "funk", region: "intl", youtubeId: "Gs069dndIYk", duration: 216 },
  { id: "t030", title: "정말 사랑했을까", artist: "브라운 아이드 소울", subGenre: "funk", region: "kr", mood: { energy: 58, valence: 55 }, youtubeId: "NsRHHcTJYUs", duration: 273 },
  { id: "t031", title: "Good Days", artist: "SZA", subGenre: "slow-jam", region: "intl", mood: { dreamy: 68 }, youtubeId: "0BdlKkvjEgA", duration: 281 },
  { id: "t032", title: "Square", artist: "백예린", subGenre: "slow-jam", region: "kr", mood: { valence: 48, dreamy: 62 }, youtubeId: "4iFP_wd6QU8", duration: 263 },

  // ── Electronic ───────────────────────────────────────
  { id: "t033", title: "Latch", artist: "Disclosure", subGenre: "house", region: "intl", mood: { valence: 78 }, youtubeId: "93ASUImTedo", duration: 257 },
  { id: "t034", title: "It Makes You Forget", artist: "Peggy Gou", subGenre: "house", region: "intl", mood: { dreamy: 52 }, youtubeId: "SlbVgjFvE3I", duration: 396 },
  { id: "t035", title: "An Ending (Ascent)", artist: "Brian Eno", subGenre: "ambient", region: "intl", mood: { valence: 55 }, youtubeId: "OlaTeXX3uH8", duration: 262 },
  { id: "t036", title: "A Walk", artist: "Tycho", subGenre: "ambient", region: "intl", mood: { energy: 42, valence: 62, dreamy: 78 }, youtubeId: "SDNA934EEVk", duration: 317 },
  { id: "t037", title: "Blinding Lights", artist: "The Weeknd", subGenre: "synth-pop", region: "intl", mood: { energy: 88, valence: 62 }, youtubeId: "4NRXx6U8ABQ", duration: 263 },
  { id: "t038", title: "Levitating", artist: "Dua Lipa", subGenre: "synth-pop", region: "intl", mood: { valence: 92 }, youtubeId: "TUVcZfQe-Kw", duration: 231 },
  { id: "t039", title: "The Island", artist: "Pendulum", subGenre: "dnb", region: "intl", mood: { valence: 72 }, youtubeId: "hszZmFRPqx8", duration: 229 },
  { id: "t040", title: "Rio", artist: "Netsky", subGenre: "dnb", region: "intl", mood: { valence: 68 }, youtubeId: "qFDP9egTwfM", duration: 236 },

  /* ── 확장 1차 ─────────────────────────────────────────
     하위 장르당 4곡씩. `youtubeId`·`duration` 은 `pnpm enrich` 가 채우고,
     검색이 집어 온 제목·채널을 눈으로 확인한 뒤 `apply-enrich` 로 넣는다.
     한 번에 300곡을 못 채우는 이유는 할당량이다 — 검색이 곡당 100 units,
     하루 한도가 10,000 이라 260곡이면 사흘이다. */

  // ── Pop ──────────────────────────────────────────────
  { id: "t041", title: "Hype Boy", artist: "NewJeans", subGenre: "kpop", region: "kr", mood: { valence: 88 }, youtubeId: "11cta61wi0g", duration: 178 },
  { id: "t042", title: "How Sweet", artist: "NewJeans", subGenre: "kpop", region: "kr", mood: { energy: 85 }, youtubeId: "Q3K0TOvTOno", duration: 243 },
  { id: "t043", title: "Magnetic", artist: "ILLIT", subGenre: "kpop", region: "kr", mood: { valence: 90 }, youtubeId: "Vk5-c_v4gMU", duration: 189 },
  { id: "t044", title: "Super Shy", artist: "NewJeans", subGenre: "kpop", region: "kr", mood: { energy: 82, valence: 88 }, youtubeId: "ArmDp-zijuc", duration: 201 },
  { id: "t045", title: "봄날", artist: "방탄소년단", subGenre: "ballad", region: "kr", mood: { energy: 42, valence: 40, dreamy: 58 }, youtubeId: "xEeFrLSkMm8", duration: 329 },
  { id: "t046", title: "밤편지", artist: "아이유", subGenre: "ballad", region: "kr", mood: { valence: 45, dreamy: 62 }, youtubeId: "BzYnNdJhZQw", duration: 283 },
  { id: "t047", title: "너의 모든 순간", artist: "성시경", subGenre: "ballad", region: "kr", mood: { valence: 52 }, youtubeId: "i2aRMXZR1k0", duration: 241 },
  { id: "t048", title: "이 밤을 빌려 말해요", artist: "십센치", subGenre: "ballad", region: "kr", mood: { valence: 48, dreamy: 55 }, youtubeId: "dQks31Ml4_M", duration: 189 },
  { id: "t049", title: "나랑 같이 걸을래", artist: "적재", subGenre: "indie-pop", region: "kr", mood: { energy: 42, valence: 62 }, youtubeId: "U4V0fBnVY-Q", duration: 227 },
  { id: "t050", title: "밤하늘의 별을", artist: "경서", subGenre: "indie-pop", region: "kr", mood: { energy: 45, valence: 55, dreamy: 65 }, youtubeId: "ZAHtwfJrJp0", duration: 218 },
  { id: "t051", title: "Sofia", artist: "Clairo", subGenre: "indie-pop", region: "intl", mood: { energy: 62, valence: 78 }, youtubeId: "L9l8zCOwEII", duration: 189 },
  { id: "t052", title: "Space Song", artist: "Beach House", subGenre: "indie-pop", region: "intl", mood: { energy: 45, valence: 42, dreamy: 88 }, youtubeId: "RBtlPT23PTM", duration: 321 },
  { id: "t053", title: "真夜中のドア", artist: "松原みき", subGenre: "city-pop", region: "intl", mood: { valence: 70 }, youtubeId: "nuU2YHtxMik", duration: 311 },
  { id: "t054", title: "SPARKLE", artist: "山下達郎", subGenre: "city-pop", region: "intl", mood: { energy: 62 }, youtubeId: "pqobRu9aR3M", duration: 257 },
  { id: "t055", title: "君は天然色", artist: "大滝詠一", subGenre: "city-pop", region: "intl", mood: { valence: 82 }, youtubeId: "L-hyY-1luHs", duration: 290 },
  { id: "t056", title: "Soul Lady", artist: "YUKIKA", subGenre: "city-pop", region: "kr", mood: { valence: 80 }, youtubeId: "942NkXvAtAM", duration: 236 },

  // ── Rock ─────────────────────────────────────────────
  { id: "t058", title: "가을 아침", artist: "아이유", subGenre: "indie-rock", region: "kr", mood: { energy: 48, valence: 72 }, youtubeId: "ZDoH5dQ58ps", duration: 219 },
  { id: "t059", title: "Do I Wanna Know?", artist: "Arctic Monkeys", subGenre: "indie-rock", region: "intl", mood: { energy: 62, valence: 32 }, youtubeId: "bpOSxM0rNPM", duration: 266 },
  { id: "t060", title: "Mr. Brightside", artist: "The Killers", subGenre: "indie-rock", region: "intl", mood: { energy: 88, valence: 48 }, youtubeId: "gGdGFtwCNBE", duration: 228 },
  { id: "t062", title: "Creep", artist: "Radiohead", subGenre: "modern-rock", region: "intl", mood: { energy: 58, valence: 22, dreamy: 38 }, youtubeId: "XFkzRNyygfk", duration: 237 },
  { id: "t063", title: "Everlong", artist: "Foo Fighters", subGenre: "modern-rock", region: "intl", mood: { energy: 88, valence: 58 }, youtubeId: "eBG7P-K-r1Y", duration: 292 },
  { id: "t064", title: "Yellow", artist: "Coldplay", subGenre: "modern-rock", region: "intl", mood: { energy: 55, valence: 62, dreamy: 48 }, youtubeId: "yKNxeF4KMsY", duration: 273 },
  { id: "t065", title: "When the Sun Hits", artist: "Slowdive", subGenre: "shoegaze", region: "intl", mood: { energy: 62 }, youtubeId: "MKYY0IlTMw4", duration: 290 },
  { id: "t066", title: "Sometimes", artist: "My Bloody Valentine", subGenre: "shoegaze", region: "intl", mood: { energy: 38 }, youtubeId: "hSI_9P9rRt4", duration: 320 },
  { id: "t067", title: "Vapour Trail", artist: "Ride", subGenre: "shoegaze", region: "intl", mood: { energy: 62, valence: 48 }, youtubeId: "4NrGCLSlMj0", duration: 258 },
  { id: "t068", title: "Cherry-coloured Funk", artist: "Cocteau Twins", subGenre: "shoegaze", region: "intl", mood: { valence: 52 }, youtubeId: "PbbUeLkZt74", duration: 193 },
  { id: "t069", title: "밤이 깊었네", artist: "크라잉넛", subGenre: "punk", region: "kr", mood: { valence: 58 }, youtubeId: "ct9pZdJHMrs", duration: 249 },
  { id: "t070", title: "American Idiot", artist: "Green Day", subGenre: "punk", region: "intl", mood: { valence: 38 }, youtubeId: "Ee_uujKuJMI", duration: 182 },
  { id: "t071", title: "Blitzkrieg Bop", artist: "Ramones", subGenre: "punk", region: "intl", mood: { valence: 68 }, youtubeId: "skdE0KAFCEA", duration: 135 },
  { id: "t072", title: "Should I Stay or Should I Go", artist: "The Clash", subGenre: "punk", region: "intl", mood: { energy: 85, valence: 58 }, youtubeId: "xMaE6toi4mk", duration: 190 },

  // ── Hip-hop ──────────────────────────────────────────
  { id: "t073", title: "C.R.E.A.M.", artist: "Wu-Tang Clan", subGenre: "boombap", region: "intl", mood: { valence: 28 }, youtubeId: "PBwAxmrE194", duration: 243 },
  { id: "t074", title: "They Reminisce Over You", artist: "Pete Rock & CL Smooth", subGenre: "boombap", region: "intl", mood: { valence: 55 }, youtubeId: "k6mdRv0ZdR8", duration: 244 },
  { id: "t075", title: "Shook Ones Pt. II", artist: "Mobb Deep", subGenre: "boombap", region: "intl", mood: { energy: 72, valence: 22 }, youtubeId: "yoYZf-lBF_U", duration: 265 },
  { id: "t076", title: "영순위", artist: "가리온", subGenre: "boombap", region: "kr", mood: { energy: 68 }, youtubeId: "Bwdv5yCUy5w", duration: 262 },
  { id: "t077", title: "Goosebumps", artist: "Travis Scott", subGenre: "trap", region: "intl", mood: { energy: 85, dreamy: 45 }, youtubeId: "Dst9gZkq1a8", duration: 251 },
  { id: "t078", title: "Mask Off", artist: "Future", subGenre: "trap", region: "intl", mood: { valence: 40 }, youtubeId: "xvZqHgFz51I", duration: 290 },
  { id: "t079", title: "XO TOUR Llif3", artist: "Lil Uzi Vert", subGenre: "trap", region: "intl", mood: { valence: 22 }, youtubeId: "k5PO17AC3Kg", duration: 183 },
  { id: "t081", title: "Marvins Room", artist: "Drake", subGenre: "melodic-rap", region: "intl", mood: { energy: 32, valence: 20, dreamy: 68 }, youtubeId: "JDb3ZZD4bA0", duration: 348 },
  { id: "t082", title: "Lucid Dreams", artist: "Juice WRLD", subGenre: "melodic-rap", region: "intl", mood: { valence: 25, dreamy: 62 }, youtubeId: "hHtv2XMZlKs", duration: 240 },
  { id: "t084", title: "사랑을 했다", artist: "iKON", subGenre: "melodic-rap", region: "kr", mood: { energy: 65, valence: 70 }, youtubeId: "vecSVX1QYbQ", duration: 212 },
  { id: "t085", title: "Luv(sic) Part 3", artist: "Nujabes", subGenre: "lofi-hiphop", region: "intl", mood: { valence: 60 }, youtubeId: "Fwv2gnCFDOc", duration: 337 },
  { id: "t086", title: "Counting Stars", artist: "Nujabes", subGenre: "lofi-hiphop", region: "intl", mood: { energy: 35 }, youtubeId: "IXa0kLOKfwQ", duration: 248 },
  { id: "t087", title: "Coastline", artist: "Hollow Coves", subGenre: "lofi-hiphop", region: "intl", mood: { energy: 32, valence: 65 }, youtubeId: "eNMttIx5BWE", duration: 235 },

  // ── R&B ──────────────────────────────────────────────
  { id: "t089", title: "Brown Sugar", artist: "D'Angelo", subGenre: "neo-soul", region: "intl", mood: { energy: 52, valence: 70 }, youtubeId: "Uon7iKGqqaA", duration: 263 },
  { id: "t090", title: "On & On", artist: "Erykah Badu", subGenre: "neo-soul", region: "intl", mood: { valence: 58 }, youtubeId: "TW28iWV7nxE", duration: 227 },
  { id: "t091", title: "The Light", artist: "Common", subGenre: "neo-soul", region: "intl", mood: { energy: 48, valence: 72 }, youtubeId: "OjHX7jf-znA", duration: 256 },
  { id: "t092", title: "Officially Missing You", artist: "Tamia", subGenre: "neo-soul", region: "intl", mood: { valence: 35 }, youtubeId: "HeK1zQFJtXE", duration: 233 },
  { id: "t093", title: "Nights", artist: "Frank Ocean", subGenre: "alt-rnb", region: "intl", mood: { energy: 55, valence: 40 }, youtubeId: "Fx3b85eDQvw", duration: 308 },
  { id: "t095", title: "D (Half Moon)", artist: "DEAN", subGenre: "alt-rnb", region: "kr", mood: { valence: 38 }, youtubeId: "eelfrHtmk68", duration: 232 },
  { id: "t097", title: "Superstition", artist: "Stevie Wonder", subGenre: "funk", region: "intl", mood: { valence: 80 }, youtubeId: "0CFuCYNx-1g", duration: 268 },
  { id: "t098", title: "Get Lucky", artist: "Daft Punk", subGenre: "funk", region: "intl", mood: { energy: 72, valence: 88 }, youtubeId: "5NV6Rdv1a3I", duration: 249 },
  { id: "t099", title: "Uptown Funk", artist: "Mark Ronson", subGenre: "funk", region: "intl", mood: { energy: 92 }, youtubeId: "OPf0YbXqDm0", duration: 271 },
  { id: "t101", title: "Adorn", artist: "Miguel", subGenre: "slow-jam", region: "intl", mood: { energy: 42, valence: 68 }, youtubeId: "8dM5QYdTo08", duration: 220 },
  { id: "t102", title: "Best Part", artist: "Daniel Caesar", subGenre: "slow-jam", region: "intl", mood: { valence: 72, dreamy: 58 }, youtubeId: "vBy7FaapGRo", duration: 211 },
  { id: "t103", title: "다정히 내 이름을 부르면", artist: "경서예지", subGenre: "slow-jam", region: "kr", mood: { valence: 62 }, youtubeId: "b_6EfFZyBxY", duration: 264 },
  { id: "t104", title: "우주를 줄게", artist: "볼빨간사춘기", subGenre: "slow-jam", region: "kr", mood: { energy: 45, valence: 78 }, youtubeId: "9U8uA702xrE", duration: 217 },

  // ── Electronic ───────────────────────────────────────
  { id: "t106", title: "One More Time", artist: "Daft Punk", subGenre: "house", region: "intl", mood: { valence: 92 }, youtubeId: "FGBhQbmPwH8", duration: 322 },
  { id: "t108", title: "Starry Night", artist: "Peggy Gou", subGenre: "house", region: "intl", mood: { energy: 82 }, youtubeId: "r_wwmmo6UGY", duration: 399 },
  { id: "t109", title: "Weightless", artist: "Marconi Union", subGenre: "ambient", region: "intl", mood: { valence: 50 }, youtubeId: "UfcAVejslrU", duration: 489 },
  { id: "t110", title: "Music for Airports 1/1", artist: "Brian Eno", subGenre: "ambient", region: "intl", mood: { valence: 48 }, youtubeId: "LKZ3fGR2SDY", duration: 1042 },
  { id: "t111", title: "Avril 14th", artist: "Aphex Twin", subGenre: "ambient", region: "intl", mood: { energy: 20, valence: 35 }, youtubeId: "uxTdTaNIUxo", duration: 126 },
  { id: "t113", title: "Midnight City", artist: "M83", subGenre: "synth-pop", region: "intl", mood: { energy: 82, valence: 68, dreamy: 62 }, youtubeId: "dX3k_QDnzHE", duration: 244 },
  { id: "t114", title: "Take On Me", artist: "a-ha", subGenre: "synth-pop", region: "intl", mood: { valence: 88 }, youtubeId: "djV11Xbc914", duration: 244 },
  { id: "t115", title: "Nightcall", artist: "Kavinsky", subGenre: "synth-pop", region: "intl", mood: { energy: 52, valence: 28, dreamy: 72 }, youtubeId: "MV_3Dpw-BRY", duration: 257 },
  { id: "t116", title: "Instant Crush", artist: "Daft Punk", subGenre: "synth-pop", region: "intl", mood: { energy: 62, valence: 45, dreamy: 58 }, youtubeId: "a5uQMwRMHcs", duration: 340 },
  { id: "t117", title: "Inner Bloom", artist: "RÜFÜS DU SOL", subGenre: "dnb", region: "intl", mood: { energy: 62, valence: 55, dreamy: 78 }, youtubeId: "Tx9zMFodNtA", duration: 579 },
  { id: "t118", title: "Watercolour", artist: "Pendulum", subGenre: "dnb", region: "intl", mood: { valence: 65 }, youtubeId: "tEPB7uzKuh4", duration: 213 },
  { id: "t119", title: "Come Alive", artist: "Netsky", subGenre: "dnb", region: "intl", mood: { valence: 72 }, youtubeId: "0z7omu2UNVA", duration: 190 },
  { id: "t120", title: "Original Don", artist: "Major Lazer", subGenre: "dnb", region: "intl", mood: { energy: 92, valence: 45 }, youtubeId: "RQsNQATtdNk", duration: 254 },

  // ── 2차 국내 배치 (t121~t189) ────────────────────────
  { id: "t121", title: "으르렁", artist: "EXO", subGenre: "kpop", region: "kr", youtubeId: "rjMcJHfzoIs", duration: 208 },
  { id: "t122", title: "Gee", artist: "소녀시대", subGenre: "kpop", region: "kr", youtubeId: "12OHeq-qYwI", duration: 202 },
  { id: "t123", title: "ASAP", artist: "STAYC", subGenre: "kpop", region: "kr", youtubeId: "aHR8zak8Xsc", duration: 195 },
  { id: "t124", title: "뚜두뚜두", artist: "BLACKPINK", subGenre: "kpop", region: "kr", youtubeId: "IHNzOHi8sJs", duration: 216 },
  { id: "t125", title: "TOMBOY", artist: "(여자)아이들", subGenre: "kpop", region: "kr", youtubeId: "Jh4QFaPmdss", duration: 198 },
  { id: "t126", title: "빨간 맛", artist: "Red Velvet", subGenre: "kpop", region: "kr", youtubeId: "r9UMwwUCl1g", duration: 201 },
  { id: "t127", title: "바람이 분다", artist: "이소라", subGenre: "ballad", region: "kr", youtubeId: "Fk__GLYSFMw", duration: 237 },
  { id: "t128", title: "서른 즈음에", artist: "김광석", subGenre: "ballad", region: "kr", youtubeId: "mnh3X3wzpYs", duration: 283 },
  { id: "t129", title: "너를 위해", artist: "임재범", subGenre: "ballad", region: "kr", youtubeId: "GiKvLl1V6mY", duration: 248 },
  { id: "t130", title: "서쪽 하늘", artist: "이승철", subGenre: "ballad", region: "kr", youtubeId: "4n8oU-4MDGs", duration: 244 },
  { id: "t131", title: "야생화", artist: "박효신", subGenre: "ballad", region: "kr", youtubeId: "ZtcM3KhgF-s", duration: 313 },
  { id: "t132", title: "보고싶다", artist: "김범수", subGenre: "ballad", region: "kr", youtubeId: "hlx3DZQA5PY", duration: 245 },
  { id: "t133", title: "만약에", artist: "태연", subGenre: "ballad", region: "kr", youtubeId: "RjU5Op_KSBw", duration: 266 },
  { id: "t134", title: "다행이다", artist: "이적", subGenre: "ballad", region: "kr", youtubeId: "59y92uRqV7g", duration: 213 },
  { id: "t135", title: "그대 돌아오면", artist: "거미", subGenre: "ballad", region: "kr", youtubeId: "aWVB3CjkPW0", duration: 277 },
  { id: "t136", title: "강아지", artist: "검정치마", subGenre: "indie-pop", region: "kr", youtubeId: "YcG3FGwEdMg", duration: 209 },
  { id: "t137", title: "나무", artist: "카더가든", subGenre: "indie-pop", region: "kr", youtubeId: "cCB8WugrfPE", duration: 228 },
  { id: "t138", title: "수고했어 오늘도", artist: "옥상달빛", subGenre: "indie-pop", region: "kr", youtubeId: "lnre7tFfKx4", duration: 178 },
  { id: "t139", title: "위잉위잉", artist: "혁오", subGenre: "indie-pop", region: "kr", youtubeId: "GIa80KLuDwc", duration: 194 },
  { id: "t140", title: "숲", artist: "최유리", subGenre: "indie-pop", region: "kr", youtubeId: "COcuU8LKawk", duration: 229 },
  { id: "t141", title: "오래된 노래", artist: "스탠딩 에그", subGenre: "indie-pop", region: "kr", youtubeId: "_bXarqHwbkY", duration: 282 },
  { id: "t142", title: "이 바보야", artist: "정승환", subGenre: "indie-pop", region: "kr", youtubeId: "Qrr0EBtQR9o", duration: 228 },
  { id: "t143", title: "오랜만에", artist: "김현철", subGenre: "city-pop", region: "kr", youtubeId: "89hHEaDc3bo", duration: 327 },
  { id: "t144", title: "샴푸의 요정", artist: "빛과 소금", subGenre: "city-pop", region: "kr", youtubeId: "af-gM-w2yyM", duration: 224 },
  { id: "t145", title: "붉은 노을", artist: "이문세", subGenre: "city-pop", region: "kr", youtubeId: "EM0P2NiEiO4", duration: 228 },
  { id: "t146", title: "이별의 그늘", artist: "윤상", subGenre: "city-pop", region: "kr", youtubeId: "ee-OBWRbURA", duration: 275 },
  { id: "t147", title: "삐에로는 우릴 보고 웃지", artist: "김완선", subGenre: "city-pop", region: "kr", youtubeId: "KyM1zy-dPyo", duration: 277 },
  { id: "t148", title: "챠우챠우", artist: "델리스파이스", subGenre: "indie-rock", region: "kr", youtubeId: "wecpRs9p00E", duration: 270 },
  { id: "t149", title: "아름다운 것", artist: "언니네 이발관", subGenre: "indie-rock", region: "kr", youtubeId: "3iHBlNgjQQo", duration: 292 },
  { id: "t150", title: "싸구려 커피", artist: "장기하와 얼굴들", subGenre: "indie-rock", region: "kr", youtubeId: "AMShjMwlCug", duration: 254 },
  { id: "t151", title: "거울", artist: "국카스텐", subGenre: "indie-rock", region: "kr", youtubeId: "6n910kfzvx0", duration: 281 },
  { id: "t152", title: "Antifreeze", artist: "검정치마", subGenre: "indie-rock", region: "kr", youtubeId: "PGADim6UzHE", duration: 244 },
  { id: "t153", title: "보편적인 노래", artist: "브로콜리너마저", subGenre: "indie-rock", region: "kr", youtubeId: "zrXHySXfdhk", duration: 423 },
  { id: "t154", title: "좋다", artist: "데이브레이크", subGenre: "indie-rock", region: "kr", youtubeId: "C2KQVD0GeaM", duration: 195 },
  { id: "t155", title: "Stay", artist: "넬", subGenre: "modern-rock", region: "kr", youtubeId: "bmivgWKzGkM", duration: 219 },
  { id: "t156", title: "매직 카펫 라이드", artist: "자우림", subGenre: "modern-rock", region: "kr", youtubeId: "JUdwUb6QN5w", duration: 215 },
  { id: "t157", title: "나는 나비", artist: "YB", subGenre: "modern-rock", region: "kr", youtubeId: "U0Lljwv8djo", duration: 216 },
  { id: "t158", title: "Never Ending Story", artist: "부활", subGenre: "modern-rock", region: "kr", youtubeId: "7ATP7h-pB2I", duration: 254 },
  { id: "t159", title: "외톨이야", artist: "씨엔블루", subGenre: "modern-rock", region: "kr", youtubeId: "5mpQHCqKZQI", duration: 218 },
  { id: "t160", title: "낭만고양이", artist: "체리필터", subGenre: "modern-rock", region: "kr", youtubeId: "5hMWfXmTHIQ", duration: 235 },
  { id: "t161", title: "Desert Eagle", artist: "실리카겔", subGenre: "shoegaze", region: "kr", youtubeId: "IWYft_hOIgo", duration: 310 },
  { id: "t162", title: "넌 내게 반했어", artist: "노브레인", subGenre: "punk", region: "kr", youtubeId: "Rm6R92J4bbY", duration: 224 },
  { id: "t163", title: "Fly", artist: "에픽하이", subGenre: "boombap", region: "kr", youtubeId: "sHqLlyBlmQI", duration: 202 },
  { id: "t164", title: "좋아보여", artist: "버벌진트", subGenre: "boombap", region: "kr", youtubeId: "4gDSvqpUjGA", duration: 209 },
  { id: "t165", title: "양화", artist: "딥플로우", subGenre: "boombap", region: "kr", youtubeId: "ULownpnLKAc", duration: 283 },
  { id: "t166", title: "작은 것들의 신", artist: "넉살", subGenre: "boombap", region: "kr", youtubeId: "4el2gZnzR4o", duration: 222 },
  { id: "t167", title: "죽일 놈", artist: "다이나믹 듀오", subGenre: "boombap", region: "kr", youtubeId: "ppjRIEgcXIY", duration: 224 },
  { id: "t168", title: "발레리노", artist: "리쌍", subGenre: "boombap", region: "kr", youtubeId: "G3qS8dD4kOk", duration: 266 },
  { id: "t169", title: "Don't Call Me", artist: "염따", subGenre: "trap", region: "kr", youtubeId: "eC-MWUaOMfw", duration: 166 },
  { id: "t170", title: "사이먼 도미닉", artist: "사이먼 도미닉", subGenre: "trap", region: "kr", youtubeId: "ckV2_1GjLVg", duration: 224 },
  { id: "t171", title: "호구", artist: "기리보이", subGenre: "trap", region: "kr", youtubeId: "YSAiVRIq6Ig", duration: 229 },
  { id: "t172", title: "하기나 해", artist: "그레이", subGenre: "melodic-rap", region: "kr", youtubeId: "kRPUfhPP-E8", duration: 229 },
  { id: "t173", title: "아무노래", artist: "지코", subGenre: "melodic-rap", region: "kr", youtubeId: "yL6P7OR5WOM", duration: 228 },
  { id: "t174", title: "빌런", artist: "스텔라장", subGenre: "neo-soul", region: "kr", youtubeId: "eWSrYT9zC-s", duration: 191 },
  { id: "t175", title: "Let's go picnic", artist: "죠지", subGenre: "neo-soul", region: "kr", youtubeId: "Ba4RrhpLD7Y", duration: 232 },
  { id: "t176", title: "도망가자", artist: "선우정아", subGenre: "neo-soul", region: "kr", youtubeId: "D0l1HdemykU", duration: 275 },
  { id: "t177", title: "소녀", artist: "오혁", subGenre: "alt-rnb", region: "kr", youtubeId: "aLX3b3j6z3g", duration: 227 },
  { id: "t178", title: "bath", artist: "offonoff", subGenre: "alt-rnb", region: "kr", youtubeId: "UhOVBzQ6wJk", duration: 262 },
  { id: "t179", title: "양화대교", artist: "자이언티", subGenre: "alt-rnb", region: "kr", youtubeId: "vfDb8uTp2DU", duration: 230 },
  { id: "t180", title: "잊어버리지마", artist: "크러쉬", subGenre: "alt-rnb", region: "kr", youtubeId: "s7l_sxaqTpk", duration: 220 },
  { id: "t181", title: "아니 벌써", artist: "산울림", subGenre: "funk", region: "kr", youtubeId: "79E5IDyg1vo", duration: 342 },
  { id: "t182", title: "요술왕자", artist: "술탄 오브 더 디스코", subGenre: "funk", region: "kr", youtubeId: "_Z24i2S8tiA", duration: 253 },
  { id: "t183", title: "범 내려온다", artist: "이날치", subGenre: "funk", region: "kr", youtubeId: "SmTRaSg2fTQ", duration: 337 },
  { id: "t184", title: "거북이", artist: "다비치", subGenre: "slow-jam", region: "kr", youtubeId: "12u5oZpowzs", duration: 224 },
  { id: "t185", title: "그건 아마 우리의 잘못은 아닐 거야", artist: "백예린", subGenre: "slow-jam", region: "kr", youtubeId: "_EfRa_ywkEw", duration: 244 },
  { id: "t186", title: "Bang Bus", artist: "250", subGenre: "house", region: "kr", youtubeId: "t97sOAW_G7U", duration: 241 },
  { id: "t187", title: "Melodie", artist: "이디오테잎", subGenre: "house", region: "kr", youtubeId: "emoadwiK4TM", duration: 301 },
  { id: "t188", title: "텅 빈 거리에서", artist: "015B", subGenre: "synth-pop", region: "kr", youtubeId: "4xhoZKk16Q4", duration: 307 },
  { id: "t189", title: "난 알아요", artist: "서태지와 아이들", subGenre: "synth-pop", region: "kr", youtubeId: "OEDHEzs5kyk", duration: 205 },
];
