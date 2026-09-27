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

  return <span className="ui-dropdown">
    <button
      ref={triggerRef}
      type="button"
      className={cx("ui-dropdown__trigger", triggerClassName)}
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
          className={cx("ui-dropdown__menu", `ui-dropdown__menu--${align}`, menuClassName)}
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
  return <button type="button" role="menuitem" className={cx("ui-dropdown__item", className)} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented) close?.();
  }} {...buttonProps}>{children}</button>;
}
