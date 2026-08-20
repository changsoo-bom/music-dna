"use client";

import Image from "next/image";

import { PlayButton } from "@/components/player/PlayButton";
import { SUB_GENRES } from "@/constants/genres";
import { usePlayedTracks } from "@/hooks/use-played-tracks";
import { isPlayable } from "@/lib/use-player-store";

/**
 * 최근에 튼 곡. **곡을 재생하면 저절로 여기 쌓인다.**
 *
 * 담기 버튼을 따로 두지 않는 이유는, 들은 것이 곧 고른 것이기 때문이다.
 * 버튼을 하나 더 두면 "좋아요" 와 "들었다" 를 사람이 구분해서 눌러야 하는데,
 * 그 구분을 지금 이 화면이 쓸 데가 없다.
 *
 * 추천은 원형 격자, 여기는 줄이다. 같은 모양으로 두 번 그리면 무엇이
 * 시스템이 고른 것이고 무엇이 내가 들은 것인지가 흐려진다.
 */
export function MyPlaylist() {
  const played = usePlayedTracks();
  const queue = played.filter(isPlayable);

  if (queue.length === 0) {
    return (
      <div className="mt-14 grid place-items-center gap-4 rounded-stadium border-2 border-dashed border-hair px-8 py-20 text-center max-sm:mt-10 max-sm:px-6 max-sm:py-14">
        <p className="text-lg font-medium tracking-[-0.01em]">
          새로운 플레이리스트를 추가해보세요!
        </p>
        <p className="max-w-[38ch] text-sm text-slate">
          아래에서 곡을 재생하면 여기에 쌓입니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-12 border-t border-hair max-sm:mt-8">
      {queue.map((track, index) => (
        <li
          key={track.id}
          className="flex items-center gap-5 border-b border-hair py-4 max-sm:gap-4"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ghost">
            <Image
              src={`https://i.ytimg.com/vi/${track.youtubeId}/mqdefault.jpg`}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] tracking-[-0.01em]">{track.title}</p>
            <p className="truncate text-sm text-slate">
              {track.artist} · {SUB_GENRES[track.subGenre].ko}
            </p>
          </div>

          {/* 여기서 누르면 이 목록이 큐가 된다. 들은 순서대로 이어 듣게 된다 */}
          <PlayButton queue={queue} index={index} className="h-10 w-10 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
