import type { Metadata } from "next";
import { ViewTransition } from "react";

import { PlaylistDetail } from "@/components/library/PlaylistDetail";

/**
 * **리스트 이름을 못 쓴다.** 이름은 Local Storage 에 있고 서버는 그걸 못 본다
 * — 아래 화면이 이름을 클라이언트에서 그리는 것과 같은 이유다. 사이트 이름은
 * 루트의 `template` 이 붙인다 → `app/layout.tsx`
 */
export const metadata: Metadata = {
  title: "리스트",
};

/**
 * 리스트 상세. 이름도 곡도 저장소에 있어서 서버가 아는 것이 주소의 id 뿐이다
 * — 라우트는 그 id 를 넘기기만 하고 화면은 `PlaylistDetail` 이 그린다.
 *
 * `params` 는 Promise 다. 껍데기는 목록 화면과 같은 전환·여백을 쓴다.
 */
export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      <main className="shell flex-1 pb-28 max-sm:pb-16">
        <section className="pt-28 pb-24 max-sm:pt-16 max-sm:pb-14">
          <PlaylistDetail id={id} />
        </section>
      </main>
    </ViewTransition>
  );
}
