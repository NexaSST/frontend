import { ChevronDown } from "lucide-react";
import { Children, createContext, forwardRef, isValidElement, useCallback, useContext, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { useFloatingLayer } from "./FloatingLayer.js";
import { cx } from "./utils.js";

const FieldLabelContext = createContext<string | undefined>(undefined);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> { invalid?: boolean }
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return <input ref={ref} className={cx("ui-control w-full min-h-11 p-[0.65rem_0.75rem] border border-solid border-control-border rounded-control text-ink bg-white font-[inherit] placeholder:text-[#68766f] [&:hover:not(:disabled)]:border-[#9eaaa3] focus:border-accent focus:[outline:3px_solid_var(--color-control-focus)] focus:outline-offset-0 aria-invalid:border-danger disabled:cursor-not-allowed disabled:text-[#748079] disabled:bg-[#eef0ec]", className)} aria-invalid={invalid || undefined} {...props} />;
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { invalid?: boolean; menuClassName?: string }
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, menuClassName, invalid, children, value, defaultValue, disabled, onChange, onBlur, "aria-label": ariaLabel, ...props }, forwardedRef) {
  const fieldLabel = useContext(FieldLabelContext);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const options = useMemo(() => {
    const flattened: Array<{ value: string; label: string; disabled: boolean }> = [];
    const visit = (nodes: ReactNode) => Children.forEach(nodes, (child) => {
      if (!isValidElement<{ value?: string | number; disabled?: boolean; children?: ReactNode }>(child)) return;
      if (child.type === "option") {
        flattened.push({
          value: String(child.props.value ?? child.props.children ?? ""),
          label: Children.toArray(child.props.children).join(""),
          disabled: Boolean(child.props.disabled),
        });
        return;
      }
      if (child.props.children) visit(child.props.children);
    });
    visit(children);
    return flattened;
  }, [children]);
  const initialValue = String(Array.isArray(defaultValue) ? defaultValue[0] ?? "" : defaultValue ?? options.find((option) => !option.disabled)?.value ?? "");
  const [internalValue, setInternalValue] = useState(initialValue);
  const controlledValue = Array.isArray(value) ? value[0] : value;
  const selectedValue = controlledValue === undefined ? internalValue : String(controlledValue);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const close = useCallback(() => setOpen(false), []);
  const style = useFloatingLayer({ anchorRef: triggerRef, layerRef: menuRef, open, minWidth: 180, onClose: close });

  const setNativeRef = useCallback((node: HTMLSelectElement | null) => {
    nativeRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  }, [forwardedRef]);

  useLayoutEffect(() => {
    if (controlledValue === undefined && nativeRef.current) setInternalValue(nativeRef.current.value);
  }, [controlledValue, options]);

  useEffect(() => {
    if (!open) return;
    const selected = menuRef.current?.querySelector<HTMLElement>("[role='option'][aria-selected='true']:not(:disabled)");
    const first = menuRef.current?.querySelector<HTMLElement>("[role='option']:not(:disabled)");
    (selected ?? first)?.focus();
  }, [open]);

  const selectValue = (nextValue: string) => {
    const native = nativeRef.current;
    if (!native) return;
    setInternalValue(nextValue);
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")?.set;
    valueSetter?.call(native, nextValue);
    native.dispatchEvent(new Event("change", { bubbles: true }));
    close();
    triggerRef.current?.focus();
  };

  return <span className={"block w-full min-w-0"}>
    <select
      ref={setNativeRef}
      className={"absolute w-px h-px p-0 -m-px overflow-hidden [clip:rect(0_0_0_0)] whitespace-nowrap border-0"}
      value={selectedValue}
      disabled={disabled}
      tabIndex={-1}
      aria-hidden="true"
      onChange={(event) => {
        setInternalValue(event.target.value);
        onChange?.(event);
      }}
      onBlur={onBlur}
      {...props}
    >{children}</select>
    <button
      ref={triggerRef}
      type="button"
      className={cx("ui-control w-full min-h-11 p-[0.65rem_0.75rem] border border-solid border-control-border rounded-control text-ink bg-white font-[inherit] placeholder:text-[#68766f] [&:hover:not(:disabled)]:border-[#9eaaa3] focus:border-accent focus:[outline:3px_solid_var(--color-control-focus)] focus:outline-offset-0 aria-invalid:border-danger disabled:cursor-not-allowed disabled:text-[#748079] disabled:bg-[#eef0ec]", "ui-select__trigger flex items-center justify-between gap-3 text-left cursor-pointer [&_>_span]:min-w-0 [&_>_span]:overflow-hidden [&_>_span]:text-ellipsis [&_>_span]:whitespace-nowrap [&_svg]:flex-[0_0_auto] [&_svg]:[transition:transform_150ms_ease] [&[aria-expanded='true']_svg]:transform-[rotate(180deg)] motion-reduce:[&_svg]:[transition:none]", className)}
      role="combobox"
      aria-label={ariaLabel ?? fieldLabel ?? props.name ?? "Selecionar opção"}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listboxId : undefined}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      onClick={() => {
        if (nativeRef.current && controlledValue === undefined) setInternalValue(nativeRef.current.value);
        setOpen((current) => !current);
      }}
      onBlur={() => {
        if (!open && nativeRef.current) nativeRef.current.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setOpen(true);
        }
      }}
    ><span>{selectedOption?.label || "Selecione"}</span><ChevronDown size={17} aria-hidden="true" /></button>
    {open && typeof document !== "undefined" && createPortal(
      <div
        ref={menuRef}
        id={listboxId}
        className={cx("z-1000 w-max p-[0.35rem] overflow-y-auto border border-solid border-line rounded-control bg-surface shadow-panel animate-[ui-menu-in_120ms_ease-out] motion-reduce:animate-none", menuClassName)}
        role="listbox"
        aria-label={ariaLabel ?? fieldLabel ?? props.name ?? "Opções"}
        style={style}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
          event.preventDefault();
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[role='option']:not(:disabled)"));
          if (!items.length) return;
          if (event.key === "Home") return items[0]?.focus();
          if (event.key === "End") return items.at(-1)?.focus();
          const current = items.indexOf(document.activeElement as HTMLElement);
          const direction = event.key === "ArrowDown" ? 1 : -1;
          items[(current + direction + items.length) % items.length]?.focus();
        }}
      >{options.map((option) => <button
        key={option.value}
        type="button"
        role="option"
        className={"ui-select__option flex w-full min-h-[2.4rem] items-center p-[0.55rem_0.65rem] border-0 rounded-lg text-ink bg-transparent font-[inherit] text-[0.84rem] text-left cursor-pointer [&:hover]:[outline:none] [&:hover]:bg-[#e9efeb] focus-visible:[outline:none] focus-visible:bg-[#e9efeb] aria-selected:text-accent-strong aria-selected:bg-[#e3eee8] aria-selected:font-[750] disabled:cursor-not-allowed disabled:opacity-50"}
        aria-selected={option.value === selectedValue}
        disabled={option.disabled}
        onClick={() => selectValue(option.value)}
      >{option.label}</button>)}</div>,
      triggerRef.current?.closest("dialog") ?? document.body,
    )}
  </span>;
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean }
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, ...props }, ref) {
  return <textarea ref={ref} className={cx("ui-control w-full min-h-11 p-[0.65rem_0.75rem] border border-solid border-control-border rounded-control text-ink bg-white font-[inherit] placeholder:text-[#68766f] [&:hover:not(:disabled)]:border-[#9eaaa3] focus:border-accent focus:[outline:3px_solid_var(--color-control-focus)] focus:outline-offset-0 aria-invalid:border-danger disabled:cursor-not-allowed disabled:text-[#748079] disabled:bg-[#eef0ec]", "min-h-22 resize-y", className)} aria-invalid={invalid || undefined} {...props} />;
});

