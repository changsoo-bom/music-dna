import { ViewTransition } from "react";

import { PlaylistDetail } from "@/components/library/PlaylistDetail";

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
