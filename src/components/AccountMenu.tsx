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
    label={<span className="account-avatar" aria-hidden="true">{accountInitials(session)}</span>}
    triggerAriaLabel={`Abrir menu da conta de ${name}`}
    triggerClassName="account-menu__trigger"
    menuClassName="account-menu__panel"
  >
    <div className="account-menu__identity" role="presentation">
      <strong>{name}</strong>
      <span title={session.email}>{session.email}</span>
    </div>
    <div className="account-menu__actions" role="presentation">
      <DropdownItem className="account-menu__item" onClick={() => { void navigate({ to: '/account' }); }}><UserRound size={17} aria-hidden="true" />Perfil e conta</DropdownItem>
      <DropdownItem className="account-menu__item danger" onClick={() => { void onSignOut(); }}><LogOut size={17} aria-hidden="true" />Sair</DropdownItem>
    </div>
  </DropdownMenu>;
}
