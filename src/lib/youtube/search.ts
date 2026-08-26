import { z } from "zod";

import { classify } from "@/lib/youtube/classify";
import { songsFirst } from "@/lib/youtube/song";
import type { RemoteArtist, RemoteTrack } from "@/types/music";

/**
 * YouTube 에서 곡을 찾는다. **카탈로그에서 못 찾았을 때만 부른다** → `/search`
 *
 * ## 할당량이 이 파일의 설계를 정한다
 *
 * `search.list` 는 **한 번에 100 units** 고 하루 한도가 10,000 이다 —
 * 사이트 전체가 **하루 100번** 검색할 수 있다는 뜻이다. 그래서 두 가지를 지킨다.
 *
 * 1. **검색은 한 번뿐이다.** 가수인지 곡 제목인지를 먼저 물어보고 그 다음에
 *    찾으면 200 units 이다. 대신 영상 검색 한 번을 하고 **결과가 한 채널로
 *    몰리는지를 보고** 가수 질의였다고 판정한다(`classify`). 가수면 거기서
 *    채널 id 를 이미 알고 있으므로, 나머지는 1 units 짜리 호출로 끝난다:
 *    `channels.list`(정보 + 업로드 목록 id) → `playlistItems.list`(그 가수의 곡).
 * 2. **같은 말은 한 번만 산다.** `fetch` 를 하루 캐시로 감싼다. 캐시 키는
 *    주소이므로 검색어가 곧 키다 → `.claude/rules/data.md`
 *
 * 여기에 `videos.list` 한 번(1 unit)이 붙는다 — 곡 제목 질의는 101, 가수
 * 질의는 103 units. 길이를 받아 오는 값인데, 화면에 곡 길이를 그리는 것보다
 * **쇼츠와 한 시간짜리 반복 영상을 거르는 쪽이 크다**(`isSongLength`).
 *
 * ## 노래만 남긴다
 *
 * `videoCategoryId=10`(음악)으로는 안무 영상이 안 걸러진다 — 그것도 음악
 * 카테고리다. 받아 온 결과를 제목·채널로 거르고 음원을 앞에 세운다
 * (`songsFirst`). 거기는 호출이 안 늘어나서 공짜다.
 *
 * ## 실패는 던지지 않는다
 *
 * 할당량이 마르거나 키가 없어도 **화면은 살아 있어야 한다.** 카탈로그 결과는
 * 이미 그려져 있고, 여기서 던지면 그것까지 같이 죽는다. 그래서 예외 대신
 * 상태를 돌려준다 — 화면이 "지금은 카탈로그만 보여 드립니다" 라고 말할 수
 * 있어야 한다. 예상 못 한 실패는 `search/error.tsx` 가 받는다.
 *
 * ## 키는 서버 밖으로 안 나간다
 *
 * **`NEXT_PUBLIC_` 접두사를 절대 안 붙인다.** 그것이 없으면 Next 는 이 값을
 * 클라이언트 번들에 안 심는다 — 이 파일이 어쩌다 클라이언트로 딸려 가도
 * 키는 `undefined` 지 노출이 아니다.
 *
 * 다만 그때 이 모듈은 **조용히 안 되는 코드**가 된다. `server-only` 패키지를
 * 넣으면 그런 import 자체가 빌드 에러가 되는데, 지금은 부르는 곳이 서버
 * 컴포넌트 하나뿐이라 의존성을 더하지 않았다. 클라이언트에서 부를 일이
 * 생기면 그때가 넣을 때다.
 */

const API = "https://www.googleapis.com/youtube/v3";

/** 하루. 검색 결과는 그보다 빨리 안 변하고, 짧게 잡을 이유가 할당량뿐이다 */
const REVALIDATE = 60 * 60 * 24;

/**
 * 한 번에 받아 볼 영상 수. 분류가 채널 쏠림을 보는 표본이기도 하다.
 *
 * **25 를 받는 이유는 거르기 때문이다.** 안무·직캠·리액션을 빼고 나면
 * 열 개 중 서너 개만 남는 검색어가 있다 → `songsFirst`. `search.list` 는
 * 개수와 상관없이 100 units 이라 넉넉히 받는 편이 공짜로 낫다.
 */
const SAMPLE = 25;

/** 화면에 세울 곡 수. 거르고 남은 것 중 앞에서부터 */
const SHOWN = 12;

/** 가수 화면에 세울 곡 수. `playlistItems` 는 50개까지 1 units 다 */
const ARTIST_TRACKS = 24;

/**
 * **응답을 그대로 믿지 않는다.** 필요한 필드만 적고 나머지는 버린다 —
 * `as` 단언으로 통과시키면 어느 날 모양이 바뀌었을 때 화면에서 `undefined`
 * 로 터진다 → `.claude/rules/data.md`
 *
 * `.catch` 나 기본값을 쓰지 않는다. 없으면 그 항목만 떨어뜨린다.
 */
