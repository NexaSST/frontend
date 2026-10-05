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
    <div className={"app-frame min-h-screen"}>
      <header className={"app-header sticky top-0 z-10 flex items-center justify-between min-h-18 p-[0_4vw] border-b border-solid border-b-line bg-[rgb(244_242_236/94%)] [backdrop-filter:blur(12px)] max-[520px]:p-[0_1rem]"}>
        <Link className={"brand inline-flex items-center gap-[0.65rem] text-ink font-[760] tracking-tight no-underline"} to={session.kind === 'platform' ? '/platform' : '/app'}>
          <span className={"brand-mark inline-grid place-items-center w-8 h-8 rounded-[0.6rem] text-white bg-accent [&.large]:w-12 [&.large]:h-12 [&.large]:rounded-[0.85rem]"} aria-hidden="true"><ShieldCheck size={19} /></span>
          <span>NexaSST</span>
        </Link>
        <div className={"session-summary flex items-center gap-[0.85rem]"}>
          <span className={"session-scope inline-flex items-center gap-[0.4rem] text-[0.875rem] font-bold max-[520px]:hidden"}><Building2 size={16} />{session.kind === 'platform' ? 'Plataforma Master' : session.context.company.name}</span>
          <AccountMenu session={session} onSignOut={signOut} />
        </div>
      </header>
      <main className={"app-content w-full"}><Outlet /></main>
    </div>
  );
}
