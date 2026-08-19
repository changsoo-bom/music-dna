"use client";

import type { ReactNode } from "react";

import { DnaSummary } from "@/components/report/DnaSummary";
import { ButtonLink } from "@/components/ui/Button";
import { usePreference } from "@/hooks/use-preference";

/**
 * 홈 맨 위. 검사를 했으면 결과, 안 했으면 소개.
 *
 * 소개는 `children` 으로 받는다. 여기서 직접 import 하면 랜딩 마크업이 통째로
 * 클라이언트 번들에 실린다 — **서버에서 그린 것을 그대로 통과시킨다.**
 *
 * 서버는 Local Storage 를 못 보므로 첫 렌더는 항상 소개다. 검사한 사람은
 * 하이드레이션 직후 결과로 바뀐다. 계정을 두지 않기로 한 결정의 대가고,
 * 이걸 없애려면 서버에 세션을 둬야 한다.
 */
export function HomeTop({ children }: { children: ReactNode }) {
  const preference = usePreference();

  if (!preference) return <>{children}</>;

  return (
    <section className="pt-20 max-lg:pt-14 max-sm:pt-10">
      <DnaSummary
        preference={preference}
        footer={
          <footer className="mt-20 flex flex-wrap items-center gap-3 border-t border-hair pt-10 max-sm:mt-14">
            <ButtonLink href="/quiz" variant="secondary">
              Retry
            </ButtonLink>
          </footer>
        }
      />
    </section>
  );
}
