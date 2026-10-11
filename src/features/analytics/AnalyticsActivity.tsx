import type { Props } from "./types.js";
import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { CalendarRange } from "lucide-react";
import { OperationalChart } from "../../components/OperationalChart.js";
import { seriesLegend } from "./format.js";

type PanelProps = Pick<Props, "domain" | "periodDays"> & { model: Pick<ReturnType<typeof useModuleAnalytics>, "series" | "points" | "seriesAccessibleLabel"> };

export function AnalyticsActivity({model, domain, periodDays = 30}: PanelProps) {
  const { series, points, seriesAccessibleLabel } = model;
  return (
<section
          className={
            "module-analytics__activity [&_h3]:m-0 [&_h3]:text-[.95rem] [&_p]:m-0 overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.15rem_1.25rem] [&_>_header]:border-b [&_>_header]:border-solid [&_>_header]:border-b-line [&_header_p]:mt-1 [&_header_p]:text-muted [&_header_p]:text-[.72rem] [&_header_p]:leading-[1.4] [&_header_>_span]:flex [&_header_>_span]:items-center [&_header_>_span]:gap-[.35rem] [&_header_>_span]:whitespace-nowrap [&_header_>_span]:text-muted [&_header_>_span]:text-[.72rem] [&_header_>_span]:font-[720] max-[520px]:[&_h3]:text-[.875rem] max-[520px]:[&_header_p]:text-[.875rem] max-[520px]:[&_header_>_span]:text-[.875rem]"
          }
        >
          <header>
            <div>
              <h3>Atividade no período</h3>
              <p>
                Fatos registrados; não altera a leitura do estado atual acima.
              </p>
              <div
                className={
                  "module-analytics__legend flex flex-wrap gap-[.35rem_.85rem] mt-[.65rem] [&_span]:flex [&_span]:items-center [&_span]:gap-[.35rem] [&_span]:text-muted [&_span]:text-[.68rem] [&_span]:font-[680] [&_i]:w-[.55rem] [&_i]:h-[.55rem] [&_i]:rounded-[.12rem] [&_i]:bg-accent [&_b]:w-[.55rem] [&_b]:h-[.55rem] [&_b]:rounded-[.12rem] [&_b]:bg-[#b56a32]"
                }
              >
                <span>
                  <i />
                  {seriesLegend[domain][0]}
                </span>
                {seriesLegend[domain][1] && (
                  <span>
                    <b />
                    {seriesLegend[domain][1]}
                  </span>
                )}
              </div>
            </div>
            <span>
              <CalendarRange size={15} /> {periodDays} dias
            </span>
          </header>
          {series.isPending ? (
            <div
              className={
                "module-analytics__pending grid min-h-52 place-items-center p-6 text-muted text-[.84rem] [&.compact]:min-h-32 max-[520px]:text-[.875rem]"
              }
              role="status"
            >
              Carregando atividade…
            </div>
          ) : series.isError ? (
            <div
              className={
                "module-analytics__inline-error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface [&_button]:border-0 [&_button]:text-inherit [&_button]:bg-transparent [&_button]:font-[760] [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:cursor-pointer"
              }
            >
              <span>Série indisponível.</span>
              <button onClick={() => void series.refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : points.some((point) => point.primary || point.secondary) ? (
            <OperationalChart
              label={seriesAccessibleLabel}
              data={points.map((point) => ({
                label: point.label,
                primary: point.primary,
                secondary: point.secondary,
              }))}
              series={[
                { key: "primary", label: seriesLegend[domain][0] },
                ...(seriesLegend[domain][1]
                  ? [{ key: "secondary", label: seriesLegend[domain][1] }]
                  : []),
              ]}
            />
          ) : (
            <div
              className={
                "module-analytics__empty grid min-h-52 place-content-center p-6 text-muted text-center [&.compact]:min-h-32 [&_strong]:text-ink [&_strong]:text-[.84rem] [&_p]:max-w-[44ch] [&_p]:m-[.35rem_auto_0] [&_p]:text-[.74rem] [&_p]:leading-[1.45] max-[520px]:[&_strong]:text-[.875rem] max-[520px]:[&_p]:text-[.875rem]"
              }
            >
              <strong>Sem atividade no período</strong>
              <p>
                O estado atual continua disponível; nenhum fato foi registrado
                neste intervalo.
              </p>
            </div>
          )}
        </section>
  );
}
