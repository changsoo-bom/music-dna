import { readFileSync, writeFileSync } from "node:fs";

// 검수에서 걸러낸 곡. id 를 넣지 않으면 다음 enrich 에서 다시 검색된다.
const REJECT = new Set(process.argv.slice(2));

const found = JSON.parse(readFileSync("scripts/enrich-out.json", "utf8"));
const byId = new Map(found.filter((f) => !REJECT.has(f.id) && f.embeddable !== false).map((f) => [f.id, f]));

let applied = 0;
const out = readFileSync("src/data/catalog.ts", "utf8")
  .split("\n")
  .map((line) => {
    const m = /^(\s*\{ id: "(t\d+)",.*?)( \},)$/.exec(line);
    if (!m) return line;
    const hit = byId.get(m[2]);
    if (!hit || line.includes("youtubeId")) return line;
    applied += 1;
    return `${m[1]}, youtubeId: "${hit.youtubeId}", duration: ${hit.duration}${m[3]}`;
  })
  .join("\n");

writeFileSync("src/data/catalog.ts", out);
console.log(`${applied}곡에 youtubeId·duration 을 넣었다. 제외: ${[...REJECT].join(", ") || "없음"}`);
