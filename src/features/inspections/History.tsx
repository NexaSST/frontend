import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { MonthlyReportHeader } from "../../components/MonthlyReportHeader.js";
import { DataTable, ListToolbar, QueryState, StatusBadge } from "../shared.js";
import type { Props, Inspection, MonthlyInspectionReport } from "./types.js";
import { base } from "./api.js";
export function History({ scope, search, setSearch, permissions }: Omit<Props, "tab">) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState<"pdf" | "xlsx" | null>(null);
  const endpoint = `${base(scope)}/inspections`;
  const query = useQuery({
    queryKey: ["inspection-history", endpoint, search.q],
    queryFn: () =>
      apiJson<{ items: Inspection[]; nextBeforeId: string | null }>(endpoint, {
        searchParams: { limit: 50 },
      }),
  });
  const loadReport = () => apiJson<MonthlyInspectionReport>(`${base(scope)}/inspection-reports/monthly`, { searchParams: { month } });
  const answerValue = (answer: MonthlyInspectionReport["inspections"][number]["answers"][number]) =>
    answer.outcome ?? answer.textValue ?? answer.numberValue ?? answer.dateValue ?? "—";
  const safeName = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").toLowerCase();

  async function exportXlsx() {
    setExporting("xlsx");
    try {
      const [report, excel] = await Promise.all([loadReport(), import("write-excel-file/browser")]);
      const header = (labels: string[]) => labels.map((value) => ({ value, fontWeight: "bold" as const, backgroundColor: "DCEDE7" }));
      const summary = [header(["Campo", "Valor"]),
        ["Empresa", report.company.name], ["Filial", report.branch.name], ["Mês", report.month],
        ["Inspeções", report.summary.inspections], ["Não conformidades", report.summary.nonconformities],
        ["Fotos", report.summary.photos], ["Fotos georreferenciadas", report.summary.geolocatedPhotos],
        ["Evidências sinalizadas", report.summary.flaggedPhotos]];
      const inspections = [header(["ID", "Ativo", "Tipo", "Inspetor", "Capturada", "Concluída", "Não conformidades"]),
        ...report.inspections.map((item) => [item.id, item.assetCode, item.assetTypeName, item.inspectorName,
          item.capturedAt ? new Date(item.capturedAt).toLocaleString("pt-BR") : "",
          item.completedAt ? new Date(item.completedAt).toLocaleString("pt-BR") : "",
          item.answers.filter((answer) => answer.outcome === "nonconformant").length])];
      const answers = [header(["Inspeção", "Ativo", "Código", "Pergunta", "Resposta", "Comentário", "Arquivo da evidência", "SHA-256", "Latitude", "Longitude", "Precisão (m)", "Localização verificada"]),
        ...report.inspections.flatMap((item) => item.answers.map((answer) => [item.id, item.assetCode, answer.code, answer.prompt,
          String(answerValue(answer)), answer.comment ?? "", answer.evidence?.fileId ?? "", answer.evidence?.sha256 ?? "",
          answer.evidence?.latitude ?? "", answer.evidence?.longitude ?? "", answer.evidence?.accuracyM ?? "", answer.evidence?.verificationStatus ?? ""]))];
      await excel.default([
        { data: summary, sheet: "Resumo", columns: [{ width: 28 }, { width: 36 }], stickyRowsCount: 1 },
        { data: inspections, sheet: "Inspeções", columns: [12, 18, 24, 28, 22, 22, 20].map((width) => ({ width })), stickyRowsCount: 1 },
        { data: answers, sheet: "Respostas e evidências", columns: [12, 18, 14, 52, 22, 36, 20, 66, 14, 14, 14, 24].map((width) => ({ width })), stickyRowsCount: 1 },
      ]).toFile(`inspecoes-${safeName(report.branch.name)}-${report.month}.xlsx`);
      sileo.success({ title: "Excel gerado", description: `${report.summary.inspections} inspeções incluídas.` });
    } catch { sileo.error({ title: "Não foi possível gerar o Excel", description: "Confira sua conexão e tente novamente." }); }
    finally { setExporting(null); }
  }

  async function exportPdf() {
    setExporting("pdf");
    try {
      const [report, jspdf, autoTableModule] = await Promise.all([loadReport(), import("jspdf"), import("jspdf-autotable")]);
      const document = new jspdf.jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      document.setFontSize(16); document.text("Relatório mensal de inspeções", 14, 16);
      document.setFontSize(9); document.text(`${report.company.name} · ${report.branch.name} · ${report.month}`, 14, 22);
      document.text(`Inspeções: ${report.summary.inspections}  |  Não conformidades: ${report.summary.nonconformities}  |  Fotos: ${report.summary.photos}  |  Georreferenciadas: ${report.summary.geolocatedPhotos}  |  Sinalizadas: ${report.summary.flaggedPhotos}`, 14, 28);
      autoTableModule.default(document, {
        startY: 33,
        head: [["Ativo", "Tipo", "Inspetor", "Capturada", "Não conformidades", "Evidências"]],
        body: report.inspections.map((item) => [item.assetCode, item.assetTypeName, item.inspectorName,
          item.capturedAt ? new Date(item.capturedAt).toLocaleString("pt-BR") : "—",
          String(item.answers.filter((answer) => answer.outcome === "nonconformant").length), String(item.answers.filter((answer) => answer.evidence).length)]),
        styles: { fontSize: 8 }, headStyles: { fillColor: [20, 84, 66] },
      });
      for (const item of report.inspections) {
        document.addPage(); document.setFontSize(13); document.text(`${item.assetCode} · ${item.assetTypeName}`, 14, 16);
        document.setFontSize(8); document.text(`Inspetor: ${item.inspectorName} · Captura: ${item.capturedAt ? new Date(item.capturedAt).toLocaleString("pt-BR") : "—"}`, 14, 22);
        autoTableModule.default(document, {
          startY: 28, head: [["Item", "Pergunta", "Resposta", "Comentário", "Evidência / GPS"]],
          body: item.answers.map((answer) => [answer.code, answer.prompt, String(answerValue(answer)), answer.comment ?? "—",
            answer.evidence ? `SHA ${answer.evidence.sha256}\n${answer.evidence.latitude ?? "?"}, ${answer.evidence.longitude ?? "?"} (±${answer.evidence.accuracyM ?? "?"} m) · ${answer.evidence.verificationStatus ?? "pendente"}` : "—"]),
          styles: { fontSize: 7, cellPadding: 2 }, headStyles: { fillColor: [20, 84, 66] }, columnStyles: { 1: { cellWidth: 72 }, 4: { cellWidth: 76 } },
        });
      }
      document.save(`inspecoes-${safeName(report.branch.name)}-${report.month}.pdf`);
      sileo.success({ title: "PDF gerado", description: `${report.summary.inspections} inspeções incluídas.` });
    } catch { sileo.error({ title: "Não foi possível gerar o PDF", description: "Confira sua conexão e tente novamente." }); }
    finally { setExporting(null); }
  }
  return (
    <section className="resource-main">
      {permissions.includes("inspection.review") && <MonthlyReportHeader
        title="Relatório mensal completo"
        description="Gere um único arquivo com todas as inspeções, respostas e evidências do mês."
        month={month}
        onMonthChange={setMonth}
        exporting={exporting}
        onExport={(format) => void (format === "xlsx" ? exportXlsx() : exportPdf())}
      />}
      <ListToolbar hideExport hideEmptyFilters value={search.q} onChange={(q) => setSearch({ q })} />
      <QueryState loading={query.isLoading} error={query.isError}>
        <DataTable
          columns={["Ativo", "Tipo", "Situação", "Capturada", "Concluída"]}
          rows={(query.data?.items ?? [])
            .filter(
              (r) =>
                !search.q ||
                r.assetCode.toLowerCase().includes(search.q.toLowerCase()),
            )
            .map((r) => [
              <strong>{r.assetCode}</strong>,
              r.assetTypeName,
              <StatusBadge value={r.status} />,
              r.capturedAt
                ? new Date(r.capturedAt).toLocaleString("pt-BR")
                : "—",
              r.completedAt
                ? new Date(r.completedAt).toLocaleString("pt-BR")
                : "—",
            ])}
          keyOf={(i) => query.data!.items[i]!.id}
          empty="As inspeções concluídas pelo aplicativo aparecerão aqui."
        />
      </QueryState>
    </section>
  );
}
