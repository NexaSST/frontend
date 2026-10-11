import type { Props } from "./types.js";
import { useModuleAnalytics } from "./useModuleAnalytics.js";
import { AnalyticsHeader } from "./AnalyticsHeader.js";
import { AnalyticsMetrics } from "./AnalyticsMetrics.js";
import { AnalyticsActivity } from "./AnalyticsActivity.js";
import { AnalyticsAttention } from "./AnalyticsAttention.js";
import { AnalyticsHistory } from "./AnalyticsHistory.js";
import { AnalyticsCycles } from "./AnalyticsCycles.js";
import { AnalyticsBreakdown } from "./AnalyticsBreakdown.js";

export function ModuleAnalytics({
  scope,
  domain,
  periodDays = 30,
  groupBy,
  onPeriodChange,
  onGroupByChange,
  onOpenAttention,
}: Props) {
  const model = useModuleAnalytics({ scope, domain, periodDays, groupBy });
  const { summary } = model;
  return (
    <section
      className={
        "module-analytics grid gap-4 [&_>_footer]:text-muted [&_>_footer]:text-[.68rem] [&_>_footer]:text-right [&_>_footer]:tabular-nums max-[520px]:[&_>_footer]:text-[.875rem]"
      }
      aria-labelledby={`${domain}-analytics-title`}
    >
      <AnalyticsHeader model={model} domain={domain} periodDays={periodDays} onPeriodChange={onPeriodChange} />
      <AnalyticsMetrics model={model} />
      <div
        className={
          "module-analytics__primary grid grid-cols-[minmax(0,1.7fr)_minmax(18rem,.8fr)] gap-4 items-stretch max-[900px]:grid-cols-[1fr] max-[520px]:flex max-[520px]:flex-col"
        }
      >
        <AnalyticsActivity model={model} domain={domain} periodDays={periodDays} />
        <AnalyticsAttention model={model} onOpenAttention={onOpenAttention} />
      </div>
      {(domain === "training" || domain === "apr") && (
        <AnalyticsHistory model={model} domain={domain} />
      )}
      {domain === "apr" && (
        <AnalyticsCycles model={model} />
      )}
      <AnalyticsBreakdown model={model} domain={domain} onGroupByChange={onGroupByChange} />
      {summary.data && (
        <footer>
          Data de referência:{" "}
          {new Date(`${summary.data.asOf}T12:00:00`).toLocaleDateString(
            "pt-BR",
          )}{" "}
          · Atualizado em{" "}
          {new Date(summary.data.generatedAt).toLocaleString("pt-BR")}
        </footer>
      )}
    </section>
  );
}
