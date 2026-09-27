import { useQuery } from '@tanstack/react-query';
import { Check, Download, ListFilter, Plus, Search, X } from 'lucide-react';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Pagination } from '../components/Pagination.js';
import { Badge, Button, FormField, Input, labelForStatus, toneForStatus } from '../components/ui/index.js';
import { apiAllRows, apiPage } from '../lib/api.js';
import type { ModuleSearch } from '../types/feature.js';

export type { Scope, ModuleSearch } from '../types/feature.js';

export function usePagedRows<T>(key: string, endpoint: string, search: ModuleSearch, extra?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: [key, endpoint, search.page, search.q, extra],
    queryFn: () => apiPage<T>(endpoint, { searchParams: { page: search.page, pageSize: 25, ...(search.q ? { search: search.q } : {}), ...extra } }),
  });
}

export function useAllRows<T>(key: string, endpoint: string, enabled = true) {
  return useQuery({ queryKey: [key, endpoint], queryFn: async () => ({ rows: await apiAllRows<T>(endpoint) }), enabled });
}

export function ModuleTabs({ tabs, current, onChange }: { tabs: Array<{ id: string; label: string }>; current: string; onChange: (tab: string) => void }) {
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const centerActive = () => {
    const active = activeRef.current;
    const container = active?.parentElement;
    if (active && container) container.scrollLeft = Math.max(0, active.offsetLeft - (container.clientWidth - active.offsetWidth) / 2);
  };
  useLayoutEffect(() => {
    centerActive();
  }, [current, tabs]);
  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => { secondFrame = requestAnimationFrame(centerActive); });
    const container = activeRef.current?.parentElement;
    const observer = container ? new ResizeObserver(centerActive) : null;
    if (container) observer?.observe(container);
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); observer?.disconnect(); };
  }, [current]);
  return <nav className="module-tabs [&>button]:!px-2 [&>button:hover]:!bg-accent-soft [&>button[aria-current=page]]:!bg-accent-soft" aria-label="Seções do módulo">{tabs.map((tab) => <Button ref={current === tab.id ? activeRef : undefined} variant="ghost" size="sm" key={tab.id} aria-current={current === tab.id ? 'page' : undefined} onClick={() => onChange(tab.id)}>{tab.label}</Button>)}</nav>;
}

export function WorkflowStepper({ steps, current, onStep }: { steps: string[]; current: number; onStep?: (step: number) => void }) {
  return <div className="mx-auto mb-6 w-full max-w-3xl">
    <ol className="m-0 flex w-full list-none p-0" aria-label="Etapas do cadastro">{steps.map((label, index) => {
      const number = index + 1;
      const complete = number < current;
      const active = number === current;
      return <li key={`${number}-${label}`} className="relative min-w-0 flex-1">
        {index < steps.length - 1 && <span aria-hidden="true" className={`absolute top-[1.375rem] right-[calc(-50%+1rem)] left-[calc(50%+1rem)] h-px ${complete ? "bg-accent" : "bg-line"}`} />}
        <button type="button" disabled={number > current} aria-current={active ? 'step' : undefined}
          aria-label={`Etapa ${number} de ${steps.length}: ${label}${complete ? ', concluída' : active ? ', atual' : ', futura'}`}
          onClick={() => number <= current && onStep?.(number)}
          className={`relative z-10 flex min-h-11 w-full min-w-0 flex-col items-center gap-1.5 bg-transparent px-0 py-1.5 text-center focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${active || complete ? "text-accent-strong" : "text-muted"}`}>
          <span aria-hidden="true" className={`grid size-8 shrink-0 place-items-center rounded-full border text-sm font-extrabold tabular-nums ${active || complete ? "border-accent bg-accent-soft" : "border-line bg-surface"}`}>
            {complete ? <Check size={15} strokeWidth={2.5} /> : number}
          </span>
          <small aria-hidden="true" className="hidden min-w-0 max-w-full text-xs leading-tight font-bold min-[480px]:block">{label}</small>
        </button>
      </li>;
    })}</ol>
    <p className="mt-2 text-center text-xs font-semibold text-accent-strong min-[480px]:hidden">Etapa {current} de {steps.length}: {steps[current - 1]}</p>
  </div>;
}

