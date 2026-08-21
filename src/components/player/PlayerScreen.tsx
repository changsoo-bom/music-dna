"use client";

import { CaretDown, Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";

import { VolumeControl } from "@/components/player/VolumeControl";
import { SUB_GENRES } from "@/constants/genres";
import { ORBIT_CIRCUMFERENCE } from "@/constants/orbit";
import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { usePreference } from "@/hooks/use-preference";
import { formatDuration } from "@/lib/format";
import { moodAffinity } from "@/lib/quiz/scoring";
import { trackMood } from "@/lib/report/recommend";
import { currentTrack, isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

/** 분위기 3축. 카탈로그가 곡마다 들고 있는 값 그대로다 */
const AXES = [
  { key: "energy", label: "에너지" },
  { key: "valence", label: "밝기" },
  { key: "dreamy", label: "몽환" },
] as const;

const ICON_BUTTON =
  "grid place-items-center rounded-full text-ink transition-opacity hover:opacity-55 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none";

function fillStyle(fill: number, index: number): CSSProperties {
  return { "--fill": fill, animationDelay: `${index * 0.09}s` } as CSSProperties;
}

/**
 * 전체 화면 재생. 바를 누르면 열린다.
 *
 * **`<dialog>` 를 쓴다. 단, 모달로는 안 연다.** 요소 신원(`role="dialog"`),
 * `close` 이벤트, `[open]` 상태가 공짜로 따라온다. 최상위 레이어와 포커스
 * 가둠은 일부러 안 쓴다 — 아래 `show()` 주석에 이유가 있다.
 *
 * **재생 바는 이 화면 위에 남는다.** 시트가 바 높이만큼 위에서 끝나서
 * (`--player-bar-h`), 화면을 연 채로도 곡을 넘기고 소리를 줄일 수 있다.
 *
 * **소리는 여기서 안 만든다.** iframe 은 계속 `PlayerBar` 안에 있고 이 화면은
 * 그 위에 겹칠 뿐이다. 재생기를 이쪽으로 옮기면 iframe 이 다시 만들어지면서
 * 열 때마다 곡이 처음으로 돌아간다.
 *
 * 영상은 여전히 안 보여준다. 대신 이 곡이 **어떤 곡인지**를 편다 — 커버,
 * 진행 호, 그리고 카탈로그가 들고 있는 분위기 3축. 검사를 마친 사람에게는
 * 그 좌표가 자기 좌표와 얼마나 가까운지까지 나온다. 지표는 새로 계산하는
 * 값이 아니라 추천이 이미 쓰는 값이다(`trackMood` · `moodAffinity`).
 */
export function PlayerScreen({
  open,
  onClose,
  arcRef,
}: {
  open: boolean;
  onClose: () => void;
  /** 진행 호. 값은 `PlayerBar` 의 주기가 써 넣는다 — 여기서 리렌더를 만들지 않는다 */
  arcRef: RefObject<SVGCircleElement | null>;
}) {
  const track = usePlayerStore(currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);
  const skip = usePlayerStore((s) => s.skip);
  const preference = usePreference();

  const dialogRef = useRef<HTMLDialogElement>(null);

  /**
   * 열고 닫는 것은 명령형이다 — `<dialog>` 는 `open` 속성만 붙여서는
   * 안 열린다.
   *
   * **`showModal()` 이 아니라 `show()` 다.** 모달은 최상위 레이어에 올라가서
   * `z-index` 로는 아무것도 그 위에 못 놓고, 문서의 나머지를 통째로 `inert`
   * 로 만든다. 그러면 **재생 바가 시트 뒤에 깔려서 안 보이고 안 눌린다** —
   * 시트를 연 채로 곡을 넘기거나 소리를 줄일 수가 없다. 그건 이 화면이
   * 원래 모달이 아니라는 뜻이다: 뒤에 살아 있어야 하는 조작이 있다.
   *
   * 대신 모달이 공짜로 주던 것들을 여기서 챙긴다 — Escape 는 아래에서
   * 직접 받고, 시트가 바 위로 안 올라오게 `bottom` 을 CSS 에서 띄우고,
   * 뒤 본문 스크롤은 `body:has(dialog[open])` 이 세운다.
   * 포커스는 가두지 않는다: 바로 탭이 갈 수 있어야 맞다.
   *
   * 덤으로, 개발 도구가 `body` 에 심는 요소 주석 오버레이도 살아 있다.
   * 최상위 레이어에 뜨면 그것까지 같이 죽는다.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.show();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape. `close()` 를 부르면 `onClose` 가 `close` 이벤트로 돌아온다 —
  // 닫는 길이 하나라 모달이든 아니든 같은 자리를 지난다.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dialogRef.current?.close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!track) return null;

  const mood = trackMood(track);
  const match = preference
    ? moodAffinity(
        {
          energy: preference.axes.energy,
          valence: preference.axes.valence,
          dreamy: preference.axes.dreamy,
        },
        mood,
      )
    : null;
  const length = formatDuration(track.duration);

  return (
    <dialog
      ref={dialogRef}
      // 닫히는 길은 `close` 하나로 모인다. 우리 상태를 거기 맞춘다
      onClose={onClose}
      aria-label={`${track.title} 재생 화면`}
      className="player-screen"
    >
      <div className="shell flex min-h-full flex-col justify-center py-20 max-sm:py-14">
        {/* 닫기가 DOM 의 처음이다 — 열 때 초점이 첫 번째 포커스 가능한
            요소로 옮겨 가므로, 열자마자 Enter 로 닫을 수 있다 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="재생 화면 닫기"
          className={`${ICON_BUTTON} absolute top-8 right-8 h-11 w-11 text-slate hover:text-ink max-sm:top-5 max-sm:right-5`}
        >
          {/* 화살촉이다. 대(stem)가 달린 화살표는 "내려받기" 로 읽힌다.
              시트가 아래로 내려가면서 닫히므로 방향이 동작과 같다 */}
          <CaretDown size={24} weight="bold" aria-hidden />
        </button>

        {/* 두 칸이 다른 것을 말한다: 왼쪽은 **이 곡이 무엇인가**(커버·지표),
            오른쪽은 **지금 무엇을 듣고 있고 곁에 무엇이 있는가**(제목·조작·목록).
            `items-start` 다 — 양쪽 높이가 곡마다 달라서 가운데로 맞추면
            제목이 위아래로 떠다닌다. */}
        <div className="grid grid-cols-[minmax(0,340px)_1fr] items-start gap-16 max-lg:grid-cols-1 max-lg:justify-items-center max-lg:gap-12 max-lg:text-center">
          <div className="flex w-full flex-col max-lg:max-w-[min(340px,68vw)] max-lg:items-center">
            {/* 커버 + 진행 호. 바에는 호가 없다 — 여기서만 값을 뜻한다 */}
            <div className="relative aspect-square w-full">
              <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  strokeWidth="3"
                  className="stroke-ghost"
                />
                <circle
                  ref={arcRef}
                  cx="80"
                  cy="80"
                  r="76"
                  fill="none"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="stroke-signal-lt transition-[stroke-dashoffset] duration-500 ease-linear"
                  strokeDasharray={ORBIT_CIRCUMFERENCE}
                  strokeDashoffset={ORBIT_CIRCUMFERENCE}
                />
              </svg>
              <div className="absolute inset-[7%] overflow-hidden rounded-full bg-ghost">
                {/* **`hq720` 을 쓴다.** `hqdefault` 는 480×360 인데 원본이 16:9 라
                    위아래에 검은 띠를 넣어 4:3 으로 맞춘 그림이다 — 원으로
                    자르면 그 띠가 그대로 들어온다. 게다가 480px 로는 이 크기를
                    못 채운다. `hq720` 은 1280×720 짜리 16:9 원본이다.

                    `sizes` 는 상자 폭이 아니라 그려지는 폭이다: 정사각형 상자에
                    16:9 를 `object-cover` 하면 폭이 1.78배로 깔린다.
                    340 × 16/9 ≒ 605 → 2배 화면에서 1210, 원본 1280 안이다. */}
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/hq720.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 121vw, 620px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* 지표는 커버 밑이다. 이 곡의 좌표라 커버와 같은 것을 설명한다 —
                제목 옆에 두면 곡 정보가 아니라 화면의 주제처럼 읽힌다.

                곡이 바뀌면 다시 채워진다: `key` 로 갈아 끼워야 애니메이션이 다시
                돈다. 같은 요소에 값만 바꾸면 막대가 소리 없이 순간이동한다. */}
            <ul key={track.id} className="mt-10 flex w-full flex-col gap-4">
              {AXES.map((axis, index) => (
                <li key={axis.key} className="flex items-center gap-4">
                  <span className="w-14 shrink-0 text-left text-[15px] font-medium">
                    {axis.label}
                  </span>
                  {/* 값을 그리는 자리라 --signal 계열을 쓴다. --chart-* 는 차트 전용이고
                      마케팅 CTA 에는 이 색을 안 쓴다 → `.claude/rules/styling.md` */}
                  <span className="h-2.5 flex-1 overflow-hidden rounded-pill bg-ghost">
                    <span
                      className="bar-fill block h-full rounded-pill bg-signal-lt"
                      style={fillStyle(mood[axis.key] / 100, index)}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right text-sm tabular-nums text-slate">
                    {mood[axis.key]}
                  </span>
                </li>
              ))}
            </ul>

            {/* 막대 아래다 — 위 세 줄을 다 읽고 나서 나오는 한 문장이 결론이다.
                검사를 안 한 사람에게는 안 나온다: 기준이 없는데 숫자를 적을 수 없다 */}
            {match !== null && (
              <p className="mt-6 text-[15px] text-slate">
                내 취향과 <span className="font-medium text-ink tabular-nums">{match}%</span> 맞음
              </p>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-col">
            <p className="eyebrow max-lg:justify-center">{SUB_GENRES[track.subGenre].ko}</p>
            <h1 className="mt-5 text-[44px] leading-[1.1] max-sm:text-[32px]">{track.title}</h1>
            <p className="mt-3 text-lg text-slate">
              {track.artist}
              {length && <span className="tabular-nums"> · {length}</span>}
            </p>

            <div className="mt-10 flex items-center gap-3 max-lg:justify-center">
              <button
                type="button"
                onClick={() => skip(-1)}
                aria-label="이전 곡"
                className={`${ICON_BUTTON} h-12 w-12`}
              >
                <SkipBack size={22} weight="fill" aria-hidden />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? "일시정지" : "재생"}
                className={`${ICON_BUTTON} h-16 w-16`}
              >
                {isPlaying ? (
                  <Pause size={30} weight="fill" aria-hidden />
                ) : (
                  // Phosphor 의 `Play`(fill)는 잉크가 박스 안에서 오른쪽에 그려져
                  // 있다. 줄 안에서는 보이는 잉크가 균등해야 한다 → `PlayerBar`
                  <Play size={30} weight="fill" aria-hidden className="-translate-x-[3px]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => skip(1)}
                aria-label="다음 곡"
                className={`${ICON_BUTTON} h-12 w-12`}
              >
                <SkipForward size={22} weight="fill" aria-hidden />
              </button>

              {/* 바에 있는 것과 **같은 조작이다** — 값이 스토어에 있어서
                  한쪽에서 줄이면 다른 쪽 손잡이도 따라 움직인다.
                  모바일에서만 감춘다(바는 `md` 부터 감춘다 — 거긴 가로 자리가
                  없어서고, 여기는 자리가 있다). 감추는 이유 자체는 같다:
                  모바일 브라우저는 `setVolume` 을 무시하고 기기 볼륨만 먹는다. */}
              <VolumeControl className="ml-2 max-sm:hidden" />
            </div>

            <PlayedQueue />
          </div>
        </div>
      </div>
    </dialog>
  );
}

/**
 * 빠른 선곡. **홈의 목록과 같은 값을 같은 큐 이름으로 튼다**(`"played"`).
 *
 * 여기서 튼 곡을 홈에서 눌러도 일시정지가 되고 그 반대도 된다 — 목록 신원이
 * 같아야 토글 판정이 한 벌로 돈다. → `src/lib/use-player-store.ts`
 *
 * 카드가 아니라 줄이다. 홈에서는 이 목록이 화면의 주인공이라 3열 카드로
 * 펴지만, 여기서는 지금 나는 곡 옆에 붙는 곁가지라 세로로 눕는 편이 읽힌다.
 */
function PlayedQueue() {
  const played = usePlayedTracks();
  const queue = played.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 줄마다 구독하면 아홉 줄이 아홉 번 깨어난다. 한 번 받아서 줄마다 비교한다
  const sounding = usePlayerStore((state) => soundingId(state, "played"));

  // 이 화면은 곡이 있을 때만 열리므로 보통 비지 않는다. 그래도 비면 제목만
  // 남기지 않고 통째로 접는다 — 아무것도 없는 제목은 고장으로 보인다
  if (queue.length === 0) return null;

  return (
    <section className="mt-14 w-full max-lg:text-left">
      <h2 className="text-[13px] font-bold text-slate">재생목록</h2>

      {/* **여기서만 스크롤한다**(`.scroll-panel`) — 목록이 아홉 줄까지 늘어도
          커버와 조작은 제자리에 남는다.

          높이를 **커버와 같은 340px** 로 잡는다. 옆 칸에 이미 그 크기의
          정사각형이 서 있어서, 목록이 그와 같은 높이면 두 덩어리가 한 짝으로
          읽힌다. 임의의 값을 고르면 어느 쪽에도 안 맞는 크기가 된다.
          한 줄이 64px 이라 다섯 줄하고 조금이 보인다 — 잘린 줄이 반쯤
          보이는 것이 "아래에 더 있다" 는 가장 조용한 표시다.

          `36dvh` 로 한 번 더 조인다. 짧은 화면에서는 340px 가 시트를 넘겨서
          목록 안이 아니라 화면이 스크롤되는데, 그러면 여기까지 온 이유가 없다.

          오른쪽 여백은 막대 자리다. 없으면 곡 길이 위로 막대가 겹친다. */}
      <ul className="scroll-panel mt-4 flex max-h-[min(21.25rem,36dvh)] flex-col pr-2">
        {queue.map((track, index) => {
          const isCurrent = sounding === track.id;
          const length = formatDuration(track.duration);

          return (
            <li key={track.id}>
              <button
                type="button"
                onClick={() => play("played", queue, index)}
                aria-label={`${track.artist} ${track.title} ${isCurrent ? "일시정지" : "재생"}`}
                className="group flex w-full items-center gap-4 rounded-btn px-3 py-2.5 text-left transition-colors hover:bg-lifted focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
              >
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-btn bg-ghost">
                  {/* 16:9 를 정사각형에 덮으므로 실제로 깔리는 폭은 1.78배다 */}
                  <Image
                    src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />

                  {/* 지금 나는 곡은 계속 보이고, 나머지는 포인터가 올라올 때만.
                      커버는 사진이라 아이콘이 그냥 얹히면 안 읽힌다 */}
                  <div
                    className={`absolute inset-0 grid place-items-center bg-ink/45 text-white transition-opacity duration-200 ${
                      isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isCurrent ? (
                      <Pause size={16} weight="fill" aria-hidden />
                    ) : (
                      <Play size={16} weight="fill" aria-hidden />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-[15px] tracking-[-0.01em] ${isCurrent ? "font-medium" : ""}`}
                  >
                    {track.title}
                  </p>
                  <p className="truncate text-[13px] text-slate">{track.artist}</p>
                </div>

                {/* 길이는 안 잘린다. 좁은 칸에서 먼저 사라지는 건 긴 이름이어야 한다 */}
                {length && (
                  <span className="shrink-0 text-[13px] tabular-nums text-slate">{length}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
