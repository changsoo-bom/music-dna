import { readFileSync, writeFileSync } from "node:fs";

import { CATALOG } from "@/data/catalog";

/**
 * 카탈로그에 `youtubeId` · `duration` 을 채운다. `pnpm enrich`
 *
 * 두 단계다.
 *
 * 1. `search.list` — 곡당 1회, **100 units**. 하루 한도 10,000 이라
 *    40곡이면 4,000 units(40%) 다. 여기가 비싼 쪽이고, 그래서
 *    **이미 id 가 있는 곡은 건너뛴다.** 다시 돌려도 새 곡만 검색한다.
 * 2. `videos.list` — id 50개당 1회, **1 unit**. 임베드 가능 여부와 길이를
 *    한 번에 받는다. `status.embeddable` 이 false 면 플레이어에서 재생되지
 *    않으므로 카탈로그에 넣지 않는다.
 *
 * 검색은 라이브 버전이나 커버를 집을 수 있다. **결과를 그대로 믿지 않는다** —
 * 돌려받은 제목·채널을 표로 찍어 사람이 눈으로 확인하게 한다.
 */

function loadKey(): string {
  const raw = readFileSync(".env.local", "utf8");
  const line = raw.split("\n").find((l) => l.startsWith("YOUTUBE_API_KEY="));
  const key = line?.slice("YOUTUBE_API_KEY=".length).trim();
  if (!key) throw new Error(".env.local 에 YOUTUBE_API_KEY 가 없다");
  return key;
}

const KEY = loadKey();
let searchCalls = 0;
let videoCalls = 0;

async function api(path: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("key", KEY);

  const res = await fetch(url);
  if (!res.ok) {
    // 키를 로그에 흘리지 않는다. 상태와 본문만 본다
    throw new Error(`${path} ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  return res.json();
}

type Found = {
  id: string;
  title: string;
  artist: string;
  youtubeId: string;
  foundTitle: string;
  channel: string;
  duration?: number;
  embeddable?: boolean;
};

/** ISO 8601 PT4M13S → 253 */
function toSeconds(iso: string): number {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}

async function main() {
const targets = CATALOG.filter((t) => !t.youtubeId);
const onlyOne = process.argv.includes("--one");
const queue = onlyOne ? targets.slice(0, 1) : targets;

console.log(`검색 대상 ${queue.length}곡 (예상 ${queue.length * 100} units)\n`);

const found: Found[] = [];

for (const track of queue) {
  const data = await api("search", {
    part: "snippet",
    q: `${track.artist} ${track.title}`,
    type: "video",
    videoCategoryId: "10", // Music
    videoEmbeddable: "true",
    maxResults: "1",
    regionCode: "KR",
  });
  searchCalls += 1;

  const item = data.items?.[0];
  if (!item) {
    console.log(`  ✗ ${track.artist} — ${track.title}  (검색 결과 없음)`);
    continue;
  }
  found.push({
    id: track.id,
    title: track.title,
    artist: track.artist,
    youtubeId: item.id.videoId,
    foundTitle: item.snippet.title,
    channel: item.snippet.channelTitle,
  });
}

// videos.list 는 id 50개까지 한 번에 받는다. 40곡이면 1 unit 이다
for (let i = 0; i < found.length; i += 50) {
  const batch = found.slice(i, i + 50);
  const data = await api("videos", {
    part: "contentDetails,status",
    id: batch.map((f) => f.youtubeId).join(","),
  });
  videoCalls += 1;

  for (const item of data.items ?? []) {
    const target = batch.find((f) => f.youtubeId === item.id);
    if (!target) continue;
    target.duration = toSeconds(item.contentDetails.duration);
    target.embeddable = item.status.embeddable;
  }
}

console.log(`\n${"id".padEnd(6)}${"카탈로그".padEnd(38)}유튜브가 준 제목 / 채널`);
console.log("─".repeat(110));
for (const f of found) {
  const flag = f.embeddable === false ? " ✗임베드불가" : f.duration ? ` ${f.duration}s` : " ?";
  console.log(`${f.id.padEnd(6)}${`${f.artist} — ${f.title}`.slice(0, 36).padEnd(38)}${f.foundTitle.slice(0, 46)}`);
  console.log(`${" ".repeat(44)}${f.channel}${flag}`);
}

writeFileSync("scripts/enrich-out.json", `${JSON.stringify(found, null, 2)}\n`);
console.log(
  `\n검색 ${searchCalls}회(${searchCalls * 100} units) · 조회 ${videoCalls}회(${videoCalls} units)` +
    ` = ${searchCalls * 100 + videoCalls} units\n결과: scripts/enrich-out.json`,
);
}

main();
