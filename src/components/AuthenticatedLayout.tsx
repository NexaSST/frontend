import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { Building2, ShieldCheck } from 'lucide-react';
import { sileo } from 'sileo';
import { AccountMenu } from './AccountMenu.js';
import { apiResponse } from '../lib/api.js';
import { sessionQueryOptions } from '../lib/session.js';

export function AuthenticatedLayout() {
  const { data: session } = useSuspenseQuery(sessionQueryOptions);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    try {
      await apiResponse('v1/auth/logout', { method: 'post' }, false);
      queryClient.clear();
      await navigate({ to: '/login', search: { redirect: undefined } });
    } catch {
      sileo.error({ title: 'Não foi possível sair', description: 'Tente novamente. Sua sessão continua protegida.' });
    }
  }

  return (
    <div className="app-frame">
      <header className="app-header">
        <Link className="brand" to={session.kind === 'platform' ? '/platform' : '/app'}>
          <span className="brand-mark" aria-hidden="true"><ShieldCheck size={19} /></span>
          <span>NexaSST</span>
        </Link>
        <div className="session-summary">
          <span className="session-scope"><Building2 size={16} />{session.kind === 'platform' ? 'Plataforma Master' : session.context.company.name}</span>
          <AccountMenu session={session} onSignOut={signOut} />
        </div>
      </header>
      <main className="app-content"><Outlet /></main>
    </div>
  );
}
