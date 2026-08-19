import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary";

const BASE =
  "inline-flex items-center justify-center h-12 px-6 text-base font-medium tracking-[-0.02em] whitespace-nowrap rounded-btn border-[1.5px] border-ink transition-opacity active:translate-y-px disabled:pointer-events-none disabled:opacity-30";

const VARIANTS: Record<Variant, string> = {
  // 주 CTA 는 예외 없이 잉크 블랙. --signal 은 예약색이라 여기 쓰지 않는다.
  primary: "bg-ink text-canvas hover:opacity-90",
  secondary: "bg-white text-ink font-[450] hover:bg-canvas",
};

export function buttonClass(variant: Variant = "primary") {
  return `${BASE} ${VARIANTS[variant]}`;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant };

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <Link className={`${buttonClass(variant)} ${className}`} {...props} />;
}
