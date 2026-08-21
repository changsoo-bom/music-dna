import { readFileSync, writeFileSync } from "node:fs";

// 검수에서 걸러낸 곡. id 를 넣지 않으면 다음 enrich 에서 다시 검색된다.
const REJECT = new Set(process.argv.slice(2));

const found = JSON.parse(readFileSync("scripts/enrich-out.json", "utf8"));

/**
 * **확인된 것만 넣는다.** `embeddable !== false` 였는데, 그러면 `undefined` 가
 * 통과한다 — `videos.list` 는 삭제·비공개·지역차단된 id 를 에러가 아니라
 * **누락**으로 돌려주므로 확인 안 된 곡이 정확히 그 모양이 된다.
 * 그대로 통과시키면 아래 템플릿이 `duration: undefined` 를 문자열로 소스에 박고,
 * `duration?: number` 라서 **typecheck 는 초록으로 지나간다.**
 */
const verified = found.filter(
  (f) => !REJECT.has(f.id) && f.embeddable === true && typeof f.duration === "number",
);
const skipped = found.filter((f) => !REJECT.has(f.id) && !verified.includes(f));
const byId = new Map(verified.map((f) => [f.id, f]));

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
if (skipped.length > 0) {
  // 조용히 빠지면 "왜 이 곡만 안 들어갔지" 가 된다. 이름을 부른다.
  console.warn(`확인 안 돼서 건너뛴 ${skipped.length}곡: ${skipped.map((f) => f.id).join(", ")}`);
}
