"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";
import type { MouseEvent } from "react";

import { Pop } from "@/components/ui/Pop";
import type { PopState } from "@/hooks/use-pop";
import { usePlaylists } from "@/hooks/use-playlists";
import { PLAYLIST_LIMIT, createPlaylist, togglePlaylistTrack } from "@/lib/playlists";
import type { CatalogTrack } from "@/types/music";

/**
 * 곡을 어느 리스트에 담을지 고르는 창.
 *
 * **여기서만 리스트를 구독한다.** 곡 줄마다 리스트를 읽으면 아홉 줄에
 * 구독이 아홉 개고, 이 창은 한 번에 하나만 열린다. 열려 있는 동안에만
 * 사는 컴포넌트라 구독도 그동안만 산다 → `LibraryButton`
 *
 * 창 껍데기와 여닫는 일은 `Pop` 이 한다.
 *
 * **고르면 닫힌다.** 한 곡을 여러 리스트에 잇달아 담는 일은 드물고, 담고
 * 나서도 창이 남아 있으면 "더 할 일이 있나" 하고 한 번 더 보게 된다.
 * 닫는 것까지가 담기의 끝이다.
 *
 * 담긴 리스트는 체크다. 색이 아니라 형태로 말한다 → `LibraryButton`
 * 이미 담긴 리스트를 누르면 빼는 것도 여기서 된다 — 같은 버튼이 두 방향을
 * 한다(`togglePlaylistTrack`). 그쪽도 누르면 닫힌다.
 */
export function PlaylistPickerPop({ state, track }: { state: PopState; track: CatalogTrack }) {
  const playlists = usePlaylists();
  const full = playlists.length >= PLAYLIST_LIMIT;

  /** 담고 닫는다. 닫는 길은 `close()` 하나로 모은다 — 창이 사라지는 방법이
      둘이면 애니메이션도 두 벌이 된다 */
  const pick = (event: MouseEvent<HTMLButtonElement>, playlistId: string) => {
    togglePlaylistTrack(playlistId, track.id);
    event.currentTarget.closest("dialog")?.close();
  };

  return (
    <Pop state={state} label={`${track.title} 리스트에 담기`} width="w-[min(26rem,calc(100vw-2rem))]">
      <p className="text-lg font-medium tracking-[-0.01em]">리스트에 담기</p>
      <p className="mt-1 truncate text-sm text-slate">{track.title}</p>

      {playlists.length === 0 ? (
        <p className="mt-6 text-sm text-slate">
          아직 리스트가 없습니다. 아래에서 하나 만들고 눌러서 담으세요.
        </p>
      ) : (
        // `.scroll-panel` 이다 — 리스트가 많아지면 여기서만 스크롤하고,
        // 막대 모양도 전체 화면 재생목록과 같은 것을 쓴다 → `globals.css`
        <ul className="scroll-panel mt-5 flex max-h-80 flex-col gap-1 pr-1">
          {playlists.map((list) => {
            const has = list.trackIds.includes(track.id);
            return (
              <li key={list.id}>
                <button
                  type="button"
                  onClick={(event) => pick(event, list.id)}
                  aria-pressed={has}
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center">
                    {has && <CheckIcon size={20} weight="light" aria-hidden />}
                  </span>
                  <span className={`min-w-0 flex-1 truncate ${has ? "font-medium" : ""}`}>
                    {list.name}
                  </span>
                  <span className="shrink-0 text-sm text-slate tabular-nums">
                    {list.trackIds.length}곡
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 선 하나로 나눈다. 위는 **있는 것 중에 고르는** 자리고 아래는
          **없는 것을 만드는** 자리라, 줄이 이어져 있으면 새 리스트가 목록의
          마지막 항목처럼 읽힌다. 리스트가 없을 때는 나눌 것도 없다 */}
      <div className={`mt-4 ${playlists.length > 0 ? "border-t border-hair pt-3" : ""}`}>
        {/* 리스트가 없어도 여기서 끝낼 수 있다. 만들러 다른 화면에 갔다 오면
            담으려던 곡을 다시 찾아야 한다.

            **만들기만 한다. 창은 안 닫힌다.** 새 리스트는 맨 위에 생기고
            (`createPlaylist`), 담는 것은 그것을 한 번 더 누르는 일이다 —
            만들자마자 담고 닫아 버리면 방금 무엇이 생겼는지, 어디에 담겼는지를
            못 본 채로 창이 사라진다.

            상한에서는 안 눌린다. `aria-disabled` 라 초점은 받으므로 왜 안
            되는지가 키보드에도 닿는다 → `CreatePlaylistButton` */}
        <button
          type="button"
          onClick={() => {
            if (!full) createPlaylist();
          }}
          aria-disabled={full}
          data-hint={full ? `리스트는 ${PLAYLIST_LIMIT}개까지 만들 수 있습니다` : undefined}
          className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left font-medium transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none aria-disabled:opacity-40 aria-disabled:hover:bg-transparent"
        >
          {/* 아이콘 자리가 위의 체크 자리와 같은 폭이다. 안 맞추면 글자
              시작점이 한 줄만 어긋난다 */}
          <span className="grid h-6 w-6 shrink-0 place-items-center">
            <PlusIcon size={20} weight="bold" aria-hidden />
          </span>
          새 리스트 만들기
        </button>

        <button
          type="button"
          onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          className="mt-1 h-11 w-full rounded-btn text-sm text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
        >
          닫기
        </button>
      </div>
    </Pop>
  );
}
