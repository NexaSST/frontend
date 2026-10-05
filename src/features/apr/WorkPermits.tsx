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
  const canCreate = permissions.includes('apr.manage');
  const emptyList = query.isSuccess && query.data.total === 0;
  const firstUse = emptyList && statusFilter === 'all' && !search.q.trim();
  const createPermit = () => setSearch({ action: 'new', id: undefined });
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

  const reportPanel = <section className={"pt-report-panel flex items-end justify-between gap-6 p-6 border border-solid border-line rounded-panel bg-surface shadow-panel [&_h2]:m-[.3rem_0] [&_h2]:text-[1.35rem] [&_p]:max-w-[58ch] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-normal max-[1000px]:items-stretch max-[1000px]:flex-col"}><div><span className={"workspace-eyebrow text-accent-strong text-[0.7rem] font-[850] tracking-[0.075em] uppercase"}>Relatórios</span><h2>Relatório mensal de {area === 'apr' ? 'APR' : 'PT'}</h2><p>{area === 'apr' ? 'Revisões de APR finalizadas no mês, com identificação e hash do documento.' : 'Permissões de Trabalho movimentadas no mês, com situação e período registrado.'}</p></div><div className={"pt-report-actions flex items-center gap-[.55rem] flex-wrap [&_input]:w-44 max-[640px]:[&_input]:w-full max-[640px]:[&_.ui-button]:w-full"}><Input aria-label="Mês do relatório" type="month" value={reportMonth} onChange={(event) => setReportMonth(event.target.value)} /><Button variant="secondary" disabled={exporting !== null} onClick={() => void runExport('pdf')}>{exporting === 'pdf' ? 'Gerando PDF…' : 'Exportar PDF'}</Button><Button disabled={exporting !== null} onClick={() => void runExport('xlsx')}>{exporting === 'xlsx' ? 'Gerando Excel…' : 'Exportar Excel'}</Button></div></section>;
  if (reportsOnly) return <div className={"pt-report-view w-full"}>{reportPanel}<p className={"pt-report-note p-[.8rem_.2rem] text-muted text-[.84rem]"}>A exportação usa os dados do mês selecionado e inclui somente {area === 'apr' ? 'revisões de APR' : 'Permissões de Trabalho'}.</p></div>;
  return <div className={"resource-layout grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr] pt-resource-layout block w-full [&_.resource-main]:w-full"}>
    <section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
      <header className={"pt-list-heading flex items-start justify-between gap-6 m-[0_0_1.25rem] [&_h2]:m-[.25rem_0_.3rem] [&_h2]:text-[1.35rem] [&_p]:max-w-[62ch] [&_p]:m-0 [&_p]:text-muted [&_p]:leading-normal [&_>_span]:flex-[0_0_auto] [&_>_span]:p-[.45rem_.7rem] [&_>_span]:rounded-[999px] [&_>_span]:text-accent-strong [&_>_span]:bg-accent-soft [&_>_span]:text-[.75rem] [&_>_span]:font-extrabold max-[640px]:flex-col max-[640px]:gap-[.7rem]"}><div><h2>Permissões de Trabalho</h2><p>Prepare, vincule uma APR quando houver, confirme participantes e autorize as PTs.</p></div><span>{query.data?.total ?? 0} registro{query.data?.total === 1 ? '' : 's'}</span></header>
      <ol className={"pt-workflow-guide grid grid-cols-4 gap-[.7rem] m-[0_0_1.15rem] p-0 list-none [&_li]:flex [&_li]:gap-[.7rem] [&_li]:min-w-0 [&_li]:p-[.8rem] [&_li]:border [&_li]:border-solid [&_li]:border-line [&_li]:rounded-[.7rem] [&_li]:bg-[#f7faf7] [&_li_>_span]:flex-[0_0_auto] [&_li_>_span]:text-accent-strong [&_li_>_span]:text-[.75rem] [&_li_>_span]:font-[850] [&_li_>_div]:grid [&_li_>_div]:gap-[.2rem] [&_li_>_div]:min-w-0 [&_strong]:text-[.8rem] [&_small]:text-muted [&_small]:text-[.72rem] [&_small]:leading-[1.4] max-[720px]:grid-cols-[1fr] [@media(min-width:_521px)_and_(max-width:_1100px)]:grid-cols-2 max-[520px]:grid-cols-[1fr]"} aria-label="Etapas do fluxo de PT"><li><span>01</span><div><strong>Trabalho</strong><small>Descreva o serviço e o período.</small></div></li><li><span>02</span><div><strong>APR</strong><small>Vincule uma análise finalizada, se houver.</small></div></li><li><span>03</span><div><strong>Participantes</strong><small>Confirme a equipe de execução.</small></div></li><li><span>04</span><div><strong>Revisão</strong><small>Confira e autorize a PT.</small></div></li></ol>
      <div className={"pt-status-filter flex gap-[.35rem] mb-4 overflow-x-auto scrollbar-thin [&_button]:flex-[0_0_auto] [&_button]:p-[.5rem_.75rem] [&_button]:border [&_button]:border-solid [&_button]:border-transparent [&_button]:rounded-[.6rem] [&_button]:text-muted [&_button]:bg-transparent [&_button]:font-[inherit] [&_button]:text-[.78rem] [&_button]:font-[750] [&_button]:cursor-pointer [&_button:hover]:bg-accent-soft [&_button[aria-pressed='true']]:border-[#b9d3c7] [&_button[aria-pressed='true']]:text-accent-strong [&_button[aria-pressed='true']]:bg-accent-soft"} aria-label="Filtrar permissões por situação">{([['all', 'Todas'], ['draft', 'Rascunhos'], ['authorized', 'Autorizadas'], ['expired', 'Vencidas'], ['closed', 'Encerradas'], ['cancelled', 'Canceladas']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={statusFilter === value} onClick={() => { setStatusFilter(value); setSearch({ page: 1, id: undefined, action: undefined }); }}>{label}</button>)}</div>
      <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })} onCreate={canCreate && !firstUse ? createPermit : undefined} createLabel="Nova PT" />
      <QueryState loading={query.isLoading} error={query.isError}>
        {emptyList ? <div className={"pt-list-empty grid justify-items-center gap-[.75rem] p-[2.5rem_1rem] text-center [&_strong]:text-ink [&_strong]:text-[1.1rem] [&_p]:max-w-[55ch] [&_p]:text-muted [&_p]:leading-normal max-[520px]:[&_.ui-button]:w-full"}>
          <strong>{firstUse ? 'Comece pela primeira Permissão de Trabalho' : 'Nenhuma PT encontrada'}</strong>
          <p>{firstUse ? 'Descreva o trabalho, confirme a equipe e revise os requisitos antes de autorizar a execução.' : 'Ajuste a busca ou a situação selecionada para encontrar suas permissões.'}</p>
          {firstUse && canCreate ? <Button onClick={createPermit}>Criar primeira PT</Button> : !firstUse && <Button variant="secondary" onClick={() => { setStatusFilter('all'); setSearch({ q: '', page: 1 }); }}>Limpar filtros</Button>}
        </div> : <>
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
          renderActions={(index) => <span className={"row-inline-actions inline-flex gap-1"}>{query.data!.rows[index]!.status !== 'draft' && <a className={"ui-button inline-flex items-center justify-center gap-2 rounded-control font-[inherit] font-[750] cursor-pointer [transition:background_140ms_ease,border-color_140ms_ease,color_140ms_ease,transform_140ms_ease] [&:active:not(:disabled)]:transform-[translateY(1px)] disabled:cursor-not-allowed disabled:opacity-50 [&.danger]:text-danger border border-solid border-transparent text-accent-strong bg-transparent [&:hover:not(:disabled)]:bg-[#e9efeb] min-h-[2.4rem] p-[0.5rem_0.7rem] text-[0.8rem]"} href={`/${endpoint}/${query.data!.rows[index]!.id}/qr.svg`} target="_blank" rel="noreferrer">QR</a>}<Button type="button" variant="ghost" size="sm" onClick={() => setSearch({ id: query.data!.rows[index]!.id, action: undefined })}>
            {query.data!.rows[index]!.status === "draft" ? "Editar" : "Visualizar"}
          </Button></span>}
        />
        <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} />
        </>}
      </QueryState>
    </section>
    {editing && <WorkPermitWizard editor={editor} canAuthorize={permissions.includes("apr.finalize")}
      onClose={() => setSearch({ action: undefined, id: undefined })} />}
    {search.id && detail.data && detail.data.status !== "draft" && <FormModal
      title={detail.data?.title ?? "Permissão de Trabalho"}
      description="PT autorizada e preservada com os vínculos e a validação vigentes no momento da autorização."
      className={"w-[min(62rem,calc(100vw-2rem))] max-[800px]:w-[calc(100vw-1rem)]"}
      onClose={() => setSearch({ id: undefined })}
    >
      <dl className={"detail-list grid gap-[0.8rem] m-0 [&_div]:pb-[0.8rem] [&_div]:border-b [&_div]:border-solid [&_div]:border-b-line [&_dt]:text-muted [&_dt]:text-[0.75rem] [&_dt]:font-[750] [&_dd]:m-[0.3rem_0_0]"}>
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