const searchItem = z.object({
  id: z.object({ videoId: z.string().min(1) }),
  snippet: z.object({
    title: z.string(),
    channelId: z.string().min(1),
    channelTitle: z.string(),
  }),
});

/** `items` 만 꺼내는 봉투. `search.list` · `channels.list` · `playlistItems.list` ·
    `videos.list` 가 전부 같은 모양이라 하나로 쓴다 */
const listResponse = z.object({ items: z.array(z.unknown()).optional() });

const channelItem = z.object({
  id: z.string().min(1),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({ high: z.object({ url: z.url() }).optional() }).optional(),
  }),
  statistics: z.object({ subscriberCount: z.string().optional() }).optional(),
  contentDetails: z.object({
    relatedPlaylists: z.object({ uploads: z.string().min(1) }),
  }),
});


const playlistItem = z.object({
  snippet: z.object({
    title: z.string(),
    videoOwnerChannelTitle: z.string().optional(),
    resourceId: z.object({ videoId: z.string().min(1) }),
  }),
});

const videoItem = z.object({
  id: z.string().min(1),
  contentDetails: z.object({ duration: z.string() }),
});

/** ISO 8601 `PT4M13S` → 253 */
function toSeconds(iso: string): number {
  const parsed = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!parsed) return 0;
  return Number(parsed[1] ?? 0) * 3600 + Number(parsed[2] ?? 0) * 60 + Number(parsed[3] ?? 0);
}

/** 거르기 전의 한 줄. `songsFirst` 가 보는 모양이다 */
type Row = { videoId: string; title: string; channel: string; duration?: number };

/** 찾은 것. **던지는 대신 이걸 돌려준다** */
export type YoutubeSearch =
  | { status: "off"; reason: "no-key" }
  | { status: "quota" }
  | { status: "failed" }
  | { status: "tracks"; tracks: RemoteTrack[] }
  | { status: "artist"; artist: RemoteArtist; tracks: RemoteTrack[] };

type Fetched = { ok: true; data: unknown } | { ok: false; status: YoutubeSearch };

