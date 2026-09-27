import { useState } from "react";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { exportPdf, exportXlsx } from "../../lib/report-export.js";
import { Badge, Select } from "../../components/ui/index.js";
import { DataTable, ListToolbar, PagedFooter, QueryState, usePagedRows } from "../shared.js";
import type { Props, Obligation, TrainingReport } from "./types.js";
import { MonthlyReportHeader } from "../../components/MonthlyReportHeader.js";
import { root } from "./api.js";
export function Expirations({ scope, search, setSearch }: Omit<Props, 'tab'>) {
  const [status, setStatus] = useState('');
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);
  const query = usePagedRows<Obligation>('training-obligations', `${root(scope)}/training-obligations`, search, status ? { status } : undefined);
  const labels: Record<Obligation['status'], string> = { expired: 'Vencido', not_completed: 'Não concluído', due_30: 'A vencer em 30 dias', attention_90: 'Atenção · 31–90 dias', up_to_date: 'Em dia' };
  const tones: Record<Obligation['status'], 'danger' | 'warning' | 'success' | 'neutral'> = { expired: 'danger', not_completed: 'danger', due_30: 'warning', attention_90: 'warning', up_to_date: 'success' };
  const loadReport = () => apiJson<TrainingReport>(`${root(scope)}/training-reports/monthly`, { searchParams: { month } });
  const rows = (report: TrainingReport) => ({ alerts: report.alerts.map((item) => [item.personName, item.detail, item.date ?? '—', item.severity]),
    completions: report.completions.map((item) => [item.personName, `${item.courseCode} · ${item.courseName}`, item.trainingOn ?? '—', item.expiresOn ?? '—']) });
  const runExport = async (format: 'pdf' | 'xlsx') => {
    setExporting(format);
    try {
      const report = await loadReport(); const data = rows(report); const filename = `treinamentos-${report.branch.name.replace(/\W+/g, '-').toLowerCase()}-${month}`;
      const summary = `Aplicáveis: ${report.summary.applicable} | Compliance: ${report.summary.compliancePercent ?? '—'}% | Vencidos: ${report.summary.expired} | Pendentes: ${report.summary.missing}`;
      if (format === 'xlsx') await exportXlsx(`${filename}.xlsx`, [
        { name: 'Resumo', headers: ['Indicador', 'Valor'], rows: [['Aplicáveis', report.summary.applicable], ['Conformes', report.summary.compliant], ['Compliance (%)', report.summary.compliancePercent ?? 0], ['Vencidos', report.summary.expired], ['Não concluídos', report.summary.missing]], widths: [30, 18] },
        { name: 'Alertas', headers: ['Colaborador', 'Situação', 'Data', 'Severidade'], rows: data.alerts, widths: [28, 56, 16, 16] },
        { name: 'Realizações do mês', headers: ['Colaborador', 'Curso', 'Realização', 'Validade'], rows: data.completions, widths: [28, 42, 16, 16] },
      ]); else await exportPdf(`${filename}.pdf`, 'Relatório mensal de treinamentos', `${report.company.name} · ${report.branch.name} · ${month}`, summary, [
        { title: 'Vencimentos e pendências', headers: ['Colaborador', 'Situação', 'Data', 'Severidade'], rows: data.alerts },
        { title: 'Treinamentos realizados no mês', headers: ['Colaborador', 'Curso', 'Realização', 'Validade'], rows: data.completions },
      ]);
      sileo.success({ title: `${format === 'pdf' ? 'PDF' : 'Excel'} gerado` });
    } catch { sileo.error({ title: 'Não foi possível gerar o relatório' }); } finally { setExporting(null); }
  };
  return (
    <section className="resource-main">
      <MonthlyReportHeader
        title="Relatório mensal de treinamentos"
        description="Vencimentos, pendências e treinamentos realizados no mês."
        month={month}
        onMonthChange={setMonth}
        exporting={exporting}
        onExport={(format) => void runExport(format)}
      />
      <ListToolbar hideExport activeFilterCount={status ? 1 : 0} value={search.q} onChange={(q) => setSearch({ q, page: 1 })}>
        <Select aria-label="Filtrar por status" value={status} onChange={(event) => { setStatus(event.target.value); setSearch({ page: 1 }); }}>
          <option value="">Todos os status</option>
          <option value="expired">Vencidos</option>
          <option value="not_completed">Não concluídos</option>
          <option value="due_30">A vencer em 30 dias</option>
          <option value="attention_90">Atenção · 31–90 dias</option>
          <option value="up_to_date">Em dia</option>
        </Select>
      </ListToolbar>
      <QueryState loading={query.isLoading} error={query.isError}>
        <DataTable
          columns={['Colaborador', 'Curso', 'Status', 'Validade', 'Vínculo']}
          rows={(query.data?.rows ?? []).map((item) => [
            <strong>{item.personName}</strong>, `${item.courseCode} · ${item.courseName}`,
            <Badge tone={tones[item.status]}>{labels[item.status]}</Badge>, item.expiresOn ?? '—',
            item.employmentType === 'outsourced' ? 'Terceirizado' : 'Próprio',
          ])}
          keyOf={(index) => `${query.data!.rows[index]!.personId}-${query.data!.rows[index]!.courseId}`}
        />
        <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} />
      </QueryState>
    </section>
  );
}
