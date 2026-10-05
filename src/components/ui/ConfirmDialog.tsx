import { useEffect, useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.js';

export function ConfirmDialog({ open, title, description, confirmLabel = 'Arquivar', busy = false, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return <dialog ref={ref} className={"confirm-dialog fixed inset-0 w-[min(28rem,calc(100vw-2rem))] m-auto p-5 border border-solid border-line rounded-panel text-ink bg-surface shadow-[0_1.5rem_4rem_rgb(16_29_25/28%)] backdrop:bg-[rgb(10_20_17/45%)] backdrop:[backdrop-filter:blur(2px)] [[open]]:grid [[open]]:grid-cols-[auto_1fr] [[open]]:gap-[0.9rem] [&_h2]:m-0 [&_p]:m-0 [&_p]:mt-[0.35rem] [&_p]:text-muted [&_p]:leading-normal"} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onCancel(); }} onClose={onCancel}>
    <div className={"confirm-dialog-icon grid place-items-center w-10 h-10 rounded-[50%] text-danger bg-danger-surface"} aria-hidden="true"><AlertTriangle size={22} /></div>
    <div><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div>
    <div className={"confirm-dialog-actions flex col-span-full justify-end gap-[0.6rem] pt-[0.35rem]"}>
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </dialog>;
}
