import { useNavigate } from '@tanstack/react-router';
import { LogOut, UserRound } from 'lucide-react';
import { DropdownItem, DropdownMenu } from './ui/index.js';
import type { Session } from '../lib/session.js';

export function accountInitials(session: Session) {
  const source = session.kind === 'company' && session.identity.name.trim()
    ? session.identity.name
    : (session.email.split('@')[0] ?? '');
  const parts = source.trim().split(/[\s._-]+/).filter(Boolean);
  const first = parts[0] ?? 'U';
  const last = parts[parts.length - 1] ?? first;
  return (parts.length > 1 ? `${first[0] ?? 'U'}${last[0] ?? ''}` : first.slice(0, 2)).toLocaleUpperCase('pt-BR');
}

export function AccountMenu({ session, onSignOut }: { session: Session; onSignOut: () => void | Promise<void> }) {
  const navigate = useNavigate();
  const name = session.kind === 'company' && session.identity.name.trim() ? session.identity.name : 'Conta da plataforma';

  return <DropdownMenu
    label={<span className={"account-avatar grid flex-none place-items-center w-[2.2rem] h-[2.2rem] rounded-[50%] text-white bg-accent-strong text-[0.75rem] font-extrabold tracking-[0.02em]"} aria-hidden="true">{accountInitials(session)}</span>}
    triggerAriaLabel={`Abrir menu da conta de ${name}`}
    triggerClassName={"min-w-17 min-h-11 p-[0.25rem_0.45rem_0.25rem_0.25rem] rounded-[999px] gap-[0.35rem] aria-expanded:border-accent aria-expanded:bg-accent-soft"}
    menuClassName={"w-[min(19rem,calc(100vw-1rem))] p-[0.4rem]"}
  >
    <div className={"grid gap-[0.15rem] p-[0.75rem_0.7rem_0.85rem] [&_strong]:text-[0.9rem] [&_span]:wrap-anywhere [&_span]:text-muted [&_span]:text-[0.8rem]"} role="presentation">
      <strong>{name}</strong>
      <span title={session.email}>{session.email}</span>
    </div>
    <div className={"pt-[0.35rem] border-t border-solid border-t-line"} role="presentation">
      <DropdownItem className={"items-center gap-[0.65rem] min-h-[2.6rem] text-[0.86rem] font-[650] [&.danger:hover]:bg-danger-surface [&.danger:focus-visible]:bg-danger-surface"} onClick={() => { void navigate({ to: '/account' }); }}><UserRound size={17} aria-hidden="true" />Perfil e conta</DropdownItem>
      <DropdownItem className={"items-center gap-[0.65rem] min-h-[2.6rem] text-[0.86rem] font-[650] [&.danger:hover]:bg-danger-surface [&.danger:focus-visible]:bg-danger-surface danger"} onClick={() => { void onSignOut(); }}><LogOut size={17} aria-hidden="true" />Sair</DropdownItem>
    </div>
  </DropdownMenu>;
}
