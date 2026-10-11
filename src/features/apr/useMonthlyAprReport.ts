import { useState } from "react";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { exportPdf, exportXlsx } from "../../lib/report-export.js";
import { root } from "./api.js";
import type { AprMonthlyReport, Props } from "./types.js";

export function useMonthlyAprReport({scope, area}: Pick<Props, "scope" | "area">) {
  const [reportMonth, setReportMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);
  const runExport = async (format: "pdf" | "xlsx") => {
    setExporting(format);
    try {
      const report = await apiJson<AprMonthlyReport>(
        `${root(scope)}/apr-reports/monthly`,
        { searchParams: { month: reportMonth } },
      );
      const aprRows = report.aprs.map((item) => [
        item.referenceCode,
        item.title,
        item.revisionNo,
        item.finalizedAt
          ? new Date(item.finalizedAt).toLocaleString("pt-BR")
          : "—",
        item.sha256,
      ]);
      const permitRows = report.workPermits.map((item) => [
        item.referenceCode,
        item.title,
        item.status,
        item.startsAt ? new Date(item.startsAt).toLocaleString("pt-BR") : "—",
        item.endsAt ? new Date(item.endsAt).toLocaleString("pt-BR") : "—",
        item.cancelledAt
          ? new Date(item.cancelledAt).toLocaleString("pt-BR")
          : "—",
        item.cancellationRequestedByName ?? "—",
      ]);
      const filename = `${area}-${report.branch.name.replace(/\W+/g, "-").toLowerCase()}-${reportMonth}`;
      const summary =
        area === "apr"
          ? `Revisões APR finalizadas: ${report.summary.aprRevisions}`
          : `PTs: ${report.summary.workPermits} | Autorizadas: ${report.summary.authorizedPermits} | Canceladas: ${report.summary.cancelledPermits}`;
      if (format === "xlsx")
        await exportXlsx(
          `${filename}.xlsx`,
          area === "apr"
            ? [
                {
                  name: "Resumo",
                  headers: ["Indicador", "Valor"],
                  rows: [["Revisões APR", report.summary.aprRevisions]],
                  widths: [28, 18],
                },
                {
                  name: "APRs",
                  headers: [
                    "Referência",
                    "Título",
                    "Revisão",
                    "Finalização",
                    "SHA-256",
                  ],
                  rows: aprRows,
                  widths: [18, 40, 12, 22, 66],
                },
              ]
            : [
                {
                  name: "Resumo",
                  headers: ["Indicador", "Valor"],
                  rows: [
                    ["PTs no período", report.summary.workPermits],
                    ["PTs autorizadas", report.summary.authorizedPermits],
                    ["PTs canceladas", report.summary.cancelledPermits],
                  ],
                  widths: [28, 18],
                },
                {
                  name: "Permissões de Trabalho",
                  headers: [
                    "Referência",
                    "Título",
                    "Status",
                    "Início",
                    "Fim",
                    "Cancelamento",
                    "Solicitante",
                  ],
                  rows: permitRows,
                  widths: [18, 38, 16, 22, 22, 22, 28],
                },
              ],
        );
      else
        await exportPdf(
          `${filename}.pdf`,
          area === "apr" ? "Relatório mensal de APR" : "Relatório mensal de PT",
          `${report.company.name} · ${report.branch.name} · ${reportMonth}`,
          summary,
          area === "apr"
            ? [
                {
                  title: "Revisões de APR finalizadas",
                  headers: [
                    "Referência",
                    "Título",
                    "Revisão",
                    "Finalização",
                    "SHA-256",
                  ],
                  rows: aprRows,
                },
              ]
            : [
                {
                  title: "Permissões de Trabalho",
                  headers: [
                    "Referência",
                    "Título",
                    "Status",
                    "Início",
                    "Fim",
                    "Cancelamento",
                    "Solicitante",
                  ],
                  rows: permitRows,
                },
              ],
        );
      sileo.success({ title: `${format === "pdf" ? "PDF" : "Excel"} gerado` });
    } catch {
      sileo.error({ title: "Não foi possível gerar o relatório" });
    } finally {
      setExporting(null);
    }
  };

  return { reportMonth, setReportMonth, exporting, runExport };
}
