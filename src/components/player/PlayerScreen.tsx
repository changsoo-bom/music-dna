"use client";

import { CaretDown, Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";

import { VolumeControl } from "@/components/player/VolumeControl";
import { SUB_GENRES } from "@/constants/genres";
import { ORBIT_CIRCUMFERENCE } from "@/constants/orbit";
import { usePreference } from "@/hooks/use-preference";
import { formatDuration } from "@/lib/format";
import { moodAffinity } from "@/lib/quiz/scoring";
import { trackMood } from "@/lib/report/recommend";
import { currentTrack, usePlayerStore } from "@/lib/use-player-store";

/** 분위기 3축. 카탈로그가 곡마다 들고 있는 값 그대로다 */
const AXES = [
  { key: "energy", label: "에너지", low: "차분함", high: "격렬함" },
  { key: "valence", label: "밝기", low: "어두움", high: "밝음" },
  { key: "dreamy", label: "몽환", low: "또렷함", high: "몽환적" },
] as const;

const ICON_BUTTON =
  "grid place-items-center rounded-full text-ink transition-opacity hover:opacity-55 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none";

function fillStyle(fill: number, index: number): CSSProperties {
  return { "--fill": fill, animationDelay: `${index * 0.09}s` } as CSSProperties;
}

/**
 * 전체 화면 재생. 바를 누르면 열린다.
 *
 * **`<dialog>` 를 쓴다.** 포커스 가둠·Escape·뒤 배경 비활성화·최상위 레이어가
 * 전부 브라우저 기능이다. 직접 만들면 그 넷을 다 손으로 해야 하고, 보통
 * 하나쯤 빠진 채로 배포된다 — 그러면 탭이 화면 뒤로 새어 나간다.
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
   * 최상위 레이어에 올라가지 않고, 그러면 포커스도 안 갇힌다.
   *
   * **개발에서만 비모달로 연다.** `showModal()` 은 최상위 레이어에 띄우면서
   * 문서의 나머지를 통째로 `inert` 로 만드는데, 그게 브라우저 확장이나
   * 개발 도구가 `body` 에 심는 오버레이까지 죽인다 — 이 화면에는 요소
   * 주석을 달 수가 없다. 화면을 보면서 고치는 일이 막히는 건 대가가 크다.
   *
   * 프로덕션은 모달 그대로다. 개발에서만 다른 것: 탭이 시트 밖으로 나갈 수
   * 있고 `::backdrop` 이 안 그려진다. **Escape 는 아래에서 직접 받는다** —
   * 그건 브라우저가 모달에만 해 주는 일이라 개발에서 안 되면 차이를
   * 모르고 지나칠 수 있다.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      if (process.env.NODE_ENV === "development") dialog.show();
      else dialog.showModal();
    }
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
      // Escape 와 배경 클릭은 브라우저가 `close` 로 알려 준다. 우리 상태를 거기 맞춘다
      onClose={onClose}
      aria-label={`${track.title} 재생 화면`}
      className="player-screen"
    >
      <div className="shell flex min-h-dvh flex-col justify-center py-20 max-sm:py-14">
        {/* 닫기가 DOM 의 처음이다 — `showModal()` 이 첫 번째 포커스 가능한
            요소로 초점을 옮기므로, 열자마자 Enter 로 닫을 수 있다 */}
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

        <div className="grid grid-cols-[minmax(0,340px)_1fr] items-center gap-16 max-lg:grid-cols-1 max-lg:justify-items-center max-lg:gap-10 max-lg:text-center">
          {/* 커버 + 진행 호. 바에 있는 것과 같은 그림을 크게 편 것이다 */}
          <div className="relative aspect-square w-full max-lg:w-[min(340px,68vw)]">
            <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="76" fill="none" strokeWidth="3" className="stroke-ghost" />
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
              <Image
                src={`https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
                alt=""
                fill
                sizes="(max-width: 1024px) 68vw, 340px"
                className="object-cover"
              />
            </div>
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

            {/* 곡이 바뀌면 다시 채워진다 — `key` 로 갈아 끼워야 애니메이션이 다시 돈다.
                같은 요소에 값만 바꾸면 막대가 소리 없이 순간이동한다 */}
            <ul key={track.id} className="mt-12 flex flex-col gap-4">
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

            {/* 검사를 안 한 사람에게는 안 나온다. 기준이 없는데 숫자를 적을 수는 없다 */}
            {match !== null && (
              <p className="mt-8 text-[15px] text-slate">
                내 취향과 <span className="font-medium text-ink tabular-nums">{match}%</span> 맞음
              </p>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
