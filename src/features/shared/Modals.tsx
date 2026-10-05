import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "../../components/ui/index.js";

export function FormModal({
  title,
  description,
  onClose,
  children,
  className,
  size = "default",
  closeLabel = "Fechar formulário",
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  size?: "default" | "wide" | "catalog";
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`form-modal fixed inset-0 max-w-none max-h-[min(48rem,calc(100dvh-2rem))] m-auto p-0 overflow-hidden border border-solid border-line rounded-panel text-ink bg-surface shadow-[0_1.5rem_4rem_rgb(16_29_25/28%)] backdrop:bg-[rgb(10_20_17/45%)] backdrop:backdrop-blur-[2px] [[open]]:grid [[open]]:grid-rows-[auto_minmax(0,1fr)] [[open]]:animate-[form-modal-in_180ms_cubic-bezier(.2,.8,.2,1)] max-[800px]:max-h-[calc(100dvh-1rem)] motion-reduce:[[open]]:animate-none ${size === "wide" ? "w-[min(62rem,calc(100vw-2rem))] max-[800px]:w-[calc(100vw-1rem)]" : size === "catalog" ? "w-[min(46rem,calc(100vw-2rem))] max-[800px]:w-[min(100vw-1rem,38rem)]" : "w-[min(38rem,calc(100vw-2rem))] max-[800px]:w-[min(100vw-1rem,38rem)]"} ${className ?? ""}`}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header
        className={
          "flex items-start justify-between gap-4 p-[1.15rem_1.25rem] border-b border-solid border-b-line [&_h2]:m-0 [&_h2]:text-[1.2rem] [&_p]:m-0 [&_p]:max-w-[48ch] [&_p]:mt-[0.3rem] [&_p]:text-muted [&_p]:text-[0.85rem] [&_p]:leading-normal"
        }
      >
        <div>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X size={20} />
        </Button>
      </header>
      <div className={"min-h-0 p-5 overflow-y-auto overscroll-contain"}>
        {children}
      </div>
    </dialog>
  );
}

export function WorkflowModal({
  title,
  description,
  focusKey,
  onClose,
  children,
  footer,
}: {
  title: string;
  description: string;
  focusKey?: string | number;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = 0;
    const heading = body.querySelector<HTMLElement>("h3");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [focusKey]);
  return (
    <dialog
      ref={ref}
      className={
        "workflow-modal fixed inset-0 w-[min(70rem,calc(100vw-3rem))] h-[min(52rem,calc(100vh-3rem))] max-w-none max-h-none m-auto p-0 overflow-hidden border-0 rounded-2xl text-ink bg-surface shadow-[0_2rem_6rem_rgb(10_24_20/32%)] backdrop:bg-[rgb(10_22_18/56%)] backdrop:[backdrop-filter:blur(3px)] [[open]]:grid [[open]]:grid-rows-[auto_minmax(0,1fr)_auto] motion-safe:[[open]]:animate-[matrix-modal-in_180ms_cubic-bezier(.2,.8,.2,1)] motion-safe:[&[open]::backdrop]:animate-[matrix-backdrop-in_180ms_ease-out] max-[640px]:w-screen max-[640px]:h-dvh max-[640px]:rounded-none"
      }
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header
        className={
          "workflow-modal__header flex items-start justify-between gap-4 p-[1.15rem_1.4rem] border-b border-solid border-b-line [&_h2]:m-0 [&_h2]:text-[1.2rem] [&_p]:m-[0.3rem_0_0] [&_p]:text-muted [&_p]:text-[0.8rem] [&_p]:leading-[1.45] max-[640px]:px-4 max-[640px]:[&_p]:text-[0.875rem]"
        }
      >
        <div>
          <h2 id={titleId}>{title}</h2>
          <p id={descriptionId}>{description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Fechar editor"
        >
          <X size={20} />
        </Button>
      </header>
      <div
        ref={bodyRef}
        className={
          "workflow-modal__body min-h-0 p-[1.2rem_1.4rem_1.5rem] overflow-y-auto overscroll-contain [&_>_.workflow-stepper]:max-w-156 [&_>_.workflow-stepper]:m-[0_auto_1.5rem] max-[640px]:px-4 max-[640px]:[&_>_.workflow-stepper_small]:block max-[640px]:[&_>_.workflow-stepper_small]:text-[0.875rem]"
        }
      >
        {children}
      </div>
      <footer
        className={
          "workflow-modal__footer flex min-h-18 items-center justify-between gap-3 p-[0.85rem_1.4rem] border-t border-solid border-t-line bg-[#fbfbf7] max-[640px]:items-stretch max-[640px]:flex-col max-[640px]:px-4 max-[640px]:[&_>_.ui-button]:w-full"
        }
      >
        {footer}
      </footer>
    </dialog>
  );
}
