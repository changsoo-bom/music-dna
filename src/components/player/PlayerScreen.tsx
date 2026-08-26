"use client";

import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

import { TrackRow } from "@/components/common/TrackRow";
import { SUB_GENRES } from "@/constants/genres";
import { ORBIT_CIRCUMFERENCE } from "@/constants/orbit";
import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { usePreference } from "@/hooks/use-preference";
import { formatDuration } from "@/lib/format";
import { moodAffinity } from "@/lib/quiz/scoring";
import { trackMood } from "@/lib/report/recommend";
import { currentTrack, isCatalogTrack, isPlayable, usePlayerStore } from "@/lib/use-player-store";

/** 분위기 3축. 카탈로그가 곡마다 들고 있는 값 그대로다 */
const AXES = [
  { key: "energy", label: "에너지" },
  { key: "valence", label: "밝기" },
  { key: "dreamy", label: "몽환" },
] as const;

const ICON_BUTTON =
  "grid place-items-center rounded-full text-ink transition-opacity hover:opacity-55 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none";

/** 커버 그림. **`hq720` 을 먼저 쓰고, 없으면 `hqdefault` 로 떨어진다.**

    `hq720`(1280×720)은 16:9 원본 그대로라 원으로 잘라도 깨끗하지만
    **원본이 720p 이상일 때만 만들어진다** — 카탈로그에도 404 가 나는 곡이
    섞여 있다(수를 안 적는다. 카탈로그가 배치로 커지는 중이라 적는 순간 낡는다).
    커버가 통째로 빈 채로 나오던 자리가 여기다. `maxresdefault` 는 그 곡들에
    똑같이 없고, 항상 있는 16:9 는 `mqdefault`(320×180)뿐인데 이 크기를 못 채운다.

    그래서 `hqdefault`(480×360)로 떨어진다. 16:9 를 4:3 으로 맞추려고 위아래에
    검은 띠를 넣은 그림이라, 정사각형에 `object-cover` 하면 세로가 차면서 띠가
    같이 들어온다. 알맹이가 세로의 3/4 이니 4/3 배로 키우면 띠가 상자 밖으로
    밀려난다 → `scale-[1.34]`.

    `sizes` 는 상자 폭이 아니라 그려지는 폭이다: 정사각형 상자에 16:9 를
    `object-cover` 하면 폭이 1.78배로 깔린다.
    340 × 16/9 ≒ 605 → 2배 화면에서 1210, `hq720` 원본 1280 안이다.

    곡이 바뀌면 `key` 로 갈아 끼운다. 안 그러면 앞 곡에서 켜진 폴백이 남는다. */
function CoverImage({ youtubeId }: { youtubeId: string }) {
  const [fallback, setFallback] = useState(false);

  return (
    <Image
      src={`https://i.ytimg.com/vi/${youtubeId}/${fallback ? "hqdefault" : "hq720"}.jpg`}
      alt=""
      fill
      sizes="(max-width: 1024px) 121vw, 620px"
      className={fallback ? "scale-[1.34] object-cover" : "object-cover"}
      onError={() => setFallback(true)}
    />
  );
}

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

  /* **카탈로그 밖의 곡에는 좌표가 없다.** 검색이 YouTube 에서 찾아온 곡은
     장르도 무드도 없다 — 그건 사람이 카탈로그에 적어 넣는 값이라 API 가 안
     준다. 지어내면 이 화면에서 제일 큰 글씨로 거짓말을 하게 된다("내 취향과
     73% 맞음"). 없으면 그 줄들을 통째로 안 그린다 → `RemoteTrack` */
  const scored = isCatalogTrack(track) ? track : null;
  const mood = scored ? trackMood(scored) : null;
  const match =
    preference && mood
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
            오른쪽은 **지금 무엇을 듣고 있고 곁에 무엇이 있는가**(제목·목록).
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
                <CoverImage key={track.youtubeId} youtubeId={track.youtubeId} />
              </div>
            </div>

            {/* 지표는 커버 밑이다. 이 곡의 좌표라 커버와 같은 것을 설명한다 —
                제목 옆에 두면 곡 정보가 아니라 화면의 주제처럼 읽힌다.

                곡이 바뀌면 다시 채워진다: `key` 로 갈아 끼워야 애니메이션이 다시
                돈다. 같은 요소에 값만 바꾸면 막대가 소리 없이 순간이동한다.

                **좌표가 없는 곡에는 안 그린다.** 검색이 YouTube 에서 찾아온
                곡은 무드가 없어서, 그리려면 값을 지어내야 한다 → `mood` */}
            {mood && (
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
            )}

            {/* 막대 아래다 — 위 세 줄을 다 읽고 나서 나오는 한 문장이 결론이다.
                검사를 안 한 사람에게는 안 나온다: 기준이 없는데 숫자를 적을 수 없다 */}
            {match !== null && (
              <p className="mt-6 text-[15px] text-slate">
                내 취향과 <span className="font-medium text-ink tabular-nums">{match}%</span> 맞음
              </p>
            )}
          </div>

          <div className="flex w-full min-w-0 flex-col">
            {/* 카탈로그 밖의 곡은 장르 자리에 출처를 적는다. 자리를 비워 두면
                제목이 위로 붙어 다른 화면처럼 보이고, 장르를 지어내면 이 곡이
                카탈로그에 있는 것처럼 읽힌다 → `RemoteTrack` */}
            <p className="eyebrow max-lg:justify-center">
              {scored ? SUB_GENRES[scored.subGenre].ko : "YouTube"}
            </p>
            <h1 className="mt-5 text-[44px] leading-[1.1] max-sm:text-[32px]">{track.title}</h1>
            <p className="mt-3 text-lg text-slate">
              {track.artist}
              {length && <span className="tabular-nums"> · {length}</span>}
            </p>

            {/* 조작은 여기 없다. **재생 바가 이 화면 위에 그대로 살아 있어서**
                (`--player-bar-h` 만큼 시트가 위에서 끝난다) 같은 버튼을 한 벌 더
                놓으면 화면에 재생 버튼이 두 개 보인다. 하나만 남기고, 이 화면은
                조작이 아니라 **이 곡이 무엇인지**를 맡는다. */}
            <PlayedQueue />
          </div>
        </div>
      </div>
    </dialog>
  );
}

