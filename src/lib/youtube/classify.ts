/**
 * 검색어가 **가수 이름이었나 곡 제목이었나.**
 *
 * YouTube 에 "이건 가수야?" 라고 물어보는 호출이 따로 있고(`search.list?type=channel`),
 * 그건 **100 units** 다. 곡을 찾는 검색까지 하면 한 번에 200 units — 하루
 * 100번이 50번으로 줄어든다. 그래서 안 묻는다.
 *
 * 대신 **이미 받은 영상 결과의 모양을 본다.** 사람이 가수 이름을 치면 상위
 * 결과가 그 가수 채널로 몰린다. 곡 제목을 치면 커버·리액션·라이브가 섞여
 * 채널이 흩어진다. 그 쏠림이 곧 답이다 — 추가 비용 0.
 */

/** 이름을 비교 가능한 모양으로. 대소문자·공백·구두점을 지운다 → `lib/search.ts` */
export function foldName(value: string) {
  return value.toLowerCase().replaceAll(/[\s'"·,.\-_()[\]]/g, "");
}

/** 몰렸다고 볼 최소 비율. 표본 10개면 4개 이상이 한 채널일 때다 */
const SHARE = 0.4;

/**
 * 가수 채널의 id. 가수 질의가 아니면 `null`.
 *
 * **두 조건을 같이 본다.**
 *
 * 1. 한 채널이 결과의 40% 이상을 먹었다 — 흩어졌으면 곡 제목이다.
 * 2. 그 채널 이름이 검색어와 맞는다 — 한쪽만 보면 안 된다. `아이유` 를 쳤을 때
 *    한 리액션 채널이 열 개 중 다섯을 먹을 수 있는데, 그건 그 채널이 부지런한
 *    것이지 아이유가 아니다. 이름을 같이 보면 걸러진다.
 *
 * 이름은 **양쪽 방향으로** 본다. `NewJeans` 를 치면 채널이 `NewJeans`(같음)일
 * 수도 `HYBE LABELS`(다름) 일 수도 있고, `뉴진스` 를 치면 채널명이
 * `뉴진스 NewJeans` 라 검색어를 포함한다. 반대로 `아이유` 를 쳤는데 채널이
 * `이지금 IU Official` 이면 채널명이 검색어를 포함하지 않지만 검색어가
 * 채널명에 들어 있지도 않다 — 그런 것은 놓친다. **놓치는 쪽이 안전하다:**
 * 틀리면 엉뚱한 사람의 채널을 가수라고 세운다.
 */
export function classify(
  query: string,
  results: readonly { channelId: string; channelTitle: string }[],
): string | null {
  if (results.length === 0) return null;

  const counts = new Map<string, { count: number; title: string }>();
  for (const result of results) {
    const seen = counts.get(result.channelId);
    counts.set(result.channelId, {
      count: (seen?.count ?? 0) + 1,
      title: seen?.title ?? result.channelTitle,
    });
  }

  const [channelId, top] = [...counts.entries()].reduce((a, b) => (b[1].count > a[1].count ? b : a));
  if (top.count / results.length < SHARE) return null;

  const folded = foldName(query);
  const title = foldName(top.title);
  if (!folded) return null;

  return title.includes(folded) || folded.includes(title) ? channelId : null;
}
