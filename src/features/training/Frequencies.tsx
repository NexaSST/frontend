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
  return <div className="resource-layout training-resource"><section className="resource-main">
    <aside className="training-frequency-notice" aria-label="Sobre o catálogo de frequências">
      <Info size={18} aria-hidden="true" />
      <div><strong>Catálogo compartilhado</strong><p>As frequências valem para todas as filiais. Somente usuários com permissão corporativa podem criar ou editar frequências.</p></div>
    </aside>
    <ListToolbar value={search.q} onChange={(q) => setSearch({ q, page: 1 })} createLabel="Nova frequência" onCreate={canManage ? () => { setEditing(null); setName(''); setDays(''); setNoFrequency(false); setSearch({ action: 'new' }); } : undefined} />
    <QueryState loading={query.isLoading || access.isLoading} error={query.isError || access.isError}><DataTable columns={['Frequência', 'Intervalo']} rows={(query.data?.rows ?? []).map((row) => [<strong>{row.name}</strong>, row.days === null ? 'Sem recorrência' : `${row.days} dias`])} keyOf={(index) => query.data!.rows[index]!.id}
      renderActions={canManage ? (index) => <Button variant="ghost" size="sm" onClick={() => { const row = query.data!.rows[index]!; setEditing(row); setName(row.name); setDays(String(row.days ?? '')); setNoFrequency(row.days === null); setSearch({ action: 'edit' }); }}>Editar</Button> : undefined} />
      <PagedFooter data={query.data} onPage={(page) => setSearch({ page })} /></QueryState>
  </section>{canManage && (search.action === 'new' || search.action === 'edit') && <FormModal title={editing ? 'Editar frequência' : 'Nova frequência'} description="Alterações valem para novas realizações. Vencimentos já registrados serão preservados." onClose={() => setSearch({ action: undefined })}>
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); save.mutate(); }}><Field label="Nome da frequência"><Input aria-label="Nome da frequência" required maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <label className="training-checkbox"><input type="checkbox" checked={noFrequency} onChange={(event) => setNoFrequency(event.target.checked)} /> Sem frequência</label>
      {!noFrequency && <Field label="Intervalo em dias"><Input aria-label="Intervalo em dias" type="number" min={1} max={36500} step={1} required value={days} onChange={(event) => setDays(event.target.value)} /></Field>}
      <Button type="submit" loading={save.isPending} disabled={!name.trim()}>Salvar frequência</Button></form>
  </FormModal>}</div>;
}
