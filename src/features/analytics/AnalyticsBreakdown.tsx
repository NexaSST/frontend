import type { Props } from "./types.js";
import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { Select } from "../../components/ui/index.js";
import type { GroupBy } from "./types.js";

type PanelProps = Pick<Props, "domain" | "onGroupByChange"> & { model: Pick<ReturnType<typeof useModuleAnalytics>, "detailedBreakdown" | "groups" | "groupValue" | "maxGroup" | "selectedGroupBy"> };

export function AnalyticsBreakdown({model, domain, onGroupByChange}: PanelProps) {
  const { detailedBreakdown, groups, groupValue, maxGroup, selectedGroupBy } = model;
  return (
<section
        className={
          "module-analytics__breakdown [&_h3]:m-0 [&_h3]:text-[.95rem] [&_p]:m-0 overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel [&_>_header]:flex [&_>_header]:items-start [&_>_header]:justify-between [&_>_header]:gap-4 [&_>_header]:p-[1.15rem_1.25rem] [&_>_header]:border-b [&_>_header]:border-solid [&_>_header]:border-b-line [&_header_p]:mt-1 [&_header_p]:text-muted [&_header_p]:text-[.72rem] [&_header_p]:leading-[1.4] [&_>_div]:grid [&_>_div]:grid-cols-2 [&_article]:grid [&_article]:gap-[.55rem] [&_article]:p-[.9rem_1.15rem] [&_article]:border-t [&_article]:border-solid [&_article]:border-t-line [&_article:nth-child(-n+2)]:border-t-0 [&_article:nth-child(even)]:border-l [&_article:nth-child(even)]:border-solid [&_article:nth-child(even)]:border-l-line [&_article_>_span]:flex [&_article_>_span]:items-baseline [&_article_>_span]:justify-between [&_article_>_span]:gap-3 [&_article_strong]:overflow-hidden [&_article_strong]:text-[.76rem] [&_article_strong]:text-ellipsis [&_article_strong]:whitespace-nowrap [&_article_small]:text-muted [&_article_small]:tabular-nums [&_article_>_i]:h-[.35rem] [&_article_>_i]:overflow-hidden [&_article_>_i]:rounded-[999px] [&_article_>_i]:bg-[#e7ebe7] [&_article_>_i_>_b]:block [&_article_>_i_>_b]:h-full [&_article_>_i_>_b]:rounded-[inherit] [&_article_>_i_>_b]:bg-accent max-[520px]:[&_>_div]:grid-cols-[1fr] max-[520px]:[&_article]:border-t max-[520px]:[&_article]:border-solid max-[520px]:[&_article]:border-t-line max-[520px]:[&_article]:border-l-0 max-[520px]:[&_article:nth-child(even)]:border-t max-[520px]:[&_article:nth-child(even)]:border-solid max-[520px]:[&_article:nth-child(even)]:border-t-line max-[520px]:[&_article:nth-child(even)]:border-l-0 max-[520px]:[&_article:first-child]:border-t-0 max-[520px]:[&_>_header]:items-stretch max-[520px]:[&_>_header]:flex-col max-[520px]:[&_h3]:text-[.875rem] max-[520px]:[&_header_p]:text-[.875rem] max-[520px]:[&_article_strong]:text-[.875rem] max-[520px]:[&_article_small]:text-[.875rem]"
        }
      >
        <header>
          <div>
            <h3>
              {domain === "people"
                ? "Composição por departamento"
                : domain === "inspections"
                  ? "Inventário por categoria"
                  : "Distribuição atual"}
            </h3>
            <p>
              Valores absolutos preservam o tamanho real do universo medido.
            </p>
          </div>
          {(domain === "training" || domain === "apr") && (
            <label
              className={
                "module-analytics__groupby grid min-w-40 gap-[.3rem] text-muted text-[.7rem] font-[760] max-[520px]:min-w-0 max-[520px]:text-[.875rem]"
              }
            >
              <span>Agrupar por</span>
              <Select
                value={selectedGroupBy}
                onChange={(event) =>
                  onGroupByChange?.(event.target.value as GroupBy)
                }
              >
                {domain === "training" ? (
                  <>
                    <option value="course">Curso</option>
                    <option value="department">Departamento</option>
                    <option value="jobFunction">Cargo</option>
                  </>
                ) : (
                  <>
                    <option value="activity">Atividade</option>
                    <option value="status">Status</option>
                  </>
                )}
              </Select>
            </label>
          )}
        </header>
        {detailedBreakdown.isPending &&
        (domain === "training" || domain === "apr") ? (
          <div
            className={
              "module-analytics__pending grid min-h-52 place-items-center p-6 text-muted text-[.84rem] [&.compact]:min-h-32 max-[520px]:text-[.875rem] compact"
            }
            role="status"
          >
            Carregando distribuição…
          </div>
        ) : detailedBreakdown.isError &&
          (domain === "training" || domain === "apr") ? (
          <div
            className={
              "module-analytics__inline-error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface [&_button]:border-0 [&_button]:text-inherit [&_button]:bg-transparent [&_button]:font-[760] [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:cursor-pointer"
            }
          >
            <span>Distribuição indisponível.</span>
            <button onClick={() => void detailedBreakdown.refetch()}>
              Tentar novamente
            </button>
          </div>
        ) : groups.length ? (
          <div>
            {groups.slice(0, 8).map((item) => {
              const value = groupValue(item);
              return (
                <article key={item.id}>
                  <span>
                    <strong>{item.label}</strong>
                    <small>
                      {value.toLocaleString("pt-BR")}
                      {item.compliancePercent !== undefined
                        ? ` · ${item.compliancePercent === null ? "não aplicável" : `${item.compliancePercent.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`}`
                        : ""}
                    </small>
                  </span>
                  <i>
                    <b style={{ width: `${(value / maxGroup) * 100}%` }} />
                  </i>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={
              "module-analytics__empty grid min-h-52 place-content-center p-6 text-muted text-center [&.compact]:min-h-32 [&_strong]:text-ink [&_strong]:text-[.84rem] [&_p]:max-w-[44ch] [&_p]:m-[.35rem_auto_0] [&_p]:text-[.74rem] [&_p]:leading-[1.45] max-[520px]:[&_strong]:text-[.875rem] max-[520px]:[&_p]:text-[.875rem] compact"
            }
          >
            <strong>Sem distribuição disponível</strong>
            <p>Cadastre o universo inicial para visualizar os recortes.</p>
          </div>
        )}
      </section>
  );
}
