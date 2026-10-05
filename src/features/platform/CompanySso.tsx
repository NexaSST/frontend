import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { Button, Input, SectionTitle } from '../../components/ui/index.js';
import { apiJson } from '../../lib/api.js';

interface SsoStatus { configured: boolean; tenantId: string | null; status: 'pending' | 'active' | null; activatedAt: string | null }
export function CompanySso({ companyId }: { companyId: string }) {
  const qc = useQueryClient();
  const [tenantId, setTenantId] = useState('');
  const status = useQuery({ queryKey: ['company-sso', companyId], queryFn: () => apiJson<SsoStatus>(`v1/platform/companies/${companyId}/sso`) });
  const configure = useMutation({ mutationFn: () => apiJson(`v1/platform/companies/${companyId}/sso`, { method: 'put', json: { tenantId } }),
    onSuccess: async () => { setTenantId(''); await qc.invalidateQueries({ queryKey: ['company-sso', companyId] }); sileo.success({ title: 'Tenant salvo para ativação' }); },
    onError: () => sileo.error({ title: 'Não foi possível salvar o tenant', description: 'Confira o ID e se ele já está associado a outra empresa.' }) });
  const activate = useMutation({ mutationFn: () => apiJson(`v1/platform/companies/${companyId}/sso/activate`, { method: 'post' }),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ['company-sso', companyId] }); sileo.success({ title: 'Login Microsoft ativado' }); },
    onError: () => sileo.error({ title: 'Não foi possível ativar o login Microsoft' }) });
  function submit(event: FormEvent) { event.preventDefault(); configure.mutate(); }
  return <section className={"border border-solid border-line rounded-panel bg-surface shadow-panel min-w-0 p-6 max-[520px]:p-[1.1rem] mt-5 [&_code]:wrap-anywhere"}>
    <SectionTitle title="Login Microsoft" description="Associe um tenant Entra a esta empresa. Cada pessoa mantém os papéis e filiais concedidos no NexaSST." />
    {status.isLoading && <p>Carregando configuração…</p>}
    {status.isError && <p className={"error-state text-danger text-[0.8rem]"}>Não foi possível consultar o login Microsoft.</p>}
    {status.data && <>
      <p><strong>Estado:</strong> {status.data.status === 'active' ? 'Ativo' : status.data.status === 'pending' ? 'Pendente de ativação' : 'Não configurado'}</p>
      {status.data.tenantId && <p><strong>Tenant atual:</strong> <code>{status.data.tenantId}</code></p>}
      {!status.data.configured && <p className={"text-muted text-[0.86rem] leading-[1.55]"}>Configure o aplicativo Entra e o segredo no servidor para liberar este recurso.</p>}
      {status.data.configured && <>
        <form className={"flex items-end gap-3 flex-wrap m-[1rem_0] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:flex-[1_1_18rem] [&_label]:text-[0.86rem] [&_label]:font-bold"} onSubmit={submit}>
          <label>ID do tenant Microsoft Entra<Input value={tenantId} onChange={(event) => setTenantId(event.target.value)}
            placeholder="00000000-0000-0000-0000-000000000000" required pattern="[0-9a-fA-F-]{36}" /></label>
          <Button type="submit" loading={configure.isPending}>{status.data.tenantId ? 'Alterar tenant' : 'Salvar tenant'}</Button>
        </form>
        <p className={"text-muted text-[0.86rem] leading-[1.55]"}>Ao trocar o tenant, vínculos Microsoft e sessões desta empresa são revogados. Os usuários continuam com a senha NexaSST.</p>
        {status.data.status === 'pending' && <div className={"max-w-3xl mt-5 pt-5 border-t border-solid border-t-line"}>
          <p>Antes de ativar, confirme no Entra: aplicativo multiempresa, URI de retorno <code>/v1/auth/microsoft/callback</code>, consentimento de TI e ID do tenant acima.</p>
          <Button onClick={() => activate.mutate()} loading={activate.isPending}>Confirmar e ativar</Button>
        </div>}
      </>}
    </>}
  </section>;
}
