import { useState } from 'react';
import { Info } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { apiJson } from '../../lib/api.js';
import { Button, Input } from '../../components/ui/index.js';
import { DataTable, Field, FormModal, ListToolbar, PagedFooter, QueryState, usePagedRows, type Scope, type ModuleSearch } from '../shared.js';
import type { Frequency } from "./types.js";
import { frequencyLabel } from "./config.js";

export { frequencyLabel };
export function Frequencies({ scope, search, setSearch }: { scope: Scope; search: ModuleSearch; setSearch: (patch: Partial<ModuleSearch>) => void }) {
  const endpoint = `v1/companies/${scope.companyId}/branches/${scope.branchId}/training-frequencies`;
  const qc = useQueryClient();
  const access = useQuery({ queryKey: ['frequency-access', endpoint], queryFn: () => apiJson<{ canManage: boolean }>(`${endpoint}/access`) });
  const query = usePagedRows<Frequency>('training-frequencies', endpoint, search);
  const [editing, setEditing] = useState<Frequency | null>(null);
  const [name, setName] = useState('');
  const [days, setDays] = useState('');
  const [noFrequency, setNoFrequency] = useState(false);
  const canManage = access.data?.canManage === true;
  const save = useMutation({ mutationFn: () => apiJson(editing ? `${endpoint}/${editing.id}` : endpoint, {
    method: editing ? 'patch' : 'post', json: { name: name.trim(), days: noFrequency ? null : Number(days) },
  }), onSuccess: async () => {
    await qc.invalidateQueries(); setEditing(null); setSearch({ action: undefined });
    sileo.success({ title: 'Frequência salva para a empresa' });
  }, onError: (error: Error) => sileo.error({ title: 'Não foi possível salvar a frequência', description: error.message }) });
  return <div className={"resource-layout grid grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)] gap-4 items-start [&:not(:has(.editor-panel))]:grid-cols-[minmax(0,1fr)] max-[800px]:grid-cols-[1fr] [&_.table-scroll]:relative [&_.workflow-stepper_small]:max-w-full [&_.workflow-stepper_small]:whitespace-normal [&_.workflow-stepper_small]:text-center [&_.workflow-stepper_small]:wrap-anywhere [&_.form-stack_input[type='checkbox']]:flex-[0_0_1.15rem] [&_.form-stack_input[type='checkbox']]:w-[1.15rem] [&_.form-stack_input[type='checkbox']]:h-[1.15rem] [&_.form-stack_input[type='checkbox']]:min-h-0 [&_.form-stack_input[type='checkbox']]:p-0 [&_.form-stack_input[type='checkbox']]:m-0 [&_.form-stack_input[type='checkbox']]:accent-accent [&_.training-checkbox]:flex [&_.training-checkbox]:items-center [&_.training-checkbox]:gap-[.65rem] [&_.training-checkbox]:min-h-11 [&_.training-checkbox]:cursor-pointer"}><section className={"resource-main min-w-0 border border-solid border-line rounded-panel bg-surface shadow-panel p-4 max-[520px]:p-[0.85rem]"}>
    <aside className={"flex items-start gap-3 mb-4 p-[0.85rem_1rem] border border-solid border-control-border rounded-control text-accent-strong bg-accent-soft [&_>_svg]:flex-[0_0_auto] [&_>_svg]:mt-[0.15rem] [&_strong]:block [&_strong]:mb-[0.2rem] [&_strong]:text-[0.875rem] [&_strong]:leading-[1.35] [&_p]:max-w-[75ch] [&_p]:m-0 [&_p]:text-muted [&_p]:text-[0.875rem] [&_p]:leading-normal"} aria-label="Sobre o catálogo de frequências">
      <Info size={18} aria-hidden="true" />
      <div><strong>Catálogo compartilhado</strong><p>As frequências valem para todas as filiais. Somente usuários com permissão corporativa podem criar ou editar frequências.</p></div>
    </aside>
    <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })} createLabel="Nova frequência" onCreate={canManage ? () => { setEditing(null); setName(''); setDays(''); setNoFrequency(false); setSearch({ action: 'new' }); } : undefined} />
    <QueryState loading={query.isLoading || access.isLoading} error={query.isError || access.isError}><DataTable columns={['Frequência', 'Intervalo']} rows={(query.data?.rows ?? []).map((row) => [<strong>{row.name}</strong>, row.days === null ? 'Sem recorrência' : `${row.days} dias`])} keyOf={(index) => query.data!.rows[index]!.id}
      renderActions={canManage ? (index) => <Button variant="ghost" size="sm" onClick={() => { const row = query.data!.rows[index]!; setEditing(row); setName(row.name); setDays(String(row.days ?? '')); setNoFrequency(row.days === null); setSearch({ action: 'edit' }); }}>Editar</Button> : undefined} />
      <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} /></QueryState>
  </section>{canManage && (search.action === 'new' || search.action === 'edit') && <FormModal title={editing ? 'Editar frequência' : 'Nova frequência'} description="Alterações valem para novas realizações. Vencimentos já registrados serão preservados." onClose={() => setSearch({ action: undefined })}>
    <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><Field label="Nome da frequência"><Input aria-label="Nome da frequência" required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <label className={"training-checkbox"}><input type="checkbox" checked={noFrequency} onChange={(event) => setNoFrequency(event.target.checked)} /> Sem frequência</label>
      {!noFrequency && <Field label="Intervalo em dias"><Input aria-label="Intervalo em dias" type="number" min={1} max={36500} step={1} required value={days} onChange={(event) => setDays(event.target.value)} /></Field>}
      <Button type="submit" loading={save.isPending} disabled={!name.trim()}>Salvar frequência</Button></form>
  </FormModal>}</div>;
}
