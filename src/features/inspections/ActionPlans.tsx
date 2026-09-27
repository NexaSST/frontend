import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { sileo } from "sileo";
import { apiJson } from "../../lib/api.js";
import { Button, Input, Select, Textarea } from "../../components/ui/index.js";
import { DataTable, FormModal, Field, ListToolbar, QueryState, StatusBadge, useAllRows } from "../shared.js";
import type { Props, ActionPlan } from "./types.js";
import { base } from "./api.js";
export function ActionPlans({ scope }: Omit<Props, 'tab'>) {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<ActionPlan | null>(null);
  const endpoint = `${base(scope)}/inspection-action-plans`;
  const query = useQuery({ queryKey: ['inspection-action-plans', endpoint, status], queryFn: () => apiJson<ActionPlan[]>(endpoint, { searchParams: status ? { status } : undefined }) });
  const people = useAllRows<{ id: string; name: string }>('inspection-action-plan-responsibles', `${base(scope)}/inspection-action-plan-responsibles`);
  const form = useForm<{ correctiveAction: string; responsiblePersonId: string; dueOn: string; status: ActionPlan['status']; completionNote: string }>({
    defaultValues: { correctiveAction: '', responsiblePersonId: '', dueOn: '', status: 'pending', completionNote: '' },
  });
  useEffect(() => { if (selected) form.reset({ correctiveAction: selected.correctiveAction ?? '', responsiblePersonId: selected.responsiblePersonId ?? '',
    dueOn: selected.dueOn ?? '', status: selected.status, completionNote: selected.completionNote ?? '' }); }, [selected, form]);
  const save = useMutation({ mutationFn: (values: { correctiveAction: string; responsiblePersonId: string; dueOn: string; status: ActionPlan['status']; completionNote: string }) => apiJson<ActionPlan>(`${endpoint}/${selected!.id}`, { method: 'patch', json: {
    expectedRowVersion: selected!.rowVersion, correctiveAction: values.correctiveAction || null, responsiblePersonId: values.responsiblePersonId || null,
    dueOn: values.dueOn || null, status: values.status, completionNote: values.completionNote || null,
  } }), onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['inspection-action-plans'] }); setSelected(null); sileo.success({ title: 'Plano de ação atualizado' }); },
    onError: () => sileo.error({ title: 'Não foi possível atualizar o plano de ação' }) });
  return <div className="resource-layout"><section className="resource-main"><ListToolbar value="" onChange={() => undefined}><Select aria-label="Filtrar planos por status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option><option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></Select></ListToolbar><QueryState loading={query.isLoading} error={query.isError}><DataTable columns={['Ativo', 'Não conformidade', 'Responsável', 'Prazo', 'Situação']} rows={(query.data ?? []).map((plan) => [<strong>{plan.assetCode}</strong>, <span>{plan.title}<small className="cell-detail">{plan.comment ?? 'Sem comentário'}</small></span>, plan.responsibleName ?? 'Não atribuído', plan.dueOn ?? 'Sem prazo', <StatusBadge value={plan.status} />])} keyOf={(index) => query.data![index]!.id} renderActions={(index) => <Button variant="ghost" size="sm" onClick={() => setSelected(query.data![index]!)}>Gerenciar</Button>} empty="Nenhuma não conformidade exige tratamento neste filtro." /></QueryState></section>{selected && <FormModal title={`Plano de ação · ${selected.assetCode}`} description={selected.title} onClose={() => setSelected(null)}><form className="form-stack" onSubmit={form.handleSubmit((values) => save.mutate(values))}><Field label="Ação corretiva"><Textarea rows={5} {...form.register('correctiveAction')} /></Field><Field label="Responsável"><Select {...form.register('responsiblePersonId')}><option value="">Não atribuído</option>{people.data?.rows.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</Select></Field><Field label="Prazo"><Input type="date" {...form.register('dueOn')} /></Field><Field label="Situação"><Select {...form.register('status')}><option value="pending">Pendente</option><option value="in_progress">Em andamento</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></Select></Field><Field label="Registro da conclusão"><Textarea rows={4} {...form.register('completionNote')} /></Field><Button type="submit" loading={save.isPending}>Salvar plano de ação</Button></form></FormModal>}</div>;
}
