import { DnaSummary } from "@/components/report/DnaSummary";
import { buttonClass } from "@/components/ui/Button";
import type { MusicPreference } from "@/types/music";

/**
 * 저장이 실패했을 때만 보이는 화면이다.
 *
 * 정상 흐름은 검사가 끝나면 홈으로 보낸다 — 결과는 거기 맨 위에 있다.
 * 저장이 안 되면 홈에 가 봐야 아무것도 없으므로, **여기서 붙잡고 보여준다.**
 * 그래서 문구가 "저장할 수 없었습니다" 하나뿐이다.
 */
export function QuizResult({
  preference,
  onRetry,
}: {
  preference: MusicPreference;
  onRetry: () => void;
}) {
  return (
    <DnaSummary
      preference={preference}
      autoFocus
      footer={
        <footer className="mt-20 flex items-center gap-6 border-t border-hair pt-10 max-sm:mt-14 max-sm:flex-col max-sm:items-start max-sm:gap-4">
          <button type="button" onClick={onRetry} className={buttonClass("secondary")}>
            다시 검사하기
          </button>
          <p className="text-sm text-slate">
            이 브라우저에는 결과를 저장할 수 없었습니다. 창을 닫으면 사라집니다.
          </p>
        </footer>
      }
    />
  );
}
