import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { accountInitials } from '../components/AccountMenu.js';
import { sessionQueryOptions } from '../lib/session.js';

export function AccountPage() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  const name = session.kind === 'company' && session.identity.name.trim() ? session.identity.name : 'Conta da plataforma';

  return <div className="workspace account-page">
    <header className="account-page__heading">
      <h1>Perfil e conta</h1>
      <p>Seus dados de acesso ao NexaSST.</p>
    </header>
    <section className="content-section account-page__section" aria-label="Dados da conta">
      <div className="account-page__person"><span className="account-avatar account-avatar--large" aria-hidden="true">{accountInitials(session)}</span><div><h2>{name}</h2><span>{session.kind === 'platform' ? 'Administrador da plataforma' : session.context.company.name}</span></div></div>
      <dl className="account-page__details"><div><dt><Mail size={17} aria-hidden="true" />E-mail</dt><dd>{session.email}</dd></div>{session.kind === 'company' && <div><dt><UserRound size={17} aria-hidden="true" />Nome</dt><dd>{session.identity.name}</dd></div>}</dl>
      {session.kind === 'company' && <Link className="account-page__link" to="/account/microsoft">Configurar conta Microsoft <ArrowRight size={17} aria-hidden="true" /></Link>}
    </section>
  </div>;
}
