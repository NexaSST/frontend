import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
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

export function LoginPage({ kind = 'company' }: { kind?: 'company' | 'platform' }) {
  const [showPassword, setShowPassword] = useState(false);
  const [microsoftConfigured, setMicrosoftConfigured] = useState(false);
  const [microsoftBusy, setMicrosoftBusy] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(schema) });
  useEffect(() => { if (kind !== 'company') return; apiJson<{ configured: boolean }>('v1/auth/microsoft/availability').then((result) => setMicrosoftConfigured(result.configured)).catch(() => undefined); }, [kind]);
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
      sileo.error({ title: 'Acesso não autorizado', description: 'Confira seu e-mail e senha.' });
    }
  });

  return (
    <main className={"login-page grid grid-cols-[minmax(0,1.04fr)_minmax(27rem,0.96fr)] w-full h-dvh m-0 overflow-hidden bg-ink max-[800px]:grid-cols-[1fr] max-[800px]:h-auto max-[800px]:min-h-dvh max-[800px]:overflow-visible"}>
      <section className={"login-intro relative flex flex-col justify-between min-h-0 overflow-hidden p-[clamp(2rem,4vw,4rem)] text-surface bg-[#13211d] bg-[url('/login/safety-helmet.webp')] bg-position-[54%_center] bg-cover bg-no-repeat [&::before]:absolute [&::before]:inset-0 [&::before]:[content:''] [&::before]:[background:linear-gradient(180deg,rgb(10_25_22/54%)_0%,transparent_49%,rgb(10_25_22/25%)_100%)] [&::before]:pointer-events-none [&_h1]:max-w-[11ch] [&_h1]:m-[0_0_1.1rem] [&_h1]:text-surface [&_h1]:text-[clamp(2.6rem,4.2vw,4.7rem)] [&_h1]:font-[650] [&_h1]:tracking-[-0.04em] [&_h1]:leading-[1.04] [&_p]:max-w-[37ch] [&_p]:m-0 [&_p]:text-accent-soft [&_p]:text-[clamp(0.95rem,1.15vw,1.1rem)] [&_p]:leading-[1.6] max-[800px]:min-h-52 max-[800px]:p-6 max-[800px]:bg-position-[center_57%] max-[800px]:[&::before]:[background:linear-gradient(90deg,rgb(10_25_22/85%),rgb(10_25_22/20%))] max-[800px]:[&_h1]:max-w-[12ch] max-[800px]:[&_h1]:text-[clamp(1.75rem,6vw,2.6rem)] max-[800px]:[&_p]:hidden"} aria-label="NexaSST, segurança do trabalho">
        <div className={"login-intro__copy relative z-1"}>
          <h1>Segurança começa com clareza.</h1>
          <p>Um lugar para cuidar de pessoas, operações e do que importa em cada jornada de trabalho.</p>
        </div>
        <span className={"login-intro__caption relative z-1 text-accent-soft text-[0.75rem] font-bold tracking-[0.01em]"}>NexaSST · Saúde e segurança do trabalho</span>
      </section>
      <section className={"login-panel [&_p]:max-w-[68ch] [&_p]:mb-0 [&_p]:text-muted [&_p]:leading-[1.6] flex flex-col min-w-0 min-h-0 overflow-y-auto p-[clamp(1.5rem,3vw,3rem)] bg-surface max-[800px]:overflow-visible max-[520px]:p-[1.6rem]"} aria-labelledby="login-title">
        <div className={"login-panel__content w-[min(100%,26rem)] m-auto max-[800px]:p-[1rem_0]"}>
          <div className={"login-panel__brand flex items-center justify-center gap-[0.45rem] mb-[clamp(1.4rem,3vh,2.3rem)] text-ink text-[1.25rem] font-extrabold tracking-[-0.03em] [&_img]:block [&_img]:w-12 [&_img]:h-12 [&_img]:object-contain"}>
            <img src="/brand/nexasst-symbol-flat.png" alt="" width="48" height="48" />
            <span>NexaSST</span>
          </div>
          <div className={"login-panel__heading mb-[clamp(1.4rem,3vh,2.5rem)] text-center [&_h2]:mb-[0.55rem] [&_h2]:text-[clamp(1.9rem,2.4vw,2.45rem)] [&_h2]:font-bold [&_h2]:tracking-[-0.035em] [&_h2]:leading-[1.1] [&_p]:text-[0.95rem]"}>
            <h2 id="login-title">Boas-vindas de volta</h2>
            <p>Entre com seu e-mail e senha para continuar.</p>
          </div>
          <form className={"grid [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer login-form gap-4 mt-6 [&_.ui-field]:text-[0.85rem] [&_.ui-control]:min-h-[3.2rem] [&_>_.ui-button]:min-h-13 [&_>_.ui-button]:mt-2"} onSubmit={submit} noValidate>
            <FormField label="E-mail" error={errors.email?.message}><Input type="email" autoComplete="email" placeholder="voce@empresa.com.br" {...register('email')} invalid={Boolean(errors.email)} /></FormField>
            <FormField label="Senha" error={errors.password?.message}><span className="relative block"><Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Sua senha" {...register('password')} invalid={Boolean(errors.password)} style={{ paddingRight: '3.25rem' }} /><button type="button" className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} aria-controls="login-password" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button></span></FormField>
            <Button type="submit" loading={isSubmitting} trailingIcon={<ArrowRight size={18} />}>Entrar</Button>
          </form>
          {kind === 'company' && <Link className={"login-recovery block w-fit m-[0.8rem_0_0_auto] text-accent-strong text-[0.85rem] underline underline-offset-[0.2em] focus-visible:[outline:3px_solid_var(--color-accent)] focus-visible:outline-offset-[3px]"} to="/forgot-password">Esqueceu sua senha?</Link>}
          {new URLSearchParams(window.location.search).get('sso') === 'error' && <p className={"error-state text-danger text-[0.8rem]"} role="alert">O acesso Microsoft não foi concluído. Confira a conta escolhida e tente novamente.</p>}
          {kind === 'company' && <><div className={"login-divider flex items-center gap-[0.9rem] m-[clamp(1.3rem,2.5vh,2rem)_0_1.25rem] text-muted text-[0.82rem] whitespace-nowrap [&::before]:h-px [&::before]:flex-1 [&::before]:[content:''] [&::before]:bg-line [&::after]:h-px [&::after]:flex-1 [&::after]:[content:''] [&::after]:bg-line"}><span>ou continue com</span></div>
          <button className={"login-microsoft flex items-center justify-center gap-[0.7rem] w-full min-h-13 p-[0.7rem_1rem] border border-solid border-line rounded-control text-muted bg-[#f8f9f6] font-[inherit] text-[0.9rem] font-bold cursor-not-allowed"} type="button" disabled={!microsoftConfigured || microsoftBusy} onClick={signInWithMicrosoft}>
            <span className={"login-microsoft__icon grid grid-cols-[repeat(2,0.55rem)] grid-rows-[repeat(2,0.55rem)] gap-[0.12rem] filter-[grayscale(0.65)] opacity-[0.7] [&_i:nth-child(1)]:bg-[#f35325] [&_i:nth-child(2)]:bg-[#81bc06] [&_i:nth-child(3)]:bg-[#05a6f0] [&_i:nth-child(4)]:bg-[#ffba08]"} aria-hidden="true"><i /><i /><i /><i /></span>
            <span>{microsoftBusy ? 'Conectando…' : 'Entrar com Microsoft'}</span>
            {!microsoftConfigured && <span className={"login-microsoft__soon ml-auto p-[0.25rem_0.45rem] rounded-[0.35rem] text-muted bg-[#e9ede8] text-[0.69rem] font-[750]"}>Em breve</span>}
          </button></>}
        </div>
        <p className={"login-panel__footnote mt-7 text-center text-[0.78rem]"}>Acesso protegido para sua equipe.</p>
      </section>
    </main>
  );
}
