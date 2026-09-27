import { renderToStaticMarkup } from 'react-dom/server';
import { LandingPageV0 } from '../pages/LandingPageV0.js';
import { demoUrl, guides, siteDescription, siteTitle, siteUrl } from './content.js';
import type { Guide } from './content.js';
export { guides, siteDescription, siteTitle, siteUrl };
export const renderHome = () => renderToStaticMarkup(<LandingPageV0 />);
export function renderGuide(guide: Guide) {
  const url = `${siteUrl}/guias/${guide.slug}/`;
  return renderToStaticMarkup(<div className="landing-v0"><header className="landing-v0__header"><a className="landing-v0__brand" href="/">NexaSST</a><a href="/#guias">Todos os guias</a></header>
    <main className="search-article"><nav aria-label="Caminho da página"><a href="/">Início</a> / <a href="/#guias">Guias</a></nav>
      <article><h1>{guide.title}</h1><p className="search-answer">{guide.answer}</p>{guide.sections.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
        <h2>Roteiro para organizar a rotina</h2><ul>{guide.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
        {guide.source && <p>Referência: <a href={guide.source[1]}>{guide.source[0]}</a>.</p>}
        <p>Conteúdo da equipe NexaSST · Atualizado em 27/09/2026.</p>
        <a className="landing-v0__cta" href={demoUrl}>Agendar demonstração</a>
      </article>
      <aside><h2>Continue a leitura</h2><ul>{guides.filter((item) => item.slug !== guide.slug).map((item) => <li key={item.slug}><a href={`/guias/${item.slug}/`}>{item.title}</a></li>)}</ul><a href={`${url}index.md`}>Ler em Markdown</a></aside>
    </main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', headline: guide.title, description: guide.description, url, inLanguage: 'pt-BR', dateModified: '2026-09-27', author: { '@type': 'Organization', name: 'NexaSST', url: siteUrl }, publisher: { '@type': 'Organization', name: 'NexaSST', url: siteUrl } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'NexaSST', item: `${siteUrl}/` }, { '@type': 'ListItem', position: 2, name: guide.title, item: url }] },
    ] }).replace(/</g, '\\u003c') }} />
  </div>);
}
export function guideMarkdown(guide: Guide) {
  return `# ${guide.title}\n\nURL canônica: ${siteUrl}/guias/${guide.slug}/\n\n${guide.answer}\n\n${guide.sections.map(([title, text]) => `## ${title}\n\n${text}`).join('\n\n')}\n\n## Roteiro para organizar a rotina\n\n${guide.checklist.map((item) => `- ${item}`).join('\n')}${guide.source ? `\n\nReferência: [${guide.source[0]}](${guide.source[1]})` : ''}\n\nEquipe NexaSST. Atualizado em 27/09/2026.\n\n[Demonstração](${demoUrl})\n`;
}
export const markdownIntro = `# NexaSST — gestão de segurança do trabalho\n\nURL canônica: ${siteUrl}/\n\n${siteDescription}\n\nPúblico: profissionais e equipes de SST de empresas brasileiras.\n\n`;
