import type { useModuleAnalytics } from "./useModuleAnalytics.js";
import { AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/index.js";

type PanelProps = { model: Pick<ReturnType<typeof useModuleAnalytics>, "summary" | "metrics"> };

export function AnalyticsMetrics({model}: PanelProps) {
  const { summary, metrics } = model;
  return (
<>{summary.isPending ? (
        <div
          className={
            "module-analytics__skeleton grid grid-cols-4 overflow-hidden border border-solid border-line rounded-panel bg-surface [&_i]:min-h-28 [&_i]:[background:linear-gradient(100deg,#f7f6f0_20%,#ecefe9_45%,#f7f6f0_70%)] [&_i]:bg-size-[220%_100%] [&_i]:animate-[analytics-shimmer_1.2s_ease-in-out_infinite]"
          }
          aria-label="Carregando indicadores"
        >
          <i />
          <i />
          <i />
          <i />
        </div>
      ) : summary.isError ? (
        <div
          className={
            "module-analytics__error flex items-center justify-between gap-4 p-[1rem_1.2rem] text-danger bg-danger-surface border border-solid border-[#e3b8b3] rounded-panel [&_p]:m-[.2rem_0_0] [&_p]:text-[#72514d] [&_p]:text-[.74rem] max-[520px]:[&_p]:text-[.875rem]"
          }
        >
          <AlertTriangle size={20} />
          <div>
            <strong>Não foi possível carregar os indicadores atuais.</strong>
            <p>Verifique a conexão e tente novamente.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void summary.refetch()}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <div
          className={
            "module-analytics__metrics grid grid-cols-4 overflow-hidden border border-solid border-line rounded-panel bg-surface [&_article]:min-w-0 [&_article]:p-[1.15rem_1.25rem] [&_article]:border-l [&_article]:border-solid [&_article]:border-l-line [&_article:first-child]:border-l-0 [&_span]:block [&_span]:text-muted [&_span]:text-[.72rem] [&_small]:block [&_small]:text-muted [&_small]:text-[.72rem] [&_small]:leading-[1.4] [&_strong]:block [&_strong]:m-[.35rem_0_.25rem] [&_strong]:text-ink [&_strong]:text-[1.75rem] [&_strong]:leading-none [&_strong]:tabular-nums [&_strong]:tracking-[-.03em] max-[900px]:grid-cols-2 max-[900px]:[&_article:nth-child(3)]:border-t max-[900px]:[&_article:nth-child(3)]:border-solid max-[900px]:[&_article:nth-child(3)]:border-t-line max-[900px]:[&_article:nth-child(3)]:border-l-0 max-[900px]:[&_article:nth-child(4)]:border-t max-[900px]:[&_article:nth-child(4)]:border-solid max-[900px]:[&_article:nth-child(4)]:border-t-line max-[520px]:grid-cols-[1fr] max-[520px]:[&_article]:border-t max-[520px]:[&_article]:border-solid max-[520px]:[&_article]:border-t-line max-[520px]:[&_article]:border-l-0 max-[520px]:[&_article:first-child]:border-t-0 max-[520px]:[&_span]:text-[.875rem] max-[520px]:[&_small]:text-[.875rem]"
          }
        >
          {metrics.map((metric) => (
            <article key={metric.label}>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </article>
          ))}
        </div>
      )}</>
  );
}
