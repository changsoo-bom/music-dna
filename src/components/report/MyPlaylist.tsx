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
 * 추천은 큰 원 격자, 여기는 **작은 원 + 옆으로 붙은 글자**다. 셋씩 세 줄로
 * 접히니 같은 자리에서 더 많은 곡을 보여 주고, 커버가 56px 이라 썸네일
 * 원본(320×180 을 정사각으로 자르면 180px)을 늘리지 않는다 —
 * 정사각 카드로 크게 그렸을 때는 1.6배로 늘어나 눈에 띄게 뭉갰다.
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
    <ul className="mt-10 grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:mt-6 max-sm:grid-cols-1">
      {queue.map((track, index) => {
        const sounding = soundingId === track.id;
        const Icon = sounding ? Pause : Play;

        return (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => play(queue, index)}
              aria-label={`${track.artist} ${track.title} ${sounding ? "일시정지" : "재생"}`}
              className={`group flex w-full items-center gap-4 rounded-btn px-4 py-3.5 text-left transition duration-200 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none ${
                sounding ? "bg-white shadow-lift" : "bg-lifted hover:bg-white hover:shadow-lift"
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
                    sounding ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Icon
                    size={18}
                    weight="fill"
                    aria-hidden
                    className={sounding ? "" : "translate-x-px"}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <p className="truncate text-[17px] tracking-[-0.01em]">{track.title}</p>
                <p className="mt-0.5 truncate text-sm text-slate">{track.artist}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
