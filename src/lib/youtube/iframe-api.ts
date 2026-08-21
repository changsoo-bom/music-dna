import type { YouTubeApi } from "@/types/youtube";

let pending: Promise<YouTubeApi> | null = null;

/**
 * IFrame Player API 스크립트를 한 번만 받는다.
 *
 * **`onYouTubeIframeAPIReady` 는 전역 콜백이 하나뿐이다.** 두 번 붙이면
 * 나중 것이 앞의 것을 덮어써서 먼저 기다리던 쪽이 영원히 기다린다.
 * 약속을 모듈에 캐시해서 두 번째 호출부터는 같은 것을 돌려준다.
 *
 * 재생 버튼을 누르기 전에는 받지 않는다 — 안 누르는 사람에게 외부 스크립트
 * 한 개를 지우는 값이 크다. `lib/` 안에 두는 것은 외부 API 접근이
 * 여기를 지나야 한다는 규칙 그대로다. → `.claude/rules/structure.md`
 */
export function loadIframeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;

  let script: HTMLScriptElement;

  pending = new Promise<YouTubeApi>((resolve, reject) => {
    window.onYouTubeIframeAPIReady = () => {
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("YT.Player 가 없다"));
    };

    script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    // 스크립트가 막히면(차단기·오프라인) 콜백이 영영 안 온다.
    // 거부해 두면 부르는 쪽이 조용히 멈추는 대신 실패를 안다.
    script.onerror = () => reject(new Error("iframe_api 를 받지 못했다"));
    document.head.append(script);
  }).catch((error: unknown) => {
    // **실패한 약속을 캐시에 남기지 않는다.** 남기면 잠깐의 네트워크 끊김
    // 한 번으로 그 세션 내내 재생 버튼이 죽는다 — 눌러도 아무 일이 안 나고,
    // 새로고침 전에는 회복할 방법이 없다. 지우면 다음 클릭이 다시 시도한다.
    pending = null;
    script?.remove();
    throw error;
  });

  return pending;
}