async function call(path: string, params: Record<string, string>): Promise<Fetched> {
  const key = process.env.YOUTUBE_API_KEY?.trim();
  if (!key) return { ok: false, status: { status: "off", reason: "no-key" } };

  const url = new URL(`${API}/${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("key", key);

  try {
    const response = await fetch(url, { next: { revalidate: REVALIDATE } });
    if (response.ok) return { ok: true, data: await response.json() };

    // 403 quotaExceeded · 429 는 "오늘은 여기까지" 다. 고장이 아니라서 화면이
    // 다르게 말해야 한다 — 다시 눌러도 소용없다는 것을 알려 줘야 한다
    if (response.status === 403 || response.status === 429) return { ok: false, status: { status: "quota" } };
    return { ok: false, status: { status: "failed" } };
  } catch {
    // 네트워크가 끊긴 경우. **키를 로그에 흘리지 않는다** — `url` 을 안 찍는다
    return { ok: false, status: { status: "failed" } };
  }
}

/** 검증을 통과한 것만 남긴다. 하나가 깨졌다고 나머지를 버리지 않는다 */
function parseEach<T>(items: unknown[], schema: z.ZodType<T>): T[] {
  return items.flatMap((item) => {
    const parsed = schema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/**
 * **길이를 받아 온다. 1 unit.** `videos.list` 는 id 50개까지 한 번에 주므로
 * 표본이 25개든 1 unit 이다 — 검색 한 번(100)에 견주면 없는 값이나 마찬가지고,
 * 얻는 것이 둘이다: 화면에 곡 길이가 뜨고, **쇼츠와 한 시간짜리 반복 영상이
 * 걸러진다**(`isSongLength`). 제목만으로는 그 둘을 못 가른다.
 *
 * 실패하면 길이 없이 간다. 길이는 있으면 좋은 값이지 없으면 못 그리는 값이
 * 아니다 → `formatDuration` 이 빈 문자열을 돌려준다
 */
async function withDurations(rows: Row[]): Promise<Row[]> {
  if (rows.length === 0) return rows;

  const detail = await call("videos", {
    part: "contentDetails",
    id: rows.map((row) => row.videoId).join(","),
  });
  if (!detail.ok) return rows;

  const envelope = listResponse.safeParse(detail.data);
  if (!envelope.success) return rows;

  const seconds = new Map(
    parseEach(envelope.data.items ?? [], videoItem).map((item) => [
      item.id,
      toSeconds(item.contentDetails.duration),
    ]),
  );
  // 0 초는 못 받은 것과 같다. 넣어 두면 `isSongLength` 가 전부 떨어뜨린다
  return rows.map((row) => ({ ...row, duration: seconds.get(row.videoId) || undefined }));
}

/**
 * `search.list` 가 준 제목은 `아티스트 - 제목 (Official Video)` 처럼 한 줄에
 * 다 들어 있다. **가수 이름이 따로 있는 곳은 채널 제목뿐이다.**
 */
function toTrack(row: Row): RemoteTrack {
  return {
    id: `yt:${row.videoId}`,
    title: row.title,
    artist: row.channel,
    youtubeId: row.videoId,
    duration: row.duration,
  };
}

/** 거르고, 음원을 앞에 세우고, 화면에 세울 만큼만 자른다 */
async function toTracks(rows: Row[]): Promise<RemoteTrack[]> {
  return songsFirst(await withDurations(rows))
    .slice(0, SHOWN)
    .map(toTrack);
}

export async function searchYoutube(query: string): Promise<YoutubeSearch> {
  const trimmed = query.trim();
  if (!trimmed) return { status: "tracks", tracks: [] };

  // ① 영상 검색 한 번. 100 units — 여기가 비싼 전부다
  const found = await call("search", {
    part: "snippet",
    q: trimmed,
    type: "video",
    videoCategoryId: "10", // Music
    videoEmbeddable: "true",
    maxResults: String(SAMPLE),
    regionCode: "KR",
  });
  if (!found.ok) return found.status;

  const envelope = listResponse.safeParse(found.data);
  if (!envelope.success) return { status: "failed" };
  const videos = parseEach(envelope.data.items ?? [], searchItem);
  if (videos.length === 0) return { status: "tracks", tracks: [] };

  const rows: Row[] = videos.map((video) => ({
    videoId: video.id.videoId,
    title: video.snippet.title,
    channel: video.snippet.channelTitle,
  }));

  // ② 결과가 한 채널로 몰리면 가수를 찾은 것이다 → `classify`
  const channelId = classify(
    trimmed,
    videos.map((video) => ({
      channelId: video.snippet.channelId,
      channelTitle: video.snippet.channelTitle,
    })),
  );

  if (!channelId) {
    return {
      status: "tracks",
      tracks: await toTracks(rows),
    };
  }

  // ③ 가수 정보 + 업로드 목록 id. 1 unit
  const channel = await call("channels", {
    part: "snippet,statistics,contentDetails",
    id: channelId,
  });
  if (!channel.ok) return channel.status;

  const channelEnvelope = listResponse.safeParse(channel.data);
  if (!channelEnvelope.success) return { status: "failed" };
  const [info] = parseEach(channelEnvelope.data.items ?? [], channelItem);
  // 채널이 사라졌으면 가수 화면을 못 세운다. 검색 결과는 이미 손에 있으므로
  // 그것을 그대로 준다 — 100 units 을 쓰고 빈 화면을 보여 줄 이유가 없다
  if (!info) {
    return {
      status: "tracks",
      tracks: await toTracks(rows),
    };
  }

  // ④ 그 가수의 곡. 1 unit — `search.list` 로 채널을 다시 뒤지면 100 units 다
  const uploads = await call("playlistItems", {
    part: "snippet",
    playlistId: info.contentDetails.relatedPlaylists.uploads,
    maxResults: String(ARTIST_TRACKS),
  });
  const uploadItems = uploads.ok ? listResponse.safeParse(uploads.data) : null;
  /* **업로드 목록도 똑같이 거른다.** 아티스트 채널에는 음원만 있는 게 아니라
     안무 영상·티저·비하인드가 같이 올라간다 — 오히려 여기가 더 섞여 있다.
     같은 규칙으로 걸러야 검색어에 따라 목록의 성격이 달라지지 않는다 */
  const tracks =
    uploadItems?.success === true
      ? await toTracks(
          parseEach(uploadItems.data.items ?? [], playlistItem).map((item) => ({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            channel: item.snippet.videoOwnerChannelTitle ?? info.snippet.title,
          })),
        )
      : // 업로드 목록만 실패하면 가수 정보는 살린다. 검색 결과가 곡을 대신한다
        await toTracks(rows);

  const subscribers = Number(info.statistics?.subscriberCount);

  return {
    status: "artist",
    artist: {
      channelId: info.id,
      name: info.snippet.title,
      // 채널 설명은 몇 문단짜리가 흔하다. 화면이 자르는 대신 여기서 자른다 —
      // 넘기지 않은 글자는 페이로드에도 안 실린다
      about: info.snippet.description.split("\n")[0]?.slice(0, 160) ?? "",
      thumbnail: info.snippet.thumbnails?.high?.url,
      subscribers: Number.isFinite(subscribers) ? subscribers : undefined,
    },
    tracks,
  };
}
