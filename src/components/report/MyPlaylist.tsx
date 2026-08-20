"use client";

import { Pause, Play } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { currentTrack, isPlayable, usePlayerStore } from "@/lib/use-player-store";

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
 * 추천은 원형, 여기는 사각형이다. 같은 모양으로 두 번 그리면 무엇이 시스템이
 * 고른 것이고 무엇이 내가 들은 것인지가 흐려진다.
 */
export function MyPlaylist() {
  const played = usePlayedTracks();
  const queue = played.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  const soundingId = usePlayerStore((state) =>
    state.isPlaying ? (currentTrack(state)?.id ?? null) : null,
  );

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
    <ul className="mt-12 grid grid-cols-4 gap-x-8 gap-y-10 max-xl:grid-cols-3 max-sm:mt-8 max-sm:grid-cols-2 max-sm:gap-x-5 max-sm:gap-y-8">
      {queue.map((track, index) => {
        const sounding = soundingId === track.id;
        const Icon = sounding ? Pause : Play;

        return (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => play(queue, index)}
              aria-label={`${track.artist} ${track.title} ${sounding ? "일시정지" : "재생"}`}
              className="group w-full text-left focus-visible:outline-none"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-btn bg-ghost group-focus-visible:ring-2 group-focus-visible:ring-ink group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-canvas">
                <Image
                  src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
                  alt=""
                  fill
                  sizes="280px"
                  className="object-cover"
                />

                {/* 커버를 덮어 어둡게 깔고 그 위에 아이콘.
                    지금 나는 곡은 계속 보이고, 나머지는 포인터가 올라올 때만 보인다.
                    opacity 만 움직인다 — 커버는 사진이라 아이콘이 그냥 얹히면 안 읽힌다. */}
                <div
                  className={`absolute inset-0 grid place-items-center bg-ink/35 transition-opacity duration-200 ${
                    sounding ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink shadow-float">
                    <Icon
                      size={17}
                      weight="fill"
                      aria-hidden
                      className={sounding ? "" : "translate-x-px"}
                    />
                  </span>
                </div>
              </div>

              <p className="mt-4 truncate text-[17px] tracking-[-0.01em]">{track.title}</p>
              <p className="mt-1 truncate text-sm text-slate">{track.artist}</p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
