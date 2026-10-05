import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { sileo } from 'sileo';
import { Button, Input } from '../components/ui/index.js';
import { apiJson } from '../lib/api.js';

function Frame({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className={"grid min-h-dvh place-items-center p-6 bg-canvas"}><div className={"w-[min(100%,31rem)] p-[clamp(1.5rem,4vw,2.75rem)] border border-solid border-line rounded-panel bg-surface [&_h1]:m-[0_0_0.75rem] [&_h1]:text-[clamp(1.8rem,4vw,2.4rem)] [&_h1]:tracking-[-0.03em] [&_>_p]:m-[0_0_1.75rem] [&_>_p]:text-muted [&_>_p]:leading-[1.6] [&_>_button]:w-full [&_>_button]:mb-3"}>
    <Link className={"flex items-center gap-2 w-fit mb-8 text-ink font-extrabold text-[1.25rem] no-underline"} to="/login" search={{ redirect: undefined }}><img src="/brand/nexasst-symbol-flat.png" alt="" width="42" height="42" />NexaSST</Link>
    <h1>{title}</h1><p>{description}</p>{children}
    <Link className={"block w-fit mt-6 text-accent-strong underline underline-offset-[0.2em] focus-visible:[outline:3px_solid_var(--color-accent)] focus-visible:outline-offset-[3px]"} to="/login" search={{ redirect: undefined }}>Voltar ao login</Link>
  </div></main>;
}
export function ActivatePage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const ticket = params.get('ticket');
  const [preview, setPreview] = useState<{ email: string; companyName: string; microsoftAvailable: boolean } | null>(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (token && !ticket) apiJson<typeof preview>(`v1/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(setPreview).catch(() => setError('O convite expirou ou foi revogado. Peça um novo convite ao administrador.'));
  }, [token, ticket]);
  async function activate(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (ticket) await apiJson('v1/auth/microsoft/invite/activate', { method: 'post', json: { ticket, password } });
      else await apiJson('v1/invitations/accept', { method: 'post', json: { token, password } });
      setDone(true);
    } catch { setError('Não foi possível ativar a conta. Confira o link e tente novamente.'); }
    finally { setBusy(false); }
  }
  async function microsoft() {
    if (!token) return;
    setBusy(true); setError('');
    try {
      const result = await apiJson<{ authorizationUrl: string }>('v1/auth/microsoft/invite/start', { method: 'post', json: { token } });
      window.location.assign(result.authorizationUrl);
    } catch { setError('Não foi possível iniciar o acesso Microsoft. Tente novamente ou crie sua senha.'); setBusy(false); }
  }
  return <Frame title={done ? 'Conta ativada' : 'Ative sua conta'} description={done
    ? 'Você já pode entrar. Confirme seu e-mail pelo link enviado para poder assinar APRs. Se o link não chegar, solicite outro na página da conta.'
    : ticket ? 'Sua identidade Microsoft foi confirmada. Crie também uma senha NexaSST para o acesso local e assinaturas.'
      : preview ? `Convite de ${preview.companyName} para ${preview.email}.` : 'Abra o link recebido por e-mail para continuar.'}>
    {!done && (ticket || preview) && <>
      {preview?.microsoftAvailable && <><Button type="button" variant="secondary" onClick={microsoft} disabled={busy}>Continuar com Microsoft</Button><p className={"text-muted text-[0.86rem] leading-[1.55]"}>Sua conta Microsoft será vinculada após você criar uma senha NexaSST.</p></>}
      <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={activate}>
        <label>Senha NexaSST<Input type="password" autoComplete="new-password" value={password} minLength={12} maxLength={1024} required onChange={(event) => setPassword(event.target.value)} /></label>
        <p className={"text-muted text-[0.86rem] leading-[1.55]"}>Use pelo menos 12 caracteres.</p>
        <Button type="submit" loading={busy}>Ativar conta</Button>
      </form>
    </>}
    {error && <p className={"error-state text-danger text-[0.8rem]"} role="alert">{error}</p>}
  </Frame>;
}

export function VerifyEmailPage() {
  const params = new URLSearchParams(window.location.search);
  const [message, setMessage] = useState('Confirmando seu e-mail…');
  useEffect(() => {
    const token = params.get('token');
    if (!token) { setMessage('Link inválido. Solicite uma nova confirmação na sua conta.'); return; }
    apiJson('v1/auth/email/verify', { method: 'post', json: { token } })
      .then(() => setMessage('E-mail confirmado. Você já pode usar todas as funções da sua conta.'))
      .catch(() => setMessage('O link expirou ou já foi usado. Solicite uma nova confirmação na sua conta.'));
  }, []);
  return <Frame title="Confirmação de e-mail" description={message}><></></Frame>;
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    try { await apiJson('v1/auth/password-reset/request', { method: 'post', json: { email } }); setDone(true); }
    catch { sileo.error({ title: 'Não foi possível solicitar o link', description: 'Tente novamente em alguns instantes.' }); }
    finally { setBusy(false); }
  }
  return <Frame title="Recuperar senha" description={done ? 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.' : 'Informe o e-mail da sua conta NexaSST.'}>
    {!done && <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={submit}><label>E-mail<Input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label><Button type="submit" loading={busy}>Enviar link</Button></form>}
  </Frame>;
}

export function ResetPasswordPage() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token'); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true);
    try { await apiJson('v1/auth/password-reset/confirm', { method: 'post', json: { token, password } }); setDone(true); }
    catch { sileo.error({ title: 'Link inválido ou expirado', description: 'Solicite um novo link de recuperação.' }); }
    finally { setBusy(false); }
  }
  return <Frame title="Nova senha" description={done ? 'Senha atualizada. Entre novamente em sua conta.' : 'Crie uma senha NexaSST com pelo menos 12 caracteres.'}>
    {!done && token && <form className={"grid gap-[0.8rem] [&_label]:grid [&_label]:gap-[0.4rem] [&_label]:text-muted [&_label]:text-[0.78rem] [&_label]:font-[750] [&_input:not([type='checkbox']):not([type='hidden'])]:w-full [&_input:not([type='checkbox']):not([type='hidden'])]:min-h-11 [&_input:not([type='checkbox']):not([type='hidden'])]:p-[0.65rem_0.75rem] [&_input:not([type='checkbox']):not([type='hidden'])]:border [&_input:not([type='checkbox']):not([type='hidden'])]:border-solid [&_input:not([type='checkbox']):not([type='hidden'])]:border-control-border [&_input:not([type='checkbox']):not([type='hidden'])]:rounded-control [&_input:not([type='checkbox']):not([type='hidden'])]:text-ink [&_input:not([type='checkbox']):not([type='hidden'])]:bg-white [&_input[aria-invalid='true']]:border-danger [&_.ui-checkbox-field]:flex [&_.ui-checkbox-field]:items-center [&_.ui-checkbox-field]:justify-between [&_.ui-checkbox-field]:gap-3 [&_.ui-checkbox-field]:w-full [&_.ui-checkbox-field]:min-h-10 [&_.ui-checkbox-field]:text-ink [&_.ui-checkbox-field]:cursor-pointer"} onSubmit={submit}><label>Nova senha<Input type="password" autoComplete="new-password" minLength={12} maxLength={1024} required value={password} onChange={(event) => setPassword(event.target.value)} /></label><Button type="submit" loading={busy}>Salvar nova senha</Button></form>}
    {!token && <p className={"error-state text-danger text-[0.8rem]"}>Link inválido.</p>}
  </Frame>;
}

export function MicrosoftAccountPage() {
  const [status, setStatus] = useState<{ available: boolean; linked: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { apiJson<{ available: boolean; linked: boolean }>('v1/auth/microsoft/link').then(setStatus)
    .catch(() => sileo.error({ title: 'Não foi possível consultar a conta Microsoft' })); }, []);
  async function link() {
    setBusy(true);
    try { const result = await apiJson<{ authorizationUrl: string }>('v1/auth/microsoft/link/start', { method: 'post', json: {} }); window.location.assign(result.authorizationUrl); }
    catch { sileo.error({ title: 'Não foi possível vincular a conta Microsoft' }); setBusy(false); }
  }
  return <div className={"workspace w-[min(92vw,82rem)] m-[0_auto] p-[3.5rem_0_5rem] max-[520px]:w-[min(92vw,82rem)] max-[520px]:pt-8"}><section className={"border border-solid border-line rounded-panel bg-surface shadow-panel min-w-0 p-6 max-[520px]:p-[1.1rem] max-w-172 [&_.ui-button]:mt-3"}><h1>Conta Microsoft</h1>
    <p>{status?.linked ? 'Sua conta Microsoft está vinculada ao NexaSST.' : status?.available ? 'Vincule a conta Microsoft ao seu acesso já autorizado.' : 'O login Microsoft ainda não foi ativado para sua empresa.'}</p>
    {status?.available && !status.linked && <Button onClick={link} loading={busy}>Vincular conta Microsoft</Button>}
    <p className={"text-muted text-[0.86rem] leading-[1.55]"}>Sua senha NexaSST continua disponível para acesso e assinatura de APRs.</p>
    <Button variant="secondary" onClick={async () => { try { await apiJson('v1/auth/email/resend', { method: 'post' }); sileo.success({ title: 'Link de confirmação enviado' }); } catch { sileo.error({ title: 'Não foi possível enviar o link' }); } }}>Reenviar confirmação de e-mail</Button>
  </section></div>;
}