export const Checkbox = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "type">>(function Checkbox({ className, ...props }, ref) {
  return <input ref={ref} type="checkbox" className={cx("flex-[0_0_1.125rem] w-4.5 h-4.5 min-h-0 p-0 m-0 rounded-[.25rem] accent-accent focus-visible:[outline:3px_solid_var(--color-control-focus)] focus-visible:outline-offset-2", className)} {...props} />;
});

export function FormField({ label, error, hint, required, htmlFor, children }: { label: string; error?: string; hint?: string; required?: boolean; htmlFor?: string; children: ReactNode }) {
  return <FieldLabelContext.Provider value={label}><label className={"ui-field grid gap-[0.4rem] text-muted text-[0.78rem] font-[750]"} {...(htmlFor ? { htmlFor } : {})}><span>{label}{required && <span aria-hidden="true"> *</span>}</span>{children}{error ? <small className={"text-danger"}>{error}</small> : hint ? <small className={"text-muted font-medium"}>{hint}</small> : null}</label></FieldLabelContext.Provider>;
}

export function CheckboxField({ label, description, children }: { label: string; description?: string; children: ReactNode }) {
  return <label className={"ui-checkbox-field flex items-center justify-between gap-3 w-full min-h-10 text-ink cursor-pointer [&_>_span]:block [&_>_span]:flex-1 [&_>_span]:min-w-0 [&_small]:block [&_small]:mt-[0.2rem] [&_small]:text-muted [&_small]:text-[0.76rem] [&_small]:font-medium"}><span><strong>{label}</strong>{description && <small>{description}</small>}</span>{children}</label>;
}