/**
 * 지금 듣고 있는 것의 목록.
 *
 * **묶음을 틀었으면 그 묶음을 그린다.** 저장된 리스트(`library:{id}`)도,
 * 전체보기의 카테고리 전체 재생(`browse`)도 마찬가지다 — 사람이 "이걸 다
 * 틀어라" 라고 고른 것이라, 곁에 놓고 볼 목록은 그 묶음이다. 스토어의
 * `queue` 가 `play` 가 받은 스냅숏이고 그것이 곧 재생 순서다. 라디오로
 * 이어붙은 곡도 따라온다.
 *
 * **추천만 예외로 빠른 선곡을 그린다.** 저기는 다섯 장 중 하나를 집는
 * 자리고, 집은 곡은 재생과 동시에 빠른 선곡 맨 앞으로 들어간다
 * (`recordPlayed`) — 곁에 놓고 볼 목록은 그 다섯 장이 아니다.
 *
 * 제목이 어느 쪽인지 말한다. 같은 자리에 다른 목록이 뜨는데 이름이 하나면
 * 무엇을 보고 있는지 알 수 없다.
 *
 * 카드가 아니라 줄이다. 홈에서는 이 목록이 화면의 주인공이라 3열 카드로
 * 펴지만, 여기서는 지금 나는 곡 옆에 붙는 곁가지라 세로로 눕는 편이 읽힌다.
 */
