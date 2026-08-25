"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { usePlaylists } from "@/hooks/use-playlists";
import { PLAYLIST_LIMIT, createPlaylist } from "@/lib/playlists";

/**
 * 새 리스트를 만드는 버튼. 제목 옆에 선다.
 *
 * **제목 줄에 있다.** 목록 위에 따로 놓았더니 리스트가 없을 때는 빈 화면
 * 위에 버튼만 떠 있고, 리스트가 늘어나면 목록과 제목 사이에 낀 줄이 됐다.
 * 여기서 만드는 것이 무엇인지는 제목이 이미 말하고 있다.
 *
 * **떠 있는 것의 모양이다**(흰 배경 · 알약 · `shadow-lift`). 필 버튼의 잉크
 * 테두리는 화면의 주 행동에 쓰는 무게고, 여기는 제목 옆에 붙는 조작이라
 * 네비 필·칩과 같은 편에 선다 → `docs/design-reference.md`
 *
 * 포인터가 올라오면 1px 뜬다. `transform` 만 움직여서 옆 글자를 안 민다.
 * `+` 는 곡 줄의 담기 버튼과 같은 기호다 — 같은 일(목록에 더하기)에 같은 표시.
 *
 * 페이지(`page.tsx`)는 서버 컴포넌트다. 누르는 것 하나 때문에 화면 전체를
 * 클라이언트로 내리지 않으려고 버튼만 떼어 둔다 → `.claude/rules/structure.md`
 *
 * **상한에서는 눌리지 않는다**(`PLAYLIST_LIMIT`). `createPlaylist` 가 거기서
 * `null` 을 내므로 그냥 두면 눌러도 아무 일이 안 나는 버튼이 된다 — 그건
 * 고장으로 읽힌다. 왜 안 되는지는 `data-hint` 가 말한다: 아이콘 조작에 쓰던
 * 것과 같은 말풍선이고, `title` 과 달리 키보드로 짚어도 뜬다 → `globals.css`
 *
 * **`disabled` 가 아니라 `aria-disabled` 다.** `disabled` 버튼은 초점을 못
 * 받아서 그 말풍선을 키보드로는 영영 못 본다 — 왜 안 되는지가 마우스에게만
 * 보이면 안 된다. 곡 줄이 재생 불가를 다루는 방식과 같다 → `TrackRow`
 */
export function CreatePlaylistButton() {
  const full = usePlaylists().length >= PLAYLIST_LIMIT;

  return (
    <button
      type="button"
      onClick={() => {
        if (!full) createPlaylist();
      }}
      aria-disabled={full}
      data-hint={full ? `리스트는 ${PLAYLIST_LIMIT}개까지 만들 수 있습니다` : undefined}
      className="inline-flex h-12 items-center gap-2 rounded-pill bg-white pr-6 pl-5 text-base font-medium tracking-[-0.02em] whitespace-nowrap text-ink shadow-lift transition duration-200 hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none aria-disabled:translate-y-0 aria-disabled:opacity-40"
    >
      <PlusIcon size={18} weight="bold" aria-hidden />
      리스트 추가하기
    </button>
  );
}
