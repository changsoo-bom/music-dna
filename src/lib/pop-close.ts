/**
 * `<dialog class="pop">` 이 닫히는 동안 살려 둔다.
 *
 * `close` 이벤트는 전환이 **시작되자마자** 온다. 그 자리에서 부모가 곧바로
 * 언마운트하면 노드가 사라져서 닫히는 애니메이션이 한 프레임도 안 보인다 —
 * 열 때는 부드럽고 닫을 때만 툭 사라지던 이유가 이것이다. CSS 는 이미
 * 양쪽을 다 그리고 있었다(`globals.css` 의 `dialog.pop`).
 *
 * 전환이 끝나면 그때 언마운트한다.
 *
 * **타이머로 한 번 더 받친다.** `transitionend` 는 전환이 아예 안 걸릴 때
 * 안 온다 — `allow-discrete` 미지원 브라우저, 그리고 모션을 끈 설정에서
 * duration 이 0.001ms 로 눌리는 경우다. 못 받으면 창이 닫힌 채로 화면에
 * 남는다. 늦게라도 반드시 끝나는 쪽이 맞다.
 */
export function closeAfterPop(dialog: HTMLDialogElement, done: () => void) {
  let finished = false;

  const finish = (event?: TransitionEvent) => {
    // 자식의 전환도 여기까지 올라온다(호버가 걸린 줄 하나면 충분하다).
    // 창 자신이 움직인 것만 끝으로 친다
    if (event && event.target !== dialog) return;
    if (finished) return;
    finished = true;

    clearTimeout(timer);
    dialog.removeEventListener("transitionend", finish);
    done();
  };

  const timer = setTimeout(finish, 400);
  dialog.addEventListener("transitionend", finish);
}
