"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import type { PopState } from "@/hooks/use-pop";

/**
 * 화면 가운데 뜨는 창의 껍데기. 확인 창과 리스트 고르기가 같은 것을 쓴다
 * → `ConfirmPop` · `PlaylistPickerPop`
 *
 * **진짜 모달이다**(`showModal()`). 전체 화면 재생과 반대다 — 저쪽은 시트
 * 뒤의 재생 바가 살아 있어야 해서 모달이 아니었고, 여기는 뒤에서 할 일이
 * 없다. 그래서 Escape·초점 가두기·뒤 배경을 브라우저가 해 준다.
 *
 * **닫히는 모습을 마저 보여준다.** CSS 는 원래 나가는 전환까지 그리고 있는데
 * (`globals.css` 의 `dialog.pop`), `close` 이벤트가 전환 **시작** 때 오므로
 * 그 자리에서 언마운트하면 한 프레임도 안 보인다. 여기서는 `state.beginClose`
 * 로 "닫히는 중" 을 표시하고, 전환이 끝나면 `state.end` 로 넘긴다 →
 * `usePop` 에 왜 두 값인지가 적혀 있다.
 *
 * 타이머는 **보험이고 취소된다.** `transitionend` 는 전환이 아예 안 걸릴 때
 * 안 온다 — `allow-discrete` 미지원 브라우저, 모션을 끈 설정에서 duration 이
 * 0.001ms 로 눌리는 경우다. 못 받으면 창이 닫힌 채로 DOM 에 남는다.
 * effect 의 정리 함수가 걷어 가므로 다시 열리거나 언마운트되면 발화하지
 * 않는다 — 죽은 인스턴스의 타이머가 살아 있는 창을 끄는 일이 없다.
 */
export function Pop({
  state,
  label,
  labelledBy,
  describedBy,
  width,
  children,
}: {
  state: PopState;
  /** 창 자체의 이름. 제목 요소가 따로 있으면 `labelledBy` 를 쓴다 */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  /** 창 폭. 좁은 화면에서는 좌우 1rem 을 남긴다 */
  width: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { open, beginClose, end } = state;

  // 여닫는 것은 명령형이다 — `<dialog>` 는 속성만으로는 안 열린다.
  //
  // **정리 함수가 닫는다.** 모달 `<dialog>` 는 최상위 레이어에 올라가 있는데,
  // 열린 채로 DOM 에서 뜯겨 나가면 `close` 이벤트가 안 오고 초점도 안
  // 돌아온다. 부모가 `mounted` 와 무관한 이유로 사라지는 길이 실제로 있다 —
  // 확인 창을 띄워 둔 사이에 다른 탭에서 그 리스트를 지우면 `PlaylistDetail`
  // 이 "리스트를 찾을 수 없습니다" 로 갈아탄다.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  useEffect(() => {
    if (open) return;
    const timer = setTimeout(end, 400);
    return () => clearTimeout(timer);
  }, [open, end]);

  return (
    <dialog
      ref={ref}
      onClose={() => {
        beginClose();

        /* **초점이 갈 곳을 잃으면 본문 머리로 보낸다.**
           `<dialog>` 는 닫힐 때 열기 전 요소로 초점을 돌려주는데, 그 요소가
           그사이 사라지는 자리가 있다 — 리스트를 지우면 눌렀던 삭제 버튼도
           같은 커밋에 없어진다. 그러면 초점이 `<body>` 로 떨어지고, 키보드로
           쓰는 사람은 지울 때마다 페이지 맨 위에서 Tab 을 다시 시작한다.

           `tabindex` 를 그 자리에서 붙인다. `<main>` 은 페이지마다 따로
           있어서(라우트별 `page.tsx`) 여섯 군데에 같은 속성을 심느니
           필요한 순간에 한 번 다는 편이 낫다. `-1` 이라 탭 순서에는 안 낀다. */
        if (document.activeElement !== document.body) return;
        const main = document.querySelector("main");
        if (!main) return;
        main.tabIndex = -1;
        main.focus({ preventScroll: true });
      }}
      // 자식의 전환도 여기까지 올라온다(호버가 걸린 줄 하나면 충분하다).
      // 창 자신이 움직인 것만 끝으로 친다
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && !open) end();
      }}
      // 배경을 누르면 닫는다. `<dialog>` 자체가 과녁이면 그건 바깥이다
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className={`pop m-auto ${width} rounded-stadium bg-lifted p-7 shadow-float`}
    >
      {children}
    </dialog>
  );
}
