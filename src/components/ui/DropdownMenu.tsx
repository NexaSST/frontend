import { ChevronDown } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useFloatingLayer } from "./FloatingLayer.js";
import { cx } from "./utils.js";

const DropdownContext = createContext<(() => void) | null>(null);

export function DropdownMenu({ label, children, align = "end", triggerClassName, triggerAriaLabel, menuClassName }: { label: ReactNode; children: ReactNode; align?: "start" | "end"; triggerClassName?: string; triggerAriaLabel?: string; menuClassName?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const close = useCallback(() => setOpen(false), []);
  const style = useFloatingLayer({ anchorRef: triggerRef, layerRef: menuRef, open, align, minWidth: 192, onClose: close });

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("[role='menuitem']:not(:disabled)")?.focus();
  }, [open]);

  return <span className={"inline-flex"}>
    <button
      ref={triggerRef}
      type="button"
      className={cx("inline-flex items-center gap-[0.35rem] min-h-[2.4rem] p-[0.5rem_0.7rem] border border-solid border-line rounded-control text-ink bg-white font-[inherit] text-[0.8rem] font-[750] cursor-pointer [&:hover]:border-[#9eaaa3] [&:hover]:bg-[#f4f6f2] focus-visible:border-accent focus-visible:[outline:3px_solid_var(--color-control-focus)] [&_svg]:[transition:transform_150ms_ease] [&[aria-expanded='true']_svg]:transform-[rotate(180deg)] motion-reduce:[&_svg]:[transition:none]", triggerClassName)}
      aria-label={triggerAriaLabel}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={() => setOpen((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      }}
    >{label}<ChevronDown size={15} aria-hidden="true" /></button>
    {open && typeof document !== "undefined" && createPortal(
      <DropdownContext.Provider value={close}>
        <div
          ref={menuRef}
          id={menuId}
          className={cx("z-1000 w-max min-w-48 p-[0.35rem] overflow-y-auto border border-solid border-line rounded-control bg-surface shadow-panel animate-[ui-menu-in_120ms_ease-out] motion-reduce:animate-none", `ui-dropdown__menu-- ${align}`, menuClassName)}
          role="menu"
          style={style}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
            event.preventDefault();
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role='menuitem']:not(:disabled)"));
            const current = items.indexOf(document.activeElement as HTMLElement);
            const direction = event.key === "ArrowDown" ? 1 : -1;
            items[(current + direction + items.length) % items.length]?.focus();
          }}
        >{children}</div>
      </DropdownContext.Provider>,
      document.body,
    )}
  </span>;
}

export function DropdownItem({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const close = useContext(DropdownContext);
  const { onClick, ...buttonProps } = props;
  return <button type="button" role="menuitem" className={cx("flex w-full p-[0.55rem_0.65rem] border-0 rounded-lg text-ink bg-transparent text-left cursor-pointer [&:hover]:[outline:none] [&:hover]:bg-[#e9efeb] focus-visible:[outline:none] focus-visible:bg-[#e9efeb] [&.danger]:text-danger", className)} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented) close?.();
  }} {...buttonProps}>{children}</button>;
}
