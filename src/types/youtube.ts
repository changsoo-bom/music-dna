/**
 * IFrame Player API 중 **이 프로젝트가 실제로 쓰는 것만** 적는다.
 *
 * `@types/youtube` 를 받지 않는 이유는 전역 `YT` 네임스페이스를 통째로
 * 선언해서 안 쓰는 API 까지 자동완성에 올라오기 때문이다. 여기 적힌 만큼만
 * 쓰기로 하면, 늘려야 할 때 이 파일이 바뀌면서 무엇이 늘었는지 남는다.
 *
 * 문서: https://developers.google.com/youtube/iframe_api_reference
 */

export type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  /**
   * 초 단위로 이동한다.
   *
   * `allowSeekAhead` 는 **아직 안 받은 구간까지 새로 요청할지**다. 끄는
   * 동안에는 `false` 로 부른다 — 매 프레임 새 요청을 보내면 손을 떼기도 전에
   * 요청이 쌓인다. 손을 뗄 때 한 번만 `true` 로 부른다.
   */
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  /** 0~100. 모바일 사파리는 무시한다 — 거기서는 기기 볼륨만 먹는다 */
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
};

/** `onStateChange` 의 `data`. 쓰는 값만 이름을 붙인다 */
export const PLAYER_STATE = { ended: 0, playing: 1, paused: 2 } as const;

type PlayerEvent = { target: YouTubePlayer; data: number };

export type YouTubeApi = {
  Player: new (
    host: HTMLElement,
    options: {
      videoId?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
        onError?: (event: PlayerEvent) => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
