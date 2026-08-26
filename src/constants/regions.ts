import type { Region } from "@/types/music";

/**
 * 전체보기의 첫 번째 탭 줄. **장르와 곱해지는 축이다** → `Region`
 *
 * 순서가 곧 화면 순서다. 국내가 먼저인 것은 **이 서비스가 한국어로 말하기
 * 때문이다** — 처음 여는 사람이 아는 이름을 먼저 만난다. 비율은 근거로
 * 안 적는다. 카탈로그가 배치로 커지는 중이라 어제 맞던 수가 오늘 틀린다.
 *
 * `null` 이 "전체" 다. 목록에 안 넣는다 — 전체는 축의 값이 아니라 **축을
 * 안 쓰는 상태**고, 넣으면 `Region` 타입에 화면 사정이 섞인다.
 */
export const REGIONS: readonly { id: Region; label: string }[] = [
  { id: "kr", label: "국내" },
  { id: "intl", label: "해외" },
];

/** 주소로 들어온 값이 우리가 아는 것인가. 아니면 "전체" 로 떨어진다 */
export function toRegion(raw: string | undefined): Region | null {
  return REGIONS.some((region) => region.id === raw) ? (raw as Region) : null;
}
