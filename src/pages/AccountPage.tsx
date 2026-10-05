import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { accountInitials } from '../components/AccountMenu.js';
import { sessionQueryOptions } from '../lib/session.js';

export function AccountPage() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  const name = session.kind === 'company' && session.identity.name.trim() ? session.identity.name : 'Conta da plataforma';

  return <div className={"workspace w-[min(92vw,82rem)] m-[0_auto] p-[3.5rem_0_5rem] max-[520px]:w-[min(92vw,82rem)] max-[520px]:pt-8 max-w-3xl"}>
    <header className={"account-page__heading mb-6 [&_p]:text-muted"}>
      <h1>Perfil e conta</h1>
      <p>Seus dados de acesso ao NexaSST.</p>
    </header>
    <section className={"border border-solid border-line rounded-panel bg-surface shadow-panel min-w-0 p-6 max-[520px]:p-[1.1rem] grid gap-6"} aria-label="Dados da conta">
      <div className={"[&_span:not(.account-avatar)]:text-muted [&_span:not(.account-avatar)]:text-[0.84rem] flex items-center gap-[0.9rem] [&_h2]:m-[0_0_0.1rem]"}><span className={"account-avatar grid flex-none place-items-center rounded-[50%] text-white bg-accent-strong font-extrabold tracking-[0.02em] w-[3.4rem] h-[3.4rem] text-[1rem]"} aria-hidden="true">{accountInitials(session)}</span><div><h2>{name}</h2><span>{session.kind === 'platform' ? 'Administrador da plataforma' : session.context.company.name}</span></div></div>
      <dl className={"grid gap-0 m-0 border-t border-solid border-t-line [&_>_div]:grid [&_>_div]:grid-cols-[8rem_minmax(0,1fr)] [&_>_div]:gap-3 [&_>_div]:p-[0.85rem_0] [&_>_div]:border-b [&_>_div]:border-solid [&_>_div]:border-b-line [&_dt]:flex [&_dt]:items-center [&_dt]:gap-2 [&_dt]:text-muted [&_dt]:text-[0.86rem] [&_dd]:min-w-0 [&_dd]:m-0 [&_dd]:wrap-anywhere [&_dd]:text-[0.9rem] [&_dd]:font-[650] max-[520px]:[&_>_div]:grid-cols-[1fr] max-[520px]:[&_>_div]:gap-[0.35rem]"}><div><dt><Mail size={17} aria-hidden="true" />E-mail</dt><dd>{session.email}</dd></div>{session.kind === 'company' && <div><dt><UserRound size={17} aria-hidden="true" />Nome</dt><dd>{session.identity.name}</dd></div>}</dl>
      {session.kind === 'company' && <Link className={"inline-flex items-center justify-self-start gap-2 text-accent-strong font-bold underline underline-offset-[0.2em]"} to="/account/microsoft">Configurar conta Microsoft <ArrowRight size={17} aria-hidden="true" /></Link>}
    </section>
  </div>;
}
