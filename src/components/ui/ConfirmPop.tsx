"use client";

/**
 * 두 버튼이 나눠 갖는 모양. 필 버튼의 잉크 테두리를 안 쓴다 — 창 안에서
 * 나란히 서는 둘이라 테두리가 있으면 상자 두 개로 읽힌다.
 * 눌리는 순간 제자리로 내려앉는다(`active`) — 호버에서 1px 떠 있던 것이
 * 눌러서 닿는 것처럼 보인다.
 */
const ACTION =
  "h-12 flex-1 rounded-btn text-base font-medium tracking-[-0.02em] transition duration-200 active:translate-y-0 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-lifted focus-visible:outline-none";

/**
 * 되돌릴 수 없는 조작을 한 번 묻는 창.
 *
 * `window.confirm` 을 대신한다. 저쪽은 **브라우저가 그리는 상자라** 이 화면의
 * 서체도 반경도 색도 안 따라오고, 크롬 주소창 밑에 붙는 모양이라 무엇에 대한
 * 물음인지도 잘 안 읽힌다.
 *
 * **진짜 모달이다**(`showModal()`) — 묻는 동안 뒤에서 할 일이 없다. Escape 로
 * 닫는 것, 초점을 가두는 것, 뒤를 덮는 것은 브라우저가 해 준다
 * → `PlaylistPickerPop`
 *
 * **취소가 DOM 의 처음이다.** 열릴 때 초점이 첫 번째 포커스 가능한 요소로
 * 가므로, 열자마자 Enter 를 누르면 지워지는 게 아니라 닫힌다. 되돌릴 수 없는
 * 쪽이 기본값이면 안 된다.
 *
 * 지우는 버튼도 `bg-ink` 다. 빨강을 쓰고 싶어지는 자리지만 이 시스템에서
 * 주황(`--signal`)은 값을 그리는 예약색이고 버튼에 안 쓴다 —
 * 무엇을 지우는지는 글이 말한다 → `.claude/rules/styling.md`
 */
export function ConfirmPop({
  title,
  detail,
  confirmLabel = "삭제",
  onConfirm,
  onClose,
}: {
  title: string;
  detail?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <dialog
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      // 배경을 누르면 닫는다. `<dialog>` 자체가 과녁이면 그건 바깥이다
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
      aria-labelledby="confirm-title"
      className="pop m-auto w-[min(24rem,calc(100vw-2rem))] rounded-stadium bg-lifted p-7 shadow-float"
    >
      <p id="confirm-title" className="text-xl leading-snug tracking-[-0.02em]">
        {title}
      </p>
      {detail && <p className="mt-2.5 text-sm text-slate">{detail}</p>}

      {/* **버튼 둘이 같은 폭이다.** 되돌릴 수 없는 쪽이 더 크면 손이 그리로
          간다. 무게는 색으로만 나뉜다 — 흰 알약은 이 시스템에서 떠 있는
          것이고, 잉크는 결정하는 것이다 */}
      <div className="mt-7 flex gap-2.5">
        <button
          type="button"
          onClick={(event) => event.currentTarget.closest("dialog")?.close()}
          className={`${ACTION} bg-white text-ink shadow-lift hover:-translate-y-px`}
        >
          취소
        </button>
        <button
          type="button"
          onClick={(event) => {
            onConfirm();
            event.currentTarget.closest("dialog")?.close();
          }}
          className={`${ACTION} bg-ink text-canvas hover:-translate-y-px hover:opacity-90`}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
