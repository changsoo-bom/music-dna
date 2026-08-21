"use client";

import { ArrowUpRight, Pause, Play, SkipBack, SkipForward, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { recordPlayed } from "@/lib/played-tracks";
import { loadIframeApi } from "@/lib/youtube/iframe-api";
import { currentTrack, usePlayerStore } from "@/lib/use-player-store";
import { PLAYER_STATE } from "@/types/youtube";
import type { YouTubePlayer } from "@/types/youtube";

/** 진행 호의 둘레. `globals.css` 의 `.orbit` 과 같은 r=76 을 쓴다 */
const CIRCUMFERENCE = 477.5;

/** 진행률을 다시 읽는 주기. 호가 60fps 로 돌 필요는 없다 */
const TICK_MS = 500;

const ICON_BUTTON =
  "grid place-items-center rounded-full text-ink transition-opacity hover:opacity-55 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none";

/**
 * 화면 아래 재생 바.
 *
 * **여기서만 궤도 호가 값을 뜻한다.** 추천 카드에서 호로 근접도를 그렸다가
 * 재생 진행률로 읽혀서 되돌렸는데(`docs/design-reference.md`), 그건 호가
 * 나쁜 표현이어서가 아니라 **진행률처럼 생겼기 때문**이었다. 실제로 진행률인
 * 자리에서는 같은 그림이 정확한 표현이 된다. 커버를 감고 도는 주황 호가
 * 이 곡의 어디쯤인지다.
 *
 * 호는 state 가 아니라 ref 로 그린다 — 0.5초마다 리렌더하면 바 전체가
 * 다시 그려진다. `CountUp` 이 숫자를 직접 쓰는 것과 같은 이유다.
 *
 * 소리는 화면 밖 iframe 이 낸다. 영상을 보여주지 않는 건 이 서비스가
 * 음악 이야기를 하기 때문이고, 유튜브로 나가는 문(↗)은 항상 열어 둔다 —
 * 임베드가 막힌 곡이 있고, 그때 갈 곳이 있어야 한다.
 */
export function PlayerBar() {
  const track = usePlayerStore(currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const skip = usePlayerStore((s) => s.skip);
  const close = usePlayerStore((s) => s.close);

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  /** 플레이어에 실제로 걸려 있는 영상 id. 같은 곡을 두 번 걸지 않기 위한 것 */
  const loadedRef = useRef<string | null>(null);
  /** 갈아 끼우는 중. 나가는 영상이 흘리는 정지·종료 신호를 무시한다 */
  const switchingRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  /**
   * 재시도 횟수. **아래 효과를 다시 돌리기 위한 것뿐이다.**
   *
   * `loadIframeApi` 는 실패하면 캐시를 비워서 다음 호출이 다시 시도하게 해 두는데,
   * 효과의 의존성이 `videoId` 뿐이면 그 다음 호출이 영영 안 온다 — 같은 곡을
   * 다시 눌러도 `videoId` 가 그대로라 효과가 안 돈다. 스크립트가 한 번 못 뜨면
   * **다른 곡을 고르는 것 말고는 복구할 방법이 없었다.**
   */
  const [attempt, setAttempt] = useState(0);

  const videoId = track?.youtubeId ?? null;

  /** 재생 버튼. 실패한 상태에서는 토글이 아니라 재시도다 */
  function pressPlay() {
    if (failed) {
      setFailed(false);
      setAttempt((n) => n + 1);
      return;
    }
    toggle();
  }

  // 플레이어를 만든다. 첫 곡을 고른 뒤에야 스크립트를 받는다.
  useEffect(() => {
    if (!videoId || playerRef.current) return;
    let cancelled = false;

    loadIframeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current || playerRef.current) return;
        loadedRef.current = videoId;
        playerRef.current = new YT.Player(hostRef.current, {
          videoId,
          playerVars: { autoplay: 1, playsinline: 1, controls: 0 },
          events: {
            // 플레이어가 뜨는 데 1~2초 걸린다. 그 사이에 멈춘 사람이 있으면
            // 여기서 그냥 틀지 않는다 — 껐는데 저절로 켜지는 것으로 보인다.
            onReady: (event) => {
              setReady(true);
              setFailed(false);
              if (usePlayerStore.getState().isPlaying) event.target.playVideo();
            },
            // 상태는 플레이어가 알려 준 것만 적는다. 우리가 playVideo() 를
            // 불렀다고 소리가 난다는 보장이 없다 — 광고·버퍼링·자동재생 차단.
            onStateChange: (event) => {
              const store = usePlayerStore.getState();

              if (event.data === PLAYER_STATE.playing) {
                switchingRef.current = false;
                store.reportPlaying(true);
                // 실제로 소리가 난 곡만 이력에 남는다. playVideo() 를 부른 시점이 아니다 —
                // 임베드가 막힌 곡을 "들었다" 고 기록하면 목록이 거짓말이 된다.
                const sounding = currentTrack(store);
                if (sounding) recordPlayed(sounding.id);
                return;
              }

              // **곡을 갈아 끼우는 동안 오는 신호는 나가는 영상의 것이다.**
              // loadVideoById 는 틀고 있던 영상을 먼저 세우면서 정지(2)를,
              // 때로는 종료(0)를 흘린다. 그걸 받아 적으면 isPlaying 이 false 로
              // 뒤집히고, 그러면 아래 효과가 방금 시작한 새 곡을 멈춘다 —
              // "재생 중에 다른 곡을 누르면 음악이 꺼진다" 가 정확히 이것이었다.
              // 종료 신호를 믿으면 한 곡을 통째로 건너뛰기까지 한다.
              if (switchingRef.current) return;

              if (event.data === PLAYER_STATE.ended) store.skip(1);
              else if (event.data === PLAYER_STATE.paused) store.reportPlaying(false);
            },
            // 101·150 은 "다른 사이트에서 재생 금지" 다. 공식 뮤직비디오에 흔하다.
            onError: () => {
              // 갈아 끼우기가 끝났다 — 실패로. 안 풀면 이후 정지·종료가 전부 무시된다.
              switchingRef.current = false;
              const store = usePlayerStore.getState();
              const playing = currentTrack(store);
              if (playing) store.reportBlocked(playing.id);
            },
          },
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
    };
  }, [videoId, attempt]);

  // 곡이 바뀌면 갈아 끼운다. 플레이어를 다시 만들지 않는다 —
  // 만들 때마다 iframe 이 새로 뜨면서 소리가 끊긴다.
  //
  // 이미 걸려 있는 곡은 다시 안 건다. `ready` 가 켜지는 순간 이 효과가 도는데,
  // 그때 걸려 있는 건 플레이어를 만들 때 넣은 바로 그 곡이라 다시 부르면
  // 시작한 지 1초 만에 처음으로 되감긴다.
  useEffect(() => {
    if (!ready || !videoId || loadedRef.current === videoId) return;
    loadedRef.current = videoId;
    switchingRef.current = true;
    playerRef.current?.loadVideoById(videoId);
  }, [ready, videoId]);

  useEffect(() => {
    if (!ready) return;
    if (isPlaying) playerRef.current?.playVideo();
    else playerRef.current?.pauseVideo();
  }, [ready, isPlaying]);

  // 진행 호. setState 가 없으므로 이 주기는 리렌더를 만들지 않는다.
  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      const player = playerRef.current;
      const arc = arcRef.current;
      if (!player || !arc) return;
      const duration = player.getDuration();
      const played = duration > 0 ? player.getCurrentTime() / duration : 0;
      arc.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - played));
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [ready]);

  return (
    <>
      {/* 소리를 내는 iframe. 화면에는 안 보이지만 **크기가 0 이면 안 된다** —
          0×0 이나 display:none 인 플레이어는 브라우저가 재생을 막는다.
          바 뒤에 깔아서 가린다. */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 -z-10 h-[135px] w-[240px] opacity-0"
      >
        <div ref={hostRef} />
      </div>

      {track && (
        <>
          <div className="fixed bottom-6 left-1/2 z-50 flex h-[76px] w-[min(680px,calc(100%-32px))] -translate-x-1/2 items-center gap-4 rounded-pill bg-white pr-5 pl-3 shadow-float max-sm:bottom-4 max-sm:h-[68px] max-sm:gap-3 max-sm:pr-3">
            {/* 커버 + 진행 호 */}
            <div className="relative h-13 w-13 shrink-0 max-sm:h-11 max-sm:w-11">
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                <circle cx="80" cy="80" r="76" fill="none" strokeWidth="6" className="stroke-ghost" />
                <circle
                  ref={arcRef}
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="stroke-signal-lt transition-[stroke-dashoffset] duration-500 ease-linear"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE}
                />
              </svg>
              <div className="absolute inset-[14%] overflow-hidden rounded-full bg-ghost">
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
                  alt=""
                  fill
                  sizes="52px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* 곡이 저절로 넘어갈 때 화면을 안 보는 사람에게도 알린다 */}
            <div role="status" aria-live="polite" className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium tracking-[-0.01em]">{track.title}</p>
              <p className="truncate text-[13px] text-slate">
                {failed ? "재생을 시작하지 못했습니다 — 다시 누르면 재시도합니다" : track.artist}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => skip(-1)}
                aria-label="이전 곡"
                className={`${ICON_BUTTON} h-10 w-10 max-sm:hidden`}
              >
                <SkipBack size={18} weight="fill" aria-hidden />
              </button>

              <button
                type="button"
                onClick={pressPlay}
                aria-label={failed ? "다시 시도" : isPlaying ? "일시정지" : "재생"}
                className={`${ICON_BUTTON} h-11 w-11 bg-ink text-canvas hover:opacity-90`}
              >
                {isPlaying ? (
                  <Pause size={18} weight="fill" aria-hidden />
                ) : (
                  // 재생 삼각형은 광학 중심이 기하 중심보다 오른쪽이다
                  <Play size={18} weight="fill" aria-hidden className="translate-x-px" />
                )}
              </button>

              <button
                type="button"
                onClick={() => skip(1)}
                aria-label="다음 곡"
                className={`${ICON_BUTTON} h-10 w-10`}
              >
                <SkipForward size={18} weight="fill" aria-hidden />
              </button>
            </div>

            <a
              href={`https://www.youtube.com/watch?v=${track.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube 에서 열기"
              className={`${ICON_BUTTON} h-10 w-10 shrink-0 text-slate max-sm:hidden`}
            >
              <ArrowUpRight size={18} aria-hidden />
            </a>

            <button
              type="button"
              onClick={close}
              aria-label="재생 닫기"
              className={`${ICON_BUTTON} h-10 w-10 shrink-0 text-slate`}
            >
              <X size={17} aria-hidden />
            </button>
          </div>
        </>
      )}
    </>
  );
}
