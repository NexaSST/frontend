import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sileo } from 'sileo';
import { z } from 'zod';
import { Button, FormField, Input } from '../components/ui/index.js';
import { apiJson } from '../lib/api.js';
import { sessionQueryOptions } from '../lib/session.js';

const schema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
});
type LoginInput = z.infer<typeof schema>;

export function LoginPage() {
  const [kind, setKind] = useState<'company' | 'platform'>('company');
  const [microsoftConfigured, setMicrosoftConfigured] = useState(false);
  const [microsoftBusy, setMicrosoftBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(schema) });
  useEffect(() => { apiJson<{ configured: boolean }>('v1/auth/microsoft/availability').then((result) => setMicrosoftConfigured(result.configured)).catch(() => undefined); }, []);
  async function signInWithMicrosoft() {
    const email = getValues('email')?.trim();
    if (!email || !z.string().email().safeParse(email).success) {
      sileo.error({ title: 'Informe seu e-mail NexaSST', description: 'Use o campo de e-mail acima para localizar sua empresa.' }); return;
    }
    setMicrosoftBusy(true);
    try {
      const result = await apiJson<{ authorizationUrl: string }>('v1/auth/microsoft/login/start', { method: 'post', json: { email, returnPath: search.redirect ?? '/app' } });
      window.location.assign(result.authorizationUrl);
    } catch { sileo.error({ title: 'Acesso Microsoft indisponível', description: 'Confira se sua conta está vinculada e se a empresa ativou o login Microsoft.' }); setMicrosoftBusy(false); }
  }

  const submit = handleSubmit(async (values) => {
    try {
      await apiJson(`v1/auth/${kind}/web/login`, { method: 'post', json: values });
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      const session = await queryClient.fetchQuery(sessionQueryOptions);
      if (search.redirect) {
        window.location.assign(search.redirect);
        return;
      }
      if (session.kind === 'platform') {
        await navigate({ to: '/platform' });
        return;
      }
      const scopedBranchIds = [...new Set(session.context.roles.map((role) => role.branchId).filter((branchId): branchId is string => Boolean(branchId)))];
      const hasCompanyWideRole = session.context.roles.some((role) => role.branchId === null);
      if (!hasCompanyWideRole && scopedBranchIds.length === 1) {
        await navigate({ to: '/workspace/$companyId/$branchId', params: { companyId: session.companyId, branchId: scopedBranchIds[0]! }, search: { periodDays: 30, categoryId: undefined, activityDomain: undefined, trainingPage: 1, inspectionsPage: 1, aprPage: 1 } });
        return;
      }
      await navigate({ to: '/app', search: { branchId: undefined, periodDays: undefined } });
    } catch {
      sileo.error({ title: 'Acesso não autorizado', description: 'Confira e-mail, senha e o tipo de acesso selecionado.' });
    }
  });

  return (
    <main className="login-page">
      <section className="login-intro" aria-label="NexaSST, segurança do trabalho">
        <div className="login-intro__copy">
          <h1>Segurança começa com clareza.</h1>
          <p>Um lugar para cuidar de pessoas, operações e do que importa em cada jornada de trabalho.</p>
        </div>
        <span className="login-intro__caption">NexaSST · Saúde e segurança do trabalho</span>
      </section>
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-panel__content">
          <div className="login-panel__brand">
            <img src="/brand/nexasst-symbol-flat.png" alt="" width="48" height="48" />
            <span>NexaSST</span>
          </div>
          <div className="login-panel__heading">
            <h2 id="login-title">Boas-vindas de volta</h2>
            <p>Entre com seu e-mail e senha para continuar.</p>
          </div>
          <div className="segmented-control" role="group" aria-label="Tipo de acesso">
            <Button variant="ghost" aria-pressed={kind === 'company'} onClick={() => setKind('company')}>Empresa</Button>
            <Button variant="ghost" aria-pressed={kind === 'platform'} onClick={() => setKind('platform')}>Master</Button>
          </div>
          <form className="form-stack login-form" onSubmit={submit} noValidate>
            <FormField label="E-mail" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="voce@empresa.com.br" {...register('email')} invalid={Boolean(errors.email)} /></FormField>
            <FormField label="Senha" error={errors.password?.message}><Input type="password" autoComplete="current-password" placeholder="Sua senha" {...register('password')} invalid={Boolean(errors.password)} /></FormField>
            <Button type="submit" loading={isSubmitting} trailingIcon={<ArrowRight size={18} />}>Entrar</Button>
          </form>
          {kind === 'company' && <Link className="login-recovery" to="/forgot-password">Esqueceu sua senha?</Link>}
          {new URLSearchParams(window.location.search).get('sso') === 'error' && <p className="error-state" role="alert">O acesso Microsoft não foi concluído. Confira a conta escolhida e tente novamente.</p>}
          <div className="login-divider"><span>ou continue com</span></div>
          <button className="login-microsoft" type="button" disabled={kind === 'platform' || !microsoftConfigured || microsoftBusy} onClick={signInWithMicrosoft}>
            <span className="login-microsoft__icon" aria-hidden="true"><i /><i /><i /><i /></span>
            <span>{microsoftBusy ? 'Conectando…' : 'Entrar com Microsoft'}</span>
            {!microsoftConfigured && <span className="login-microsoft__soon">Em breve</span>}
          </button>
        </div>
        <p className="login-panel__footnote">Acesso protegido para sua equipe.</p>
      </section>
    </main>
  );
}