function PlayedQueue() {
  const queueId = usePlayerStore((state) => state.queueId);
  const storeQueue = usePlayerStore((state) => state.queue);
  const played = usePlayedTracks();
  const play = usePlayerStore((state) => state.play);
  const toggle = usePlayerStore((state) => state.toggle);

  // 큐 이름이 없는 것은 아직 아무것도 안 튼 상태다. 이 화면은 곡이 있을 때만
  // 열리므로 거의 안 오지만, 오면 빠른 선곡 쪽으로 읽는다
  const fromRecommend = queueId === "recommend" || queueId === null;
  /* **제목은 무엇을 그리고 있는지를 말한다.** 추천에서 튼 경우는 빠른 선곡을
     대신 그리는 것이고, 홈 빠른 선곡에서 튼 경우(`play("played", …)`)는 그
     목록 자체다 — 사람에게는 둘 다 "빠른 선곡" 한 이름이라, 같은 목록이
     어디서 눌렀느냐에 따라 두 이름으로 뜨면 안 된다.
     그리는 **내용**은 아래에서 따로 갈린다: `"played"` 는 누른 순간의
     스냅숏(`storeQueue`)을 그대로 쓴다 */
  const showsPlayed = fromRecommend || queueId === "played";
  const listId = fromRecommend ? "played" : queueId;
  // 빠른 선곡은 담은 것을 전부 그리는 곳이 아니다 — 여기서 줄을 누르면 바로
  // 트는 자리라 틀 수 있는 곡만 온다
  const queue = fromRecommend ? played.filter(isPlayable) : storeQueue;
  /**
   * 지금 나는 곡. **목록 신원을 안 본다**(`soundingId` 와 다른 점).
   *
   * 추천에서 튼 곡은 큐 이름이 `"recommend"` 인데 이 자리에는 빠른 선곡이
   * 뜬다. 신원까지 맞춰 보면 방금 누른 곡이 눈앞의 목록 맨 위에 있는데도
   * 아무 표시가 안 붙는다 — 이 화면은 "지금 무엇을 듣고 있는가" 를 말하는
   * 자리라 그러면 있으나 마나다.
   *
   * 아이콘과 행동이 갈리지 않게 **누르는 쪽을 여기 맞춘다**: 표시가 붙은
   * 줄은 다시 눌렀을 때 일시정지다(아래 `onPlay`). 목록마다 판정이 갈려도
   * 되는 이유가 이것이다 — 저기는 여러 목록이 같은 곡을 들고 있고,
   * 여기는 목록이 하나뿐이다.
   *
   * 줄마다 구독하면 아홉 줄이 아홉 번 깨어난다. 한 번 받아서 줄마다 비교한다.
   */
  const sounding = usePlayerStore((state) =>
    state.isPlaying ? (currentTrack(state)?.id ?? null) : null,
  );

  // 이 화면은 곡이 있을 때만 열리므로 보통 비지 않는다. 그래도 비면 제목만
  // 남기지 않고 통째로 접는다 — 아무것도 없는 제목은 고장으로 보인다
  if (queue.length === 0) return null;

  return (
    <section className="mt-14 w-full max-lg:text-left">
      <h2 className="text-[13px] font-bold text-slate">{showsPlayed ? "빠른 선곡" : "재생목록"}</h2>

      {/* **여기서만 스크롤한다**(`.scroll-panel`) — 목록이 아홉 줄까지 늘어도
          커버와 조작은 제자리에 남는다.

          높이가 **남는 자리를 그대로 먹는다.** 이 목록 위아래로 시트가 이미
          쓰고 있는 높이를 화면에서 빼고 남은 만큼이 목록 몫이다. 고정값으로
          잡으면 큰 화면에서는 아래가 비고 작은 화면에서는 시트가 넘친다 —
          목록 안이 아니라 화면이 스크롤되면 여기까지 온 이유가 없다.

          **수를 여기 안 적는다.** 한때 449px 이 박혀 있었는데 그 안에는 재생
          바 높이가 녹아 있었고, 좁은 화면에서 바가 68px 로 줄고 커버 위아래
          여백도 같이 줄어드는 것을 따라가지 못했다 — 목록이 73px 만큼 짧게
          잘렸다. 바 높이와 시트가 쓰는 높이를 각각 CSS 변수로 두고 빼면,
          브레이크포인트에서 값이 바뀌어도 이 식은 그대로 맞는다
          → `globals.css` 의 `--player-bar-h` · `--screen-chrome-h`

          `dvh` 다. iOS 주소창이 접히고 펴질 때 `vh` 는 안 따라온다 —
          `body` 의 `min-height` 와 같은 이유다.

          바닥을 두 줄(8rem)로 막는다. 아주 낮은 창에서 계산값이 한 줄도
          안 되는 높이로 떨어지면 목록이 아니라 잘린 그림이 된다.

          오른쪽 여백은 막대 자리다. 없으면 곡 길이 위로 막대가 겹친다. */}
      <ul className="scroll-panel mt-4 flex max-h-[max(8rem,calc(100dvh-var(--player-bar-h)-var(--screen-chrome-h)))] flex-col pr-2">
        {queue.map((track, index) => (
          <li key={track.id}>
            {/* **담기 버튼은 뺀다**(`savable`). 이 목록은 지금 나는 곡 옆에
                붙는 곁가지고, 곡을 담는 것은 홈·보관함·추천에서 하는 일이다
                — 여기까지 같은 버튼을 놓으면 시트가 목록 화면 노릇을 한다.
                보관함 구독도 같이 사라진다 */}
            <TrackRow
              compact
              savable={false}
              track={track}
              isCurrent={sounding === track.id}
              saved={false}
              // 표시가 붙은 줄은 일시정지다. 큐 이름이 달라도 마찬가지 —
              // `play` 에 맡기면 다른 목록으로 보고 그 곡을 처음부터 다시 튼다
              onPlay={() =>
                sounding === track.id ? toggle() : play(listId, queue, index)
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
