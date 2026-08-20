import { Plus } from "@phosphor-icons/react/dist/ssr";

/**
 * 직접 만든 목록. **지금은 빈 상태 하나뿐이다.**
 *
 * 버튼을 두지 않았다. 누를 곳을 만들어 놓고 아무 일도 안 일어나면
 * 고장 난 화면이 된다 — 재생 없이 재생 버튼만 두지 않았던 것과 같은 이유다.
 * 담는 동작이 생기는 날 이 자리에 버튼이 들어온다.
 *
 * 빈 상자는 떠 있지 않다. `shadow-float` 는 안에 뭔가 있는 표면에 준다.
 * 점선 테두리가 "여기는 아직 비어 있고, 채울 자리다" 를 말한다.
 */
export function MyPlaylist() {
  return (
    <div className="mt-14 grid place-items-center gap-5 rounded-stadium border-2 border-dashed border-hair px-8 py-20 text-center max-sm:mt-10 max-sm:px-6 max-sm:py-14">
      <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-lifted text-slate">
        <Plus size={20} />
      </span>

      <p className="text-lg font-medium tracking-[-0.01em]">
        새로운 플레이리스트를 추가해보세요!
      </p>
      <p className="max-w-[38ch] text-sm text-slate">
        마음에 든 곡을 모아 두면 여기에 쌓입니다.
      </p>
    </div>
  );
}
