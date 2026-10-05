import { useState, type ReactNode } from "react";
import { Badge, Button, FormField, labelForStatus, toneForStatus } from "../../components/ui/index.js";

export function DataTable({
  columns,
  rows,
  keyOf,
  empty = "Cadastre o primeiro registro para começar.",
  renderActions,
}: {
  columns: string[];
  rows: Array<Array<ReactNode>>;
  keyOf: (index: number) => string;
  empty?: string;
  renderActions?: (index: number) => ReactNode;
}) {
  if (!rows.length)
    return (
      <div
        className={
          "empty-panel p-[2.5rem_1rem] text-muted text-center [&_p]:m-[0.35rem_0_0]"
        }
      >
        <strong>Nenhum registro</strong>
        <p>{empty}</p>
      </div>
    );
  return (
    <div
      className={
        "table-scroll w-full overflow-x-auto border border-solid border-line rounded-panel bg-surface"
      }
    >
      <table
        className={
          "data-table w-full border-separate [border-spacing:0] text-[0.84rem] tabular-nums [&_th]:p-[0.78rem_0.85rem] [&_th]:border-b [&_th]:border-solid [&_th]:border-b-line [&_th]:text-muted [&_th]:bg-[color-mix(in_srgb,var(--color-canvas)_72%,white)] [&_th]:text-[0.71rem] [&_th]:font-extrabold [&_th]:tracking-[0.045em] [&_th]:text-left [&_th]:uppercase [&_th]:whitespace-nowrap [&_th:first-child]:rounded-tl-[calc(var(--radius-panel)-1px)] [&_th:last-child]:rounded-tr-[calc(var(--radius-panel)-1px)] [&_td]:h-[3.6rem] [&_td]:p-[0.78rem_0.85rem] [&_td]:border-b [&_td]:border-solid [&_td]:border-b-[color-mix(in_srgb,var(--color-line)_72%,white)] [&_td]:align-middle [&_tbody_tr]:[transition:background-color_120ms_ease] [&_tbody_tr:hover]:bg-[color-mix(in_srgb,var(--color-canvas)_55%,white)] [&_tbody_tr:focus-within]:bg-[color-mix(in_srgb,var(--color-accent-soft)_62%,white)] [&_tbody_tr:focus-within]:shadow-[inset_3px_0_0_var(--color-accent)] [&_tbody_tr:last-child_td]:border-b-0 [&_td_>_span_strong]:block [&_td_>_span_small]:block [&_td_>_span_small]:mt-[0.2rem] [&_td_>_span_small]:text-muted [&_.actions-column]:sticky [&_.actions-column]:right-0 [&_.actions-column]:z-2 [&_.actions-column]:min-w-28 [&_.actions-column]:text-right [&_.actions-column]:whitespace-nowrap [&_.row-actions]:sticky [&_.row-actions]:right-0 [&_.row-actions]:z-1 [&_.row-actions]:min-w-28 [&_.row-actions]:text-right [&_.row-actions]:whitespace-nowrap [&_.row-actions]:bg-surface [&_tbody_tr:hover_.row-actions]:bg-[color-mix(in_srgb,var(--color-canvas)_55%,white)] [&_tbody_tr:focus-within_.row-actions]:bg-[color-mix(in_srgb,var(--color-accent-soft)_62%,white)] max-[520px]:[&_th]:px-3 max-[520px]:[&_th]:text-[0.75rem] max-[520px]:[&_td]:px-3 max-[520px]:[&_td]:text-[0.875rem]"
        }
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
            {renderActions && (
              <th className={"actions-column"} scope="col">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={keyOf(index)}>
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
              {renderActions && (
                <td
                  className={
                    "row-actions flex items-center justify-end gap-[0.35rem]"
                  }
                >
                  {renderActions(index)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QueryState({
  loading,
  error,
  children,
}: {
  loading: boolean;
  error: boolean;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div
        className={
          "table-skeleton grid gap-[0.55rem] p-[0.5rem_0] [&_i]:h-12 [&_i]:rounded-compact [&_i]:bg-[#eceeea]"
        }
        aria-label="Carregando"
      >
        <i />
        <i />
        <i />
        <i />
      </div>
    );
  if (error)
    return (
      <div
        className={
          "error-panel p-[2.5rem_1rem] text-muted text-center [&_p]:m-[0.35rem_0_0]"
        }
      >
        <strong>Não foi possível carregar os dados.</strong>
        <p>Confira sua conexão e tente novamente.</p>
      </div>
    );
  return <>{children}</>;
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <FormField label={label} error={error}>
      {children}
    </FormField>
  );
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={toneForStatus(value)}>{labelForStatus(value)}</Badge>;
}

export function ArchiveButton({
  onConfirm,
  busy,
}: {
  onConfirm: () => void;
  busy?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  if (!armed)
    return (
      <Button
        variant="ghost"
        size="sm"
        className={"danger"}
        onClick={() => setArmed(true)}
      >
        Arquivar
      </Button>
    );
  return (
    <span
      className={"confirm-actions flex items-center justify-end gap-[0.35rem]"}
    >
      <Button variant="ghost" size="sm" onClick={() => setArmed(false)}>
        Cancelar
      </Button>
      <Button variant="danger" size="sm" loading={busy} onClick={onConfirm}>
        Confirmar
      </Button>
    </span>
  );
}
