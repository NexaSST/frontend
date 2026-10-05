import { lazy, Suspense, useState, useId } from 'react';

const Chart = lazy(() => import('./OperationalChartSurface.js'));
export type OperationalChartProps = {
  label: string;
  data: Array<Record<string, unknown> & { label: string }>;
  series: Array<{ key: string; label: string; type?: 'bar' | 'line' }>;
  max?: number;
};

export function OperationalChart(props: OperationalChartProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const panelId = useId();
  return <div className={String.raw`operational-chart min-w-0 p-[.75rem_1rem] [&_.text-muted-foreground]:text-muted [&_.text-border]:text-line [&_.text-foreground]:text-ink [&_.text-background]:text-surface [&_.bg-background]:bg-surface [&_.border-border\/50]:border-line max-[520px]:p-[.5rem]`}>
    <div className={"operational-chart__views flex justify-end gap-[.25rem] mb-[.5rem] [&_button]:min-h-11 [&_button]:p-[.5rem_.85rem] [&_button]:border [&_button]:border-solid [&_button]:border-transparent [&_button]:rounded-compact [&_button]:text-muted [&_button]:bg-transparent [&_button]:font-[inherit] [&_button]:text-[.875rem] [&_button]:cursor-pointer [&_button[aria-pressed='true']]:text-accent-strong [&_button[aria-pressed='true']]:bg-accent-soft [&_button:hover]:border-line [&_button:focus-visible]:[outline:2px_solid_var(--color-accent)] [&_button:focus-visible]:outline-offset-2"} role="group" aria-label="Visualização dos dados">
      <button type="button" aria-pressed={view === 'chart'} aria-controls={panelId} onClick={() => setView('chart')}>Gráfico</button>
      <button type="button" aria-pressed={view === 'table'} aria-controls={panelId} onClick={() => setView('table')}>Tabela</button>
    </div>
    <div id={panelId}>
    {view === 'chart' ? (
    <Suspense fallback={<div className={"operational-chart__loading min-h-72 grid place-items-center text-muted"} role="status">Carregando gráfico…</div>}>
      <Chart {...props} />
    </Suspense>
    ) : <div className={"operational-chart__data text-muted text-[.875rem] [&_summary]:cursor-pointer [&_summary]:p-[.6rem_0] [&_summary]:w-fit [&_summary:focus-visible]:[outline:2px_solid_var(--color-accent)] [&_summary:focus-visible]:outline-offset-[3px] [&_>_div]:overflow-auto [&_>_div]:max-h-60 [&_table]:w-full [&_table]:border-collapse [&_table]:tabular-nums [&_th]:p-[.5rem] [&_th]:text-left [&_th]:border-b [&_th]:border-solid [&_th]:border-b-line [&_td]:p-[.5rem] [&_td]:text-left [&_td]:border-b [&_td]:border-solid [&_td]:border-b-line [&_caption]:text-left [&_caption]:py-[.35rem]"}>
      <div><table><caption>{props.label}</caption><thead><tr><th scope="col">Período</th>{props.series.map((series) => <th scope="col" key={series.key}>{series.label}</th>)}</tr></thead>
        <tbody>{props.data.map((row, index) => <tr key={`${row.label}:${index}`}><th scope="row">{row.label}</th>{props.series.map((series) => <td key={series.key}>{row[series.key] == null ? 'Sem medição' : Number(row[series.key]).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td>)}</tr>)}</tbody>
      </table></div>
    </div>}
    </div>
  </div>;
}
