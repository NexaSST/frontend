import { demoUrl } from '../../seo/content.js';
import './MarketingHeader.css';

const navigation = [
  ['produto', 'O software'],
  ['rastreabilidade', 'QR e rastreio'],
  ['comparativo', 'Na rotina'],
  ['planos', 'Planos'],
] as const;

/** Native links and disclosure also work on generated pages without JavaScript. */
export function MarketingHeader({ home = false }: { home?: boolean }) {
  const sectionUrl = (id: string) => `${home ? '' : '/'}#${id}`;
  return (
    <header className="marketing-header">
      <a className="marketing-header__brand" href={home ? '#inicio' : '/'} aria-label="NexaSST, início">
        <img src="/brand/nexasst-symbol-flat.png" alt="" width="32" height="32" />
        <span>NexaSST</span>
      </a>
      <nav className="marketing-header__navigation" aria-label="Navegação principal">
        {navigation.map(([id, label]) => <a key={id} href={sectionUrl(id)}>{label}</a>)}
      <a href="/sobre/">Sobre</a></nav>
      <div className="marketing-header__actions">
        <a className="marketing-header__login" href="/login">Entrar</a>
        <a className="marketing-header__cta" href={demoUrl} target="_blank" rel="noreferrer">Agendar demonstração</a>
      </div>
      <details className="marketing-header__mobile">
        <summary>Menu</summary>
        <nav aria-label="Navegação para celular" onClick={(event) => {
          if ((event.target as HTMLElement).closest('a')) event.currentTarget.closest('details')?.removeAttribute('open');
        }}>
          {navigation.map(([id, label]) => <a key={id} href={sectionUrl(id)}>{label}</a>)}
          <a href="/sobre/">Sobre</a><a href="/login">Entrar</a>
          <a href={demoUrl} target="_blank" rel="noreferrer">Agendar pelo WhatsApp</a>
        </nav>
      </details>
    </header>
  );
}
