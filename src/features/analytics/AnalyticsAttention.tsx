import type { Props } from "./types.js";
import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { ArrowRight } from "lucide-react";

type PanelProps = Pick<Props, "onOpenAttention"> & { model: Pick<ReturnType<typeof useModuleAnalytics>, "attention"> };

export function AnalyticsAttention({model, onOpenAttention}: PanelProps) {
  const { attention } = model;
  return (
<aside
          className={
            "module-analytics__attention [&_h3]:m-0 [&_h3]:text-[.95rem] [&_p]:m-0 overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.15rem_1.25rem] [&_>_header]:border-b [&_>_header]:border-solid [&_>_header]:border-b-line [&_header_p]:mt-1 [&_header_p]:text-muted [&_header_p]:text-[.72rem] [&_header_p]:leading-[1.4] [&_header_>_span]:grid [&_header_>_span]:place-items-center [&_header_>_span]:min-w-8 [&_header_>_span]:h-8 [&_header_>_span]:rounded-[999px] [&_header_>_span]:text-accent-strong [&_header_>_span]:bg-accent-soft [&_header_>_span]:text-[.78rem] [&_header_>_span]:font-[820] [&_header_>_span]:tabular-nums [&_>_div]:grid [&_button]:flex [&_button]:w-full [&_button]:min-h-[4.2rem] [&_button]:items-center [&_button]:justify-between [&_button]:gap-3 [&_button]:p-[.85rem_1rem] [&_button]:border-0 [&_button]:border-t [&_button]:border-solid [&_button]:border-t-line [&_button]:text-inherit [&_button]:bg-transparent [&_button]:text-left [&_button:first-child]:border-t-0 [&_button:not(:disabled)]:cursor-pointer [&_button:not(:disabled):hover]:bg-[#f1f5f2] [&_button:focus-visible]:relative [&_button:focus-visible]:z-1 [&_button:focus-visible]:[outline:3px_solid_var(--color-control-focus)] [&_button:focus-visible]:outline-offset-[-3px] [&_button_strong]:block [&_button_strong]:text-[.8rem] [&_button_small]:block [&_button_small]:mt-[.2rem] [&_button_small]:text-muted [&_button_small]:text-[.7rem] [&_button_small]:leading-[1.4] [&_button[data-severity='danger']_strong]:text-danger max-[520px]:-order-1 max-[520px]:[&_h3]:text-[.875rem] max-[520px]:[&_header_p]:text-[.875rem] max-[520px]:[&_button_strong]:text-[.875rem] max-[520px]:[&_button_small]:text-[.875rem]"
          }
        >
          <header>
            <div>
              <h3>Pontos de atenção</h3>
              <p>Ordenados por impedimento, atraso e incompletude.</p>
            </div>
            <span
              aria-label={
                attention.isPending
                  ? "Quantidade em carregamento"
                  : `${attention.data?.total ?? 0} pontos de atenção`
              }
            >
              {attention.isPending ? "—" : (attention.data?.total ?? 0)}
            </span>
          </header>
          {attention.isPending ? (
            <div
              className={
                "module-analytics__pending grid min-h-52 place-items-center p-6 text-muted text-[.84rem] [&.compact]:min-h-32 max-[520px]:text-[.875rem] compact"
              }
              role="status"
            >
              Carregando pontos de atenção…
            </div>
          ) : attention.isError ? (
            <div
              className={
                "module-analytics__inline-error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface [&_button]:border-0 [&_button]:text-inherit [&_button]:bg-transparent [&_button]:font-[760] [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:cursor-pointer"
              }
            >
              <span>Lista indisponível.</span>
              <button onClick={() => void attention.refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : attention.data?.items.length ? (
            <div>
              {attention.data.items.map((item) => (
                <button
                  type="button"
                  key={`${item.kind}:${item.entityId}`}
                  data-severity={item.severity}
                  onClick={() => onOpenAttention?.(item)}
                  disabled={!onOpenAttention}
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  {onOpenAttention && <ArrowRight size={15} />}
                </button>
              ))}
            </div>
          ) : (
            <div
              className={
                "module-analytics__empty grid min-h-52 place-content-center p-6 text-muted text-center [&.compact]:min-h-32 [&_strong]:text-ink [&_strong]:text-[.84rem] [&_p]:max-w-[44ch] [&_p]:m-[.35rem_auto_0] [&_p]:text-[.74rem] [&_p]:leading-[1.45] max-[520px]:[&_strong]:text-[.875rem] max-[520px]:[&_p]:text-[.875rem] compact"
              }
            >
              <strong>Nenhuma atenção atual</strong>
              <p>Os dados medidos não apontam impedimentos.</p>
            </div>
          )}
        </aside>
  );
}
