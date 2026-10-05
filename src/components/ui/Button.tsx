import { LoaderCircle } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "./utils.js";

const buttonSizes = {
  md: "min-h-[2.8rem] px-4 py-[0.65rem]",
  sm: "min-h-[2.4rem] px-[0.7rem] py-2 text-[0.8rem]",
  icon: "ui-button--icon size-[2.45rem] p-0",
};

const buttonVariants = {
  primary: "border-accent text-white bg-accent enabled:hover:border-accent-strong enabled:hover:bg-accent-strong",
  secondary: "border-line text-ink bg-white enabled:hover:border-[#9fb0a7] enabled:hover:bg-[#f4f6f2]",
  danger: "border-[#d8aaa6] text-danger bg-danger-surface enabled:hover:border-danger enabled:hover:bg-[#fdecea]",
  ghost: "border-transparent text-accent-strong bg-transparent enabled:hover:bg-[#e9efeb]",
};

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, loading = false, leadingIcon, trailingIcon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx("ui-button border border-solid inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] enabled:active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger", buttonVariants[variant], buttonSizes[size], (fullWidth && "w-full"), className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {loading ? <LoaderCircle className={"animate-[ui-spin_700ms_linear_infinite]"} size={16} aria-hidden="true" /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