export function ListToolbar({ value, onChange, onCreate, createLabel = 'Novo cadastro', actions, children, hideEmptyFilters = false, hideExport = false, activeFilterCount = 0 }: { value: string; onChange: (value: string) => void; onCreate?: () => void; createLabel?: string; actions?: ReactNode; children?: ReactNode; hideEmptyFilters?: boolean; hideExport?: boolean; activeFilterCount?: number }) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const filterPanelId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exported, setExported] = useState(false);
  const [canExport, setCanExport] = useState(false);

  useLayoutEffect(() => {
    setCanExport(Boolean(toolbarRef.current?.parentElement?.querySelector('table.data-table tbody tr')));
  });

  const exportCsv = () => {
    const table = toolbarRef.current?.parentElement?.querySelector<HTMLTableElement>('table.data-table');
    if (!table) return;
    const lines = Array.from(table.rows).map((row) => {
      const cells = Array.from(row.cells).filter((cell) => !cell.classList.contains('row-actions') && !cell.classList.contains('actions-column'));
      return cells.map((cell) => `"${(cell.textContent ?? '').replace(/\s+/g, ' ').trim().replaceAll('"', '""')}"`).join(';');
    });
    const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `nexasst-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(href);
    setExported(true);
    window.setTimeout(() => setExported(false), 1800);
  };

  return <div ref={toolbarRef} className="list-toolbar">
    <div className="list-toolbar__left">
      <label className="search-field"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar</span><Input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Buscar nesta lista" /></label>
      {(children || !hideEmptyFilters) && <Button variant="secondary" size="sm" className="filter-button" leadingIcon={<ListFilter size={16} aria-hidden="true" />} aria-expanded={children ? filtersOpen : undefined} aria-controls={children ? filterPanelId : undefined} disabled={!children} title={children ? 'Mostrar filtros' : 'Esta lista ainda não possui filtros adicionais'} onClick={() => setFiltersOpen((open) => !open)}>{activeFilterCount ? `Filtros (${activeFilterCount})` : 'Filtros'}</Button>}
      {children && filtersOpen && <div id={filterPanelId} className="list-toolbar__filters">{children}</div>}
    </div>
    {(actions || !hideExport || onCreate) && <div className="toolbar-actions">
      {actions}
      {!hideExport && <Button variant="secondary" size="sm" className="export-button" leadingIcon={exported ? <Check size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />} disabled={!canExport} onClick={exportCsv}>{exported ? 'Exportado' : 'Exportar CSV'}</Button>}
      {onCreate && <Button size="sm" leadingIcon={<Plus size={16} aria-hidden="true" />} onClick={onCreate}>{createLabel}</Button>}
    </div>}
  </div>;
}

export function DataTable({ columns, rows, keyOf, empty = 'Cadastre o primeiro registro para começar.', renderActions }: { columns: string[]; rows: Array<Array<ReactNode>>; keyOf: (index: number) => string; empty?: string; renderActions?: (index: number) => ReactNode }) {
  if (!rows.length) return <div className="empty-panel"><strong>Nenhum registro</strong><p>{empty}</p></div>;
  return <div className="table-scroll"><table className="data-table"><thead><tr>{columns.map((column) => <th key={column} scope="col">{column}</th>)}{renderActions && <th className="actions-column" scope="col">Ações</th>}</tr></thead><tbody>{rows.map((cells, index) => <tr key={keyOf(index)}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}{renderActions && <td className="row-actions">{renderActions(index)}</td>}</tr>)}</tbody></table></div>;
}

export function QueryState({ loading, error, children }: { loading: boolean; error: boolean; children: ReactNode }) {
  if (loading) return <div className="table-skeleton" aria-label="Carregando"><i /><i /><i /><i /></div>;
  if (error) return <div className="error-panel"><strong>Não foi possível carregar os dados.</strong><p>Confira sua conexão e tente novamente.</p></div>;
  return <>{children}</>;
}

export function PagedFooter({ data, onPage }: { data?: { page: number; totalPages: number; total: number }; onPage: (page: number) => void }) {
  return data ? <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={onPage} /> : null;
}

export function EditorPanel({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return <aside className="editor-panel"><header><div><h2>{title}</h2><p>{description}</p></div><Button variant="secondary" size="icon" onClick={onClose} aria-label="Fechar formulário"><X size={18} /></Button></header>{children}</aside>;
}

export function FormModal({ title, description, onClose, children, className, closeLabel = "Fechar formulário" }: { title: string; description: string; onClose: () => void; children: ReactNode; className?: string; closeLabel?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);
  return <dialog ref={ref} className={`form-modal${className ? ` ${className}` : ''}`} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className="form-modal__header"><div><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div><Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label={closeLabel}><X size={20} /></Button></header>
    <div className="form-modal__body">{children}</div>
  </dialog>;
}

export function WorkflowModal({ title, description, focusKey, onClose, children, footer }: { title: string; description: string; focusKey?: string | number; onClose: () => void; children: ReactNode; footer: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const didMount = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);
  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    const body = bodyRef.current;
    if (!body) return;
    body.scrollTop = 0;
    const heading = body.querySelector<HTMLElement>('h3');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }, [focusKey]);
  return <dialog ref={ref} className="workflow-modal" aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className="workflow-modal__header"><div><h2 id={titleId}>{title}</h2><p id={descriptionId}>{description}</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar editor"><X size={20} /></Button></header>
    <div ref={bodyRef} className="workflow-modal__body">{children}</div>
    <footer className="workflow-modal__footer">{footer}</footer>
  </dialog>;
}

export function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return <FormField label={label} error={error}>{children}</FormField>;
}

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={toneForStatus(value)}>{labelForStatus(value)}</Badge>;
}

export function ModuleTodo({ title, items }: { title: string; items: string[] }) {
  return <section className="todo-surface"><div><h2>{title}</h2><p>Este painel depende de endpoints agregados. As listagens operacionais abaixo continuam disponíveis sem calcular métricas incompletas no navegador.</p></div><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

export function GuidedOverview({ title, description, steps, metrics, onStep }: { title: string; description: string; steps: Array<{ title: string; description: string; tab?: string }>; metrics: string[]; onStep?: (tab: string) => void }) {
  return <div className="guided-overview"><section className="guided-intro"><div><span className="workspace-eyebrow">Comece por aqui</span><h2>{title}</h2><p>{description}</p></div><span className="guided-step-count">{steps.length} etapas</span></section><ol className="journey-grid">{steps.map((step, index) => <li key={step.title}><button className="journey-step" type="button" disabled={!step.tab || !onStep} onClick={() => step.tab && onStep?.(step.tab)}><span>{index + 1}</span><strong>{step.title}</strong><p>{step.description}</p></button></li>)}</ol><ModuleTodo title="Painel gerencial — TODO da API" items={metrics} /></div>;
}

export function ArchiveButton({ onConfirm, busy }: { onConfirm: () => void; busy?: boolean }) {
  const [armed, setArmed] = useState(false);
  if (!armed) return <Button variant="ghost" size="sm" className="danger" onClick={() => setArmed(true)}>Arquivar</Button>;
  return <span className="confirm-actions"><Button variant="ghost" size="sm" onClick={() => setArmed(false)}>Cancelar</Button><Button variant="danger" size="sm" loading={busy} onClick={onConfirm}>Confirmar</Button></span>;
}
