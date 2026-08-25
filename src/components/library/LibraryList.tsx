"use client";

import { TrackRow } from "@/components/common/TrackRow";
import { PlaylistCard } from "@/components/library/PlaylistCard";
import { ButtonLink } from "@/components/ui/Button";
import { useLibrary } from "@/hooks/use-library";
import { useStoredValue } from "@/hooks/use-stored-value";
import { parsePlaylists } from "@/lib/schemas/playlist";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { isPlayable, soundingId, usePlayerStore } from "@/lib/use-player-store";

/**
 * 보관함. 사람이 직접 담은 곡만 있고, 뺄 때까지 남는다.
 *
 * 빠른 선곡과 달리 **한 열이다.** 담은 곡은 훑어보는 것이 아니라 찾아보는
 * 것이라 위에서 아래로 읽는 편이 빠르고, 개수 제한이 없어서 줄 수를 화면
 * 폭으로 미리 정해 둘 수도 없다.
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 빈 목록이다 — 비어 있는
 * 안내가 한 프레임 스칠 수 있다. 홈이 소개 화면에 쓴 것과 같은 대가고,
 * 이 페이지는 그 크기가 한 덩어리뿐이라 그대로 둔다.
 */
/** 빈 줄의 글자 자리. 폭이 다 달라야 목록처럼 읽힌다 — 같으면 표가 된다.
    비율이라 좁은 화면에서도 오른쪽 버튼 자리를 안 넘는다 */
const GHOST_ROWS = [
  ["w-[38%]", "w-[19%]"],
  ["w-[52%]", "w-[14%]"],
  ["w-[30%]", "w-[23%]"],
] as const;

export function LibraryList() {
  const saved = useLibrary();
  // 큐는 **틀 수 있는 곡만** 이다. 목록은 담은 것을 전부 그린다 —
  // 재생 불가를 목록에서까지 빼면, 담아 놓고 열었을 때 "아직 담은 곡이
  // 없습니다" 가 뜬다. 담긴 건 사실인데 화면이 거짓말을 하는 것이다.
  const queue = saved.filter(isPlayable);
  const play = usePlayerStore((state) => state.play);
  // 구독은 하나다. 줄마다 구독하면 줄 수만큼 깨어난다 → `MyPlaylist`
  const sounding = usePlayerStore((state) => soundingId(state, "library"));
  // 훅 파일을 따로 두지 않는다 — 여는 화면이 여기 하나다
  const playlists = parsePlaylists(useStoredValue(STORAGE_KEYS.playlists));

  if (saved.length === 0 && playlists.length === 0) {
    return (
      <div className="relative mt-10 max-sm:mt-6">
        {/* **빈 줄 셋을 실제 줄의 기하로 깔아 둔다**(커버 56px 원 + 글자 두 줄).
            점선 스타디움 박스는 "여기 뭔가 없다" 까지만 말했다. 곡이 쌓일 모양을
            그려 두면 무엇이 들어오는 자리인지가 먼저 읽히고, 담은 뒤의 화면과
            같은 리듬이라 목록이 채워질 때 자리가 튀지 않는다.
            아래로 갈수록 흐려진다 — 셋에서 끝나는 목록이 아니라는 뜻이다.
            장식이라 낭독기에서 지운다. */}
        <div
          aria-hidden
          className="flex flex-col gap-3 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        >
          {GHOST_ROWS.map(([title, meta], i) => (
            <div key={i} className="flex items-center gap-4 rounded-btn bg-lifted py-3.5 pr-14 pl-4">
              <div className="h-14 w-14 shrink-0 rounded-full bg-ghost" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className={`h-3.5 rounded-pill bg-ghost ${title}`} />
                <div className={`h-2.5 rounded-pill bg-hair ${meta}`} />
              </div>
            </div>
          ))}
        </div>

        {/* 안내는 그 위에 얹는다. 마스크가 이미 아래를 지워서 글자와 겹치지 않는다 */}
        <div className="absolute inset-0 grid content-center justify-items-center gap-5 px-6 text-center">
          <p className="text-[22px] font-medium tracking-[-0.02em]">나만의 리스트를 만들어보세요</p>
          <p className="max-w-[34ch] text-sm text-slate">
            곡 옆의 +를 누르면 리스트에 추가됩니다
          </p>
          {/* 리스트 만들기는 제목 옆에 있다(`CreatePlaylistButton`). 여기까지
              같은 버튼을 놓으면 한 화면에 같은 일을 하는 버튼이 둘이다 */}
          <ButtonLink href="/">추천 보러 가기</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      {playlists.length > 0 && (
        <ul className="mt-10 flex flex-col gap-3 max-sm:mt-6">
          {playlists.map((playlist) => (
            <li key={playlist.id} className="card-enter">
              <PlaylistCard playlist={playlist} sounding={sounding} />
            </li>
          ))}
        </ul>
      )}

      <ul className="mt-6 flex flex-col gap-3">
        {saved.map((track) => (
          <li key={track.id} className="card-enter">
            <TrackRow
              track={track}
              isCurrent={sounding === track.id}
              saved
              onPlay={() => play("library", queue, queue.findIndex((t) => t.id === track.id))}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
