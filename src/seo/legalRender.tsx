import { renderToStaticMarkup } from 'react-dom/server';
import { legalPages, legalUpdatedAt, privacyContact } from './legalContent.js';
import type { LegalPage } from './legalContent.js';
import { siteUrl } from './content.js';

export function renderLegal(page: LegalPage) {
  return renderToStaticMarkup(
    <div className="landing-v0">
      <header className="landing-v0__header"><a className="landing-v0__brand" href="/">NexaSST</a><nav aria-label="Páginas legais"><a href="/privacidade/">Privacidade</a><a href="/termos-de-uso/">Termos de uso</a></nav></header>
      <main className="search-article legal-article">
        <nav aria-label="Caminho da página"><a href="/">Início</a> / {page.title}</nav>
        <article>
          <h1>{page.title}</h1>
          <p className="legal-article__date">Última atualização: {legalUpdatedAt}</p>
          <p className="search-answer">{page.intro}</p>
          {page.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          <p>Contato: <a href={`mailto:${privacyContact}`}>{privacyContact}</a>.</p>
          <p>Leia também: <a href={`/${page.slug === 'privacidade' ? 'termos-de-uso' : 'privacidade'}/`}>{page.slug === 'privacidade' ? 'Termos e Condições de Uso' : 'Política de Privacidade'}</a>.</p>
        </article>
      </main>
      <footer className="landing-v0__footer"><a className="landing-v0__brand" href="/">NexaSST</a><div><a href="/privacidade/">Política de Privacidade</a><a href="/termos-de-uso/">Termos e Condições de Uso</a></div></footer>
    </div>,
  );
}

export function legalMarkdown(page: LegalPage) {
  const sections = page.sections.map((section) => `## ${section.title}\n\n${section.paragraphs.join('\n\n')}${section.bullets ? `\n\n${section.bullets.map((bullet) => `- ${bullet}`).join('\n')}` : ''}`).join('\n\n');
  return `# ${page.title}\n\nURL canônica: ${siteUrl}/${page.slug}/\n\nÚltima atualização: ${legalUpdatedAt}\n\n${page.intro}\n\n${sections}\n\nContato: [${privacyContact}](mailto:${privacyContact}).\n\n[Política de Privacidade](${siteUrl}/privacidade/) · [Termos e Condições de Uso](${siteUrl}/termos-de-uso/)\n`;
}

export { legalPages };
