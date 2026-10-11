import type { Props } from "./types.js";
import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { OperationalChart } from "../../components/OperationalChart.js";

type PanelProps = Pick<Props, "domain"> & { model: Pick<ReturnType<typeof useModuleAnalytics>, "history" | "historyItems" | "historyValues" | "missingHistory" | "historyAccessibleLabel"> };

export function AnalyticsHistory({model, domain}: PanelProps) {
  const { history, historyItems, historyValues, missingHistory, historyAccessibleLabel } = model;
  return (
<section
          className={
            "module-analytics__history [&_h3]:m-0 [&_h3]:text-[.95rem] [&_p]:m-0 overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.15rem_1.25rem] [&_>_header]:border-b [&_>_header]:border-solid [&_>_header]:border-b-line [&_header_p]:mt-1 [&_header_p]:text-muted [&_header_p]:text-[.72rem] [&_header_p]:leading-[1.4] [&_>_header_>_span]:text-muted [&_>_header_>_span]:text-[.72rem] [&_>_header_>_span]:tabular-nums [&_>_header_>_span]:whitespace-nowrap max-[520px]:[&_>_header]:items-stretch max-[520px]:[&_>_header]:flex-col max-[520px]:[&_h3]:text-[.875rem] max-[520px]:[&_header_p]:text-[.875rem] max-[520px]:[&_>_header_>_span]:text-[.875rem]"
          }
        >
          <header>
            <div>
              <h3>Evolução histórica</h3>
              <p>
                {domain === "training"
                  ? "Compliance medido em cada snapshot diário."
                  : "Documentos que permaneciam em fluxo em cada data medida."}
              </p>
            </div>
            <span>
              {history.data?.data.availableFrom
                ? `Desde ${new Date(`${history.data.data.availableFrom}T12:00:00`).toLocaleDateString("pt-BR")}`
                : "Histórico iniciado agora"}
            </span>
          </header>
          {history.isPending ? (
            <div
              className={
                "module-analytics__pending grid min-h-52 place-items-center p-6 text-muted text-[.84rem] [&.compact]:min-h-32 max-[520px]:text-[.875rem] compact"
              }
              role="status"
            >
              Carregando histórico…
            </div>
          ) : history.isError ? (
            <div
              className={
                "module-analytics__inline-error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface [&_button]:border-0 [&_button]:text-inherit [&_button]:bg-transparent [&_button]:font-[760] [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:cursor-pointer"
              }
            >
              <span>Histórico indisponível.</span>
              <button onClick={() => void history.refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : historyItems.some((item) => item.available) ? (
            <>
              <OperationalChart
                label={historyAccessibleLabel}
                data={historyItems.map((item, index) => ({
                  label: item.date,
                  value: item.available ? historyValues[index] : null,
                }))}
                series={[
                  {
                    key: "value",
                    label:
                      domain === "training"
                        ? "Compliance (%)"
                        : "Documentos em fluxo",
                    type: "line",
                  },
                ]}
                max={domain === "training" ? 100 : undefined}
              />
              <div
                className={
                  "module-analytics__history-key [&_span]:flex [&_span]:items-center [&_span]:gap-[.35rem] [&_span]:text-muted [&_span]:text-[.68rem] [&_span]:font-[680] [&_i]:w-[.55rem] [&_i]:h-[.55rem] [&_i]:rounded-[.12rem] [&_i]:bg-accent flex flex-wrap gap-[.45rem_1rem] p-[0_1.25rem_1rem] [&_i[data-missing]]:border [&_i[data-missing]]:border-dashed [&_i[data-missing]]:border-line [&_i[data-missing]]:bg-transparent"
                }
              >
                <span>
                  <i />
                  Snapshot medido
                </span>
                {missingHistory.length > 0 && (
                  <span>
                    <i data-missing />
                    Sem snapshot
                  </span>
                )}
              </div>
            </>
          ) : (
            <div
              className={
                "module-analytics__empty grid min-h-52 place-content-center p-6 text-muted text-center [&.compact]:min-h-32 [&_strong]:text-ink [&_strong]:text-[.84rem] [&_p]:max-w-[44ch] [&_p]:m-[.35rem_auto_0] [&_p]:text-[.74rem] [&_p]:leading-[1.45] max-[520px]:[&_strong]:text-[.875rem] max-[520px]:[&_p]:text-[.875rem] compact"
              }
            >
              <strong>O histórico começa com a projeção atual</strong>
              <p>Datas anteriores não são preenchidas com o valor de hoje.</p>
            </div>
          )}
        </section>
  );
}
