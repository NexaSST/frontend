import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { durationLabel } from "./format.js";

type PanelProps = { model: Pick<ReturnType<typeof useModuleAnalytics>, "cycle"> };

export function AnalyticsCycles({model}: PanelProps) {
  const { cycle } = model;
  return (
<section
          className={
            "module-analytics__cycles overflow-hidden border border-solid border-line rounded-panel bg-surface shadow-panel grid grid-cols-2 [&_article]:p-[1.1rem_1.25rem] [&_article+article]:border-l [&_article+article]:border-solid [&_article+article]:border-l-line [&_article_span]:block [&_article_span]:text-muted [&_article_span]:text-[.72rem] [&_article_small]:block [&_article_small]:text-muted [&_article_small]:text-[.72rem] [&_article_strong]:block [&_article_strong]:m-[.35rem_0_.25rem] [&_article_strong]:text-ink [&_article_strong]:text-[1.5rem] [&_article_strong]:tabular-nums max-[520px]:grid-cols-[1fr] max-[520px]:[&_article+article]:border-t max-[520px]:[&_article+article]:border-solid max-[520px]:[&_article+article]:border-t-line max-[520px]:[&_article+article]:border-l-0 max-[520px]:[&_article_span]:text-[.875rem] max-[520px]:[&_article_small]:text-[.875rem]"
          }
          aria-label="Tempos medianos de ciclo"
        >
          {cycle.isPending ? (
            <div
              className={
                "module-analytics__pending grid min-h-52 place-items-center p-6 text-muted text-[.84rem] [&.compact]:min-h-32 max-[520px]:text-[.875rem] compact"
              }
              role="status"
            >
              Calculando ciclos…
            </div>
          ) : cycle.isError ? (
            <div
              className={
                "module-analytics__inline-error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface [&_button]:border-0 [&_button]:text-inherit [&_button]:bg-transparent [&_button]:font-[760] [&_button]:underline [&_button]:underline-offset-[3px] [&_button]:cursor-pointer"
              }
            >
              <span>Ciclos indisponíveis.</span>
              <button onClick={() => void cycle.refetch()}>
                Tentar novamente
              </button>
            </div>
          ) : (
            cycle.data && (
              <>
                <article>
                  <span>Finalização da APR</span>
                  <strong>
                    {durationLabel(cycle.data.data.aprFinalization.medianHours)}
                  </strong>
                  <small>
                    Criação → primeira revisão finalizada ·{" "}
                    {cycle.data.data.aprFinalization.sampleSize} na amostra
                  </small>
                </article>
                <article>
                  <span>Autorização da PT</span>
                  <strong>
                    {durationLabel(
                      cycle.data.data.workPermitAuthorization.medianHours,
                    )}
                  </strong>
                  <small>
                    Criação → autorização ·{" "}
                    {cycle.data.data.workPermitAuthorization.sampleSize} na
                    amostra
                  </small>
                </article>
              </>
            )
          )}
        </section>
  );
}
