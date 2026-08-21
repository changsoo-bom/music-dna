"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { formatDuration } from "@/lib/utils";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

/**
 * 최근에 튼 곡. **곡을 재생하면 저절로 여기 쌓인다.**
 *
 * 담기 버튼을 따로 두지 않는 이유는, 들은 것이 곧 고른 것이기 때문이다.
 * 버튼을 하나 더 두면 "좋아요" 와 "들었다" 를 사람이 구분해서 눌러야 하는데,
 * 그 구분을 지금 이 화면이 쓸 데가 없다.
 *
 * **카드 전체가 버튼이다.** 위성 재생 버튼을 떼어 냈다 — 카드에 다른 할 일이
 * 없는데 44px 과녁을 따로 두면, 카드의 나머지 부분은 눌러도 아무 일이 안 나는
 * 죽은 영역이 된다. 과녁은 클수록 좋다.
 *
 * 추천은 큰 원 격자, 여기는 **작은 원 + 옆으로 붙은 글자**다. 3열 × 3줄까지
 * 쌓이고(`PLAYED_LIMIT`), 커버가 56px 이라 썸네일 원본(320×180 을 정사각으로
 * 자르면 180px)을 늘리지 않는다 — 정사각 카드로 크게 그렸을 때는 1.6배로
 * 늘어나 눈에 띄게 뭉갰다.
 *
 * **줄은 가만히 있을 때부터 표면을 갖는다.** 호버에만 배경을 주면 평소에는
 * 글자만 떠 있는 목록이라 허전하고, 어디까지가 한 곡인지도 안 보인다.
 * 크림 캔버스 위의 `bg-lifted` 가 기본이고, 포인터가 올라오면 `bg-white` +
 * `shadow-lift` 로 한 단계 떠오른다 — 시스템이 정한 세 표면의 순서 그대로다.
 * 지금 나는 곡은 그 떠오른 상태로 고정된다.
 */
export function MyPlaylist() {
  const played = usePlayedTracks();
  const queue = played.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 이 목록에서 나고 있는 곡. 추천에서 튼 같은 곡은 여기서 재생 아이콘이다 —
  // 눌렀을 때 멈추는 게 아니라 이 목록으로 옮겨 타기 때문이다.
  //
  // 구독은 하나다. 줄마다 `isSounding` 을 구독하면 아홉 줄이 아홉 번 깨어난다.
  // 판정은 같은 함수에서 나온다. → `soundingId`
  const sounding = usePlayerStore((state) => soundingId(state, "played"));

  if (queue.length === 0) {
    return (
      <div className="mt-14 grid place-items-center gap-4 rounded-stadium border-2 border-dashed border-hair px-8 py-20 text-center max-sm:mt-10 max-sm:px-6 max-sm:py-14">
        <p className="text-lg font-medium tracking-[-0.01em]">
          새로운 플레이리스트를 추가해보세요!
        </p>
        <p className="max-w-[38ch] text-sm text-slate">아래에서 곡을 재생하면 여기에 쌓입니다.</p>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:mt-6 max-sm:grid-cols-1">
      {queue.map((track, index) => {
        const isCurrent = sounding === track.id;
        const length = formatDuration(track.duration);
        const Icon = isCurrent ? Pause : Play;

        // `card-enter` 는 **마운트될 때 한 번만** 걸린다. `key` 가 곡 id 라
        // 이미 있던 줄은 DOM 이 그대로 살아 있으므로, 방금 튼 곡이 맨 앞에
        // 들어오면 그 줄만 올라온다.
        //
        // 시차(animation-delay)는 주지 않는다. 곡이 앞에 끼어들면 뒤 줄들의
        // index 가 한 칸씩 밀리는데, 인라인 delay 를 index 로 계산하면 그 값이
        // 바뀌면서 **이미 끝난 애니메이션이 다시 돈다.** 추천 목록은 판이 통째로
        // 갈려서 그 문제가 없지만 여기는 한 줄씩 들어온다.
        return (
          <li key={track.id} className="card-enter">
            <button
              type="button"
              onClick={() => play("played", queue, index)}
              aria-label={`${track.artist} ${track.title} ${isCurrent ? "일시정지" : "재생"}`}
              className={`group flex w-full items-center gap-4 rounded-btn px-4 py-3.5 text-left transition duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none ${
                isCurrent ? "bg-white shadow-lift" : "bg-lifted hover:bg-white hover:shadow-lift"
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ghost">
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />

                {/* 커버를 덮어 어둡게 깔고 그 위에 아이콘.
                    지금 나는 곡은 계속 보이고, 나머지는 포인터가 올라올 때만 보인다.
                    opacity 만 움직인다 — 커버는 사진이라 아이콘이 그냥 얹히면 안 읽힌다. */}
                <div
                  className={`absolute inset-0 grid place-items-center bg-ink/45 text-white transition-opacity duration-200 ${
                    isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Icon
                    size={18}
                    weight="fill"
                    aria-hidden
                    className={isCurrent ? "" : "translate-x-px"}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[17px] tracking-[-0.01em]">{track.title}</p>
                {/* 길이는 아티스트와 달리 **안 잘린다.** 좁은 칸에서 먼저
                    사라지는 건 긴 이름이어야 하고, 3:47 은 네 글자다. */}
                <p className="mt-0.5 flex items-baseline text-sm text-slate">
                  <span className="truncate">{track.artist}</span>
                  {length && <span className="shrink-0 tabular-nums">&nbsp;· {length}</span>}
                </p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
