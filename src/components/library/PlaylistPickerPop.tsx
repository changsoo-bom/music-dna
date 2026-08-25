"use client";

import { CheckIcon, PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { usePlaylists } from "@/hooks/use-playlists";
import { createPlaylist, togglePlaylistTrack } from "@/lib/playlists";
import type { CatalogTrack } from "@/types/music";

/**
 * 곡을 어느 리스트에 담을지 고르는 창.
 *
 * **여기서만 리스트를 구독한다.** 곡 줄마다 리스트를 읽으면 아홉 줄에
 * 구독이 아홉 개고, 이 창은 한 번에 하나만 열린다. 열려 있는 동안에만
 * 사는 컴포넌트라 구독도 그동안만 산다 → `LibraryButton`
 *
 * **진짜 모달이다**(`showModal()`). 전체 화면 재생과 반대다 — 저쪽은 시트
 * 뒤의 재생 바가 살아 있어야 해서 모달이 아니었고, 여기는 뒤에서 할 일이
 * 없다. 그래서 Escape·초점 가두기·뒤 배경을 브라우저가 해 준다.
 *
 * 담긴 리스트는 체크다. 색이 아니라 형태로 말한다 → `LibraryButton`
 */
export function PlaylistPickerPop({ track, onClose }: { track: CatalogTrack; onClose: () => void }) {
  const playlists = usePlaylists();

  return (
    <dialog
      // 열자마자 모달로 띄운다. `open` 속성만으로는 최상위 레이어에 안 올라간다
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      // 배경을 누르면 닫는다. `<dialog>` 자체가 과녁이면 그건 바깥이다
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-label={`${track.title} 리스트에 담기`}
      className="pop m-auto w-[min(26rem,calc(100vw-2rem))] rounded-stadium bg-lifted p-7 shadow-float"
    >
      <p className="text-lg font-medium tracking-[-0.01em]">리스트에 담기</p>
      <p className="mt-1 truncate text-sm text-slate">{track.title}</p>

      {playlists.length === 0 ? (
        <p className="mt-6 text-sm text-slate">아직 리스트가 없습니다. 새로 만들어 담아 보세요.</p>
      ) : (
        <ul className="mt-5 flex max-h-80 flex-col gap-1 overflow-y-auto">
          {playlists.map((list) => {
            const has = list.trackIds.includes(track.id);
            return (
              <li key={list.id}>
                <button
                  type="button"
                  onClick={() => togglePlaylistTrack(list.id, track.id)}
                  aria-pressed={has}
                  className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-left transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center">
                    {has && <CheckIcon size={20} weight="light" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{list.name}</span>
                  <span className="shrink-0 text-sm text-slate tabular-nums">
                    {list.trackIds.length}곡
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* 리스트가 없어도 여기서 끝낼 수 있다. 만들러 다른 화면에 갔다 오면
          담으려던 곡을 다시 찾아야 한다 */}
      <button
        type="button"
        onClick={() => togglePlaylistTrack(createPlaylist().id, track.id)}
        className="mt-4 flex w-full items-center gap-2 rounded-btn px-3 py-2.5 text-left font-medium transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
      >
        <PlusIcon size={20} weight="bold" aria-hidden />
        새 리스트에 담기
      </button>

      <button
        type="button"
        onClick={(event) => event.currentTarget.closest("dialog")?.close()}
        className="mt-2 h-11 w-full rounded-btn text-slate transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
      >
        닫기
      </button>
    </dialog>
  );
}
