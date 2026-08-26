/**
 * 화면에 글로 나가는 값의 표기. **브라우저를 안 만진다.**
 *
 * `lib/utils.ts` 에서 떼어 냈다. 거기 있는 나머지는 전부 ref 콜백이라
 * `window` 와 `IntersectionObserver` 를 만지는데, `scripts/check-catalog.ts`
 * 가 포맷터 하나 때문에 그 파일을 통째로 들여오고 있었다. 지금은 DOM 접근이
 * 함수 본문 안에 있어서 Node 에서도 돌지만, **누가 모듈 스코프에 브라우저
 * 접근을 넣는 날 `pnpm check` 가 깨진다.** 그때 원인을 찾기 어렵다 —
 * 검사 스크립트가 왜 DOM 을 필요로 하는지가 어디에도 안 적혀 있으니까.
 */

/**
 * 초 → `3:47`. **쓸 수 없는 값이면 빈 문자열이다.**
 *
 * `duration` 은 카탈로그에 있지만 `pnpm enrich` 를 돌리기 전에는 비어 있다
 * (`types/music.ts` 에서 optional 인 이유). 없을 때 `0:00` 을 그리면 길이가
 * 0초인 곡처럼 보이므로, 부르는 쪽이 빈 문자열을 받아 자리를 안 만들게 한다.
 *
 * 음수와 무한대도 같이 막는다. 지금 두 호출부는 커밋된 카탈로그 값만
 * 넘기지만, 남은 시간(`getDuration() - getCurrentTime()`)을 넣고 싶어지는
 * 날이 온다 — YouTube API 는 그 뺄셈에서 음수를 흘린다. `-1:-5` 를 그리느니
 * 아무것도 안 그리는 게 낫다.
 *
 * 시간 단위는 안 만든다. 카탈로그는 곡이고, 한 시간짜리가 섞여 있으면
 * `check-catalog` 가 먼저 잡아야 할 일이다 — `72:30` 이 그려지는 게
 * 그 사실을 숨기는 것보다 낫다.
 */
export function formatDuration(seconds: number | undefined): string {
  if (!seconds || seconds < 0 || !Number.isFinite(seconds)) return "";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}
