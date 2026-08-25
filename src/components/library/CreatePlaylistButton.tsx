"use client";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createPlaylist } from "@/lib/playlists";

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
 */
export function CreatePlaylistButton() {
  return (
    <button
      type="button"
      onClick={() => createPlaylist()}
      className="inline-flex h-12 items-center gap-2 rounded-pill bg-white pr-6 pl-5 text-base font-medium tracking-[-0.02em] whitespace-nowrap text-ink shadow-lift transition duration-200 hover:-translate-y-px active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
    >
      <PlusIcon size={18} weight="bold" aria-hidden />
      리스트 추가하기
    </button>
  );
}
