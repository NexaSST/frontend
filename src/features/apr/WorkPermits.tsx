import { useState } from "react";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { exportPdf, exportXlsx } from "../../lib/report-export.js";
import { Button, Input } from "../../components/ui/index.js";
import { DataTable, FormModal, ListToolbar, PagedFooter, QueryState, StatusBadge } from "../shared.js";
import type { Props, AprMonthlyReport } from "./types.js";
import { root } from "./api.js";
import { useWorkPermitEditor } from "./useWorkPermitEditor.js";
import { WorkPermitWizard } from "./WorkPermitWizard.js";
export function WorkPermits({ scope, search, setSearch, permissions, reportsOnly, area }: Omit<Props, "tab"> & { reportsOnly: boolean }) {
  const [reportMonth, setReportMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const editor = useWorkPermitEditor({ scope, search, setSearch, statusFilter });
  const { endpoint, query, detail, editing } = editor;
  const runExport = async (format: 'pdf' | 'xlsx') => {
    setExporting(format);
    try {
      const report = await apiJson<AprMonthlyReport>(`${root(scope)}/apr-reports/monthly`, { searchParams: { month: reportMonth } });
      const aprRows = report.aprs.map((item) => [item.referenceCode, item.title, item.revisionNo, item.finalizedAt ? new Date(item.finalizedAt).toLocaleString('pt-BR') : '—', item.sha256]);
      const permitRows = report.workPermits.map((item) => [item.referenceCode, item.title, item.status,
        item.startsAt ? new Date(item.startsAt).toLocaleString('pt-BR') : '—', item.endsAt ? new Date(item.endsAt).toLocaleString('pt-BR') : '—',
        item.cancelledAt ? new Date(item.cancelledAt).toLocaleString('pt-BR') : '—', item.cancellationRequestedByName ?? '—']);
      const filename = `${area}-${report.branch.name.replace(/\W+/g, '-').toLowerCase()}-${reportMonth}`;
      const summary = area === 'apr' ? `Revisões APR finalizadas: ${report.summary.aprRevisions}` : `PTs: ${report.summary.workPermits} | Autorizadas: ${report.summary.authorizedPermits} | Canceladas: ${report.summary.cancelledPermits}`;
      if (format === 'xlsx') await exportXlsx(`${filename}.xlsx`, area === 'apr' ? [
        { name: 'Resumo', headers: ['Indicador', 'Valor'], rows: [['Revisões APR', report.summary.aprRevisions]], widths: [28, 18] },
        { name: 'APRs', headers: ['Referência', 'Título', 'Revisão', 'Finalização', 'SHA-256'], rows: aprRows, widths: [18, 40, 12, 22, 66] },
      ] : [
        { name: 'Resumo', headers: ['Indicador', 'Valor'], rows: [['PTs no período', report.summary.workPermits], ['PTs autorizadas', report.summary.authorizedPermits], ['PTs canceladas', report.summary.cancelledPermits]], widths: [28, 18] },
        { name: 'Permissões de Trabalho', headers: ['Referência', 'Título', 'Status', 'Início', 'Fim', 'Cancelamento', 'Solicitante'], rows: permitRows, widths: [18, 38, 16, 22, 22, 22, 28] },
      ]); else await exportPdf(`${filename}.pdf`, area === 'apr' ? 'Relatório mensal de APR' : 'Relatório mensal de PT', `${report.company.name} · ${report.branch.name} · ${reportMonth}`, summary, area === 'apr' ? [
        { title: 'Revisões de APR finalizadas', headers: ['Referência', 'Título', 'Revisão', 'Finalização', 'SHA-256'], rows: aprRows },
      ] : [
        { title: 'Permissões de Trabalho', headers: ['Referência', 'Título', 'Status', 'Início', 'Fim', 'Cancelamento', 'Solicitante'], rows: permitRows },
      ]);
      sileo.success({ title: `${format === 'pdf' ? 'PDF' : 'Excel'} gerado` });
    } catch { sileo.error({ title: 'Não foi possível gerar o relatório' }); } finally { setExporting(null); }
  };

  const reportPanel = <section className="pt-report-panel"><div><span className="workspace-eyebrow">Relatórios</span><h2>Relatório mensal de {area === 'apr' ? 'APR' : 'PT'}</h2><p>{area === 'apr' ? 'Revisões de APR finalizadas no mês, com identificação e hash do documento.' : 'Permissões de Trabalho movimentadas no mês, com situação e período registrado.'}</p></div><div className="pt-report-actions"><Input aria-label="Mês do relatório" type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} /><Button variant="secondary" disabled={exporting !== null} onClick={() => void runExport('pdf')}>{exporting === 'pdf' ? 'Gerando PDF…' : 'Exportar PDF'}</Button><Button disabled={exporting !== null} onClick={() => void runExport('xlsx')}>{exporting === 'xlsx' ? 'Gerando Excel…' : 'Exportar Excel'}</Button></div></section>;
  if (reportsOnly) return <div className="pt-report-view">{reportPanel}<p className="pt-report-note">A exportação usa os dados do mês selecionado e inclui somente {area === 'apr' ? 'revisões de APR' : 'Permissões de Trabalho'}.</p></div>;
  return <div className="resource-layout pt-resource-layout">
    <section className="resource-main">
      <header className="pt-list-heading"><div><span className="workspace-eyebrow">Operação da filial</span><h2>Permissões de Trabalho</h2><p>Prepare, vincule uma APR quando houver, confirme participantes e autorize as PTs.</p></div><span>{query.data?.total ?? 0} registro{query.data?.total === 1 ? '' : 's'}</span></header>
      <ol className="pt-workflow-guide" aria-label="Etapas do fluxo de PT"><li><span>01</span><div><strong>Trabalho</strong><small>Descreva o serviço e o período.</small></div></li><li><span>02</span><div><strong>APR</strong><small>Vincule uma análise finalizada, se houver.</small></div></li><li><span>03</span><div><strong>Participantes</strong><small>Confirme a equipe de execução.</small></div></li><li><span>04</span><div><strong>Revisão</strong><small>Confira e autorize a PT.</small></div></li></ol>
      <div className="pt-status-filter" aria-label="Filtrar permissões por situação">{([['all', 'Todas'], ['draft', 'Rascunhos'], ['authorized', 'Autorizadas'], ['expired', 'Vencidas'], ['closed', 'Encerradas'], ['cancelled', 'Canceladas']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={statusFilter === value} onClick={() => { setStatusFilter(value); setSearch({ page: 1, id: undefined, action: undefined }); }}>{label}</button>)}</div>
      <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })} onCreate={() => setSearch({ action: "new", id: undefined })} createLabel="Nova PT" />
      <QueryState loading={query.isLoading} error={query.isError}>
        <DataTable
          columns={["Referência", "Permissão de Trabalho", "Período", "Situação"]}
          rows={(query.data?.rows ?? []).map((row) => [
            <strong>{row.referenceCode}</strong>,
            row.title,
            row.startsAt ? `${new Date(row.startsAt).toLocaleDateString("pt-BR")} ${row.endsAt ? `— ${new Date(row.endsAt).toLocaleDateString("pt-BR")}` : ""}` : "Não informado",
            <StatusBadge value={row.status} />,
          ])}
          keyOf={(index) => query.data!.rows[index]!.id}
          empty={statusFilter === 'all' ? 'Cadastre a primeira PT para começar.' : 'Nenhuma PT encontrada nesta situação.'}
          renderActions={(index) => <span className="row-inline-actions">{query.data!.rows[index]!.status !== 'draft' && <a className="ui-button ui-button--ghost ui-button--sm" href={`/${endpoint}/${query.data!.rows[index]!.id}/qr.svg`} target="_blank" rel="noreferrer">QR</a>}<Button type="button" variant="ghost" size="sm" onClick={() => setSearch({ id: query.data!.rows[index]!.id, action: undefined })}>
            {query.data!.rows[index]!.status === "draft" ? "Editar" : "Visualizar"}
          </Button></span>}
        />
        <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} />
      </QueryState>
    </section>
    {editing && <WorkPermitWizard editor={editor} canAuthorize={permissions.includes("apr.finalize")}
      onClose={() => setSearch({ action: undefined, id: undefined })} />}
    {search.id && detail.data && detail.data.status !== "draft" && <FormModal
      title={detail.data?.title ?? "Permissão de Trabalho"}
      description="PT autorizada e preservada com os vínculos e a validação vigentes no momento da autorização."
      className="form-modal--work-permit"
      onClose={() => setSearch({ id: undefined })}
    >
      <dl className="detail-list">
        <div><dt>Referência</dt><dd>{detail.data?.referenceCode}</dd></div>
        <div><dt>Situação</dt><dd><StatusBadge value={detail.data?.status ?? "authorized"} /></dd></div>
        <div><dt>Trabalho</dt><dd>{detail.data?.workDescription}</dd></div>
        <div><dt>Período</dt><dd>{detail.data?.startsAt ? new Date(detail.data.startsAt).toLocaleString('pt-BR') : 'Não informado'} — {detail.data?.endsAt ? new Date(detail.data.endsAt).toLocaleString('pt-BR') : 'Sem término informado'}</dd></div>
        <div><dt>APRs vinculadas</dt><dd>{detail.data?.aprs.length ?? 0}</dd></div>
        <div><dt>Participantes</dt><dd>{detail.data?.participants.length ?? 0}</dd></div>
        <div><dt>Validação preventiva</dt><dd>{detail.data?.trainingValidationRequired ? "Treinamentos verificados" : "Não exigida — Treinamentos não contratado"}</dd></div>
        <div><dt>QR público</dt><dd><a href={`/${endpoint}/${detail.data?.id}/qr.svg`} target="_blank" rel="noreferrer">Abrir QR imprimível</a></dd></div>
        {detail.data?.cancelledAt && <div><dt>Cancelamento</dt><dd>{new Date(detail.data.cancelledAt).toLocaleString('pt-BR')} · {detail.data.cancellationRequestedByName}</dd></div>}
      </dl>
    </FormModal>}
  </div>;
}
