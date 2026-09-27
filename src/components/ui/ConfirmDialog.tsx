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
  return <dialog ref={ref} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onCancel(); }} onClose={onCancel}>
    <div className="confirm-dialog-icon" aria-hidden="true"><AlertTriangle size={22} /></div>
    <div><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div>
    <div className="confirm-dialog-actions">
      <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
      <Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </dialog>;
}
