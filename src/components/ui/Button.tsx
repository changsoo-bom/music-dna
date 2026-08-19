import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "text";

const PILL_BASE =
  "inline-flex items-center justify-center h-12 px-6 text-base font-medium tracking-[-0.02em] whitespace-nowrap rounded-btn border-[1.5px] border-ink transition-opacity active:translate-y-px disabled:pointer-events-none disabled:opacity-30";

/**
 * 테두리도 배경도 없는 텍스트 버튼.
 *
 * **주 행동이 아닐 때 쓴다.** 필 버튼과 같은 무게로 놓으면 무엇을 먼저
 * 해야 하는지가 사라진다. 결과 화면의 "다시 검사하기" 처럼 있긴 있어야 하지만
 * 처음 누를 것은 아닌 자리다.
 *
 * 필 버튼의 h-12·px-6·테두리를 물려받지 않으므로 base 를 따로 둔다.
 */
const TEXT_BASE =
  "group inline-flex items-center gap-2 text-base font-medium tracking-[-0.02em] whitespace-nowrap text-ink transition-opacity hover:opacity-55 disabled:pointer-events-none disabled:opacity-30";

const VARIANTS: Record<Variant, string> = {
  // 주 CTA 는 예외 없이 잉크 블랙. --signal 은 예약색이라 여기 쓰지 않는다.
  primary: "bg-ink text-canvas hover:opacity-90",
  secondary: "bg-white text-ink font-[450] hover:bg-canvas",
  text: "",
};

export function buttonClass(variant: Variant = "primary") {
  if (variant === "text") return TEXT_BASE;
  return `${PILL_BASE} ${VARIANTS[variant]}`;
}

/**
 * 텍스트 버튼의 화살표. 호버에서 진행 방향으로 살짝 민다.
 *
 * `transform` 만 움직인다 — `margin` 이나 `gap` 을 건드리면 옆 글자가 밀린다.
 * 프로토타입은 외부 링크에 `↗`, 화면 안에서 움직이는 것에 `→` 를 쓴다.
 */
export function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <Link className={`${buttonClass(variant)} ${className}`} {...props} />;
}
