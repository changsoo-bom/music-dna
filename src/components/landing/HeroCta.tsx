"use client";

import { ButtonLink } from "@/components/ui/Button";
import { useStoredValue } from "@/hooks/use-stored-value";
import { STORAGE_KEYS } from "@/lib/storage-keys";

/**
 * 최초 진입 분기. Local Storage 에 성향 검사 결과가 있으면 바로 이어서 보고,
 * 없으면 검사부터 시작한다.
 *
 * 이 컴포넌트만 클라이언트다 — Local Storage 를 읽어야 하는 말단이라서.
 * 히어로 카피와 시각화는 서버에서 그대로 그린다.
 */
export function HeroCta() {
  const savedPreference = useStoredValue(STORAGE_KEYS.preference);

  if (savedPreference) {
    return (
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/dashboard">Continue My Music DNA</ButtonLink>
        <ButtonLink href="/quiz" variant="secondary">
          다시 검사하기
        </ButtonLink>
      </div>
    );
  }

  return <ButtonLink href="/quiz">Discover My Music DNA</ButtonLink>;
}
