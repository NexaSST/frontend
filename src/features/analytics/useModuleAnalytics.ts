import { useQuery } from "@tanstack/react-query";
import { apiJson } from "../../lib/api.js";
import { metricRows, seriesValues, summaryBreakdown, seriesLegend } from "./format.js";
import type { AttentionPage, BreakdownEnvelope, BreakdownItem, CycleEnvelope, Envelope, GroupBy, HistoryEnvelope, Props } from "./types.js";

export function useModuleAnalytics({scope, domain, periodDays = 30, groupBy}: Pick<Props, "scope" | "domain" | "periodDays" | "groupBy">) {
  const root = `v1/companies/${scope.companyId}/branches/${scope.branchId}/analytics/${domain}`;
  const selectedGroupBy: GroupBy =
    domain === "training"
      ? ["course", "department", "jobFunction"].includes(String(groupBy))
        ? (groupBy as GroupBy)
        : "course"
      : domain === "apr"
        ? ["activity", "status"].includes(String(groupBy))
          ? (groupBy as GroupBy)
          : "activity"
        : "department";
  const summary = useQuery({
    queryKey: ["module-analytics", domain, "summary", scope],
    queryFn: () => apiJson<Envelope<unknown>>(`${root}/summary`),
    staleTime: 60_000,
  });
  const series = useQuery({
    queryKey: ["module-analytics", domain, "series", scope, periodDays],
    queryFn: () =>
      apiJson<Envelope<{ items: Array<Record<string, unknown>> }>>(
        `${root}/series`,
        { searchParams: { days: periodDays } },
      ),
    staleTime: 60_000,
  });
  const attention = useQuery({
    queryKey: ["module-analytics", domain, "attention", scope, periodDays],
    queryFn: () =>
      apiJson<AttentionPage>(`${root}/attention`, {
        searchParams: { days: periodDays, page: 1, pageSize: 5 },
      }),
    staleTime: 60_000,
  });
  const detailedBreakdown = useQuery({
    queryKey: ["module-analytics", domain, "breakdown", scope, selectedGroupBy],
    queryFn: () =>
      apiJson<BreakdownEnvelope>(`${root}/breakdown`, {
        searchParams: { groupBy: selectedGroupBy },
      }),
    enabled: domain === "training" || domain === "apr",
    staleTime: 60_000,
  });
  const history = useQuery({
    queryKey: ["module-analytics", domain, "history", scope, periodDays],
    queryFn: () =>
      apiJson<HistoryEnvelope>(`${root}/history`, {
        searchParams: { days: periodDays },
      }),
    enabled: domain === "training" || domain === "apr",
    staleTime: 60_000,
  });
  const cycle = useQuery({
    queryKey: ["module-analytics", domain, "cycle", scope, periodDays],
    queryFn: () =>
      apiJson<CycleEnvelope>(`${root}/cycle`, {
        searchParams: { days: periodDays },
      }),
    enabled: domain === "apr",
    staleTime: 60_000,
  });
  const metrics = metricRows(domain, summary.data?.data);
  const points = seriesValues(domain, series.data?.data);
  const groups =
    detailedBreakdown.data?.data.items ??
    summaryBreakdown(domain, summary.data?.data);
  const historyItems = history.data?.data.items ?? [];
  const historyValues = historyItems.map((item) =>
    domain === "training"
      ? (item.compliancePercent ?? null)
      : item.available
        ? Number(item.draftAprs ?? 0) +
          Number(item.draftWorkPermits ?? 0) +
          Number(item.authorizedWorkPermits ?? 0)
        : null,
  );
  const seriesAccessibleLabel = points.length
    ? `Atividade factual no período: ${points.map((point) => `${point.label}, ${point.primary} ${seriesLegend[domain][0]}${seriesLegend[domain][1] ? ` e ${point.secondary} ${seriesLegend[domain][1]}` : ""}`).join("; ")}.`
    : "Atividade factual no período sem pontos disponíveis.";
  const groupValue = (item: BreakdownItem) =>
    Number(item.count ?? item.applicable ?? item.registeredAssets ?? 0);
  const maxGroup = Math.max(1, ...groups.map(groupValue));
  const missingHistory = historyItems.filter((item) => !item.available);
  const historyAccessibleLabel = historyItems.some((item) => item.available)
    ? `${domain === "training" ? "Compliance histórico" : "Documentos em fluxo historicamente"}: ${historyItems
        .map((item, index) =>
          item.available
            ? `${item.date}, ${historyValues[index] ?? "não aplicável"}${domain === "training" ? "%" : ""}`
            : null,
        )
        .filter(Boolean)
        .join(
          "; ",
        )}.${missingHistory.length ? ` Sem snapshot em ${missingHistory.length} datas, de ${missingHistory[0]?.date} a ${missingHistory.at(-1)?.date}.` : ""}`
    : "Ainda não há snapshots históricos disponíveis para o período.";
  const refresh = () =>
    void Promise.all([
      summary.refetch(),
      series.refetch(),
      attention.refetch(),
      ...(domain === "training" || domain === "apr"
        ? [detailedBreakdown.refetch(), history.refetch()]
        : []),
      ...(domain === "apr" ? [cycle.refetch()] : []),
    ]);
  return { summary, series, attention, detailedBreakdown, history, cycle, metrics, points, groups, historyItems, historyValues, seriesAccessibleLabel, groupValue, maxGroup, missingHistory, historyAccessibleLabel, refresh, selectedGroupBy };
}
