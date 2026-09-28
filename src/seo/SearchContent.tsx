import { guides, searchQuestions, siteDescription, siteTitle, siteUrl, sources } from './content.js';

export function SearchContent() {
  return <>
    <section className="landing-v0__faq" id="guias" aria-labelledby="guides-title">
      <div><span className="landing-v0__eyebrow">Guias de segurança do trabalho</span><h2 id="guides-title">Organize a rotina antes de escolher a ferramenta.</h2></div>
      <div className="search-guides">{guides.map((guide) => <article key={guide.slug}><h3><a href={`/guias/${guide.slug}/`}>{guide.title}</a></h3><p>{guide.description}</p></article>)}</div>
    </section>
    <section className="landing-v0__faq" aria-labelledby="search-title">
      <div><span className="landing-v0__eyebrow">Dúvidas sobre a rotina de SST</span><h2 id="search-title">Treinamentos, inspeções e riscos: por onde começar?</h2></div>
      <div>{searchQuestions.map(([question, answer]) => {
        const guide = guides.find((item) => item.faq?.[0] === question);
        return <details key={question}><summary>{question}</summary><p>{answer}</p>{guide && <p><a href={`/guias/${guide.slug}/`}>Veja o guia completo</a></p>}</details>;
      })}
        <p className="search-sources">Fontes oficiais: <a href={sources.cbo}>CBO do MTE</a>, <a href={sources.nr17}>NR-17</a> e <a href={sources.nr33}>NR-33</a>.</p>
      </div>
    </section>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'NexaSST', url: siteUrl, logo: `${siteUrl}/brand/nexasst-symbol-flat.png`, description: siteDescription },
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'NexaSST', url: siteUrl, inLanguage: 'pt-BR', publisher: { '@id': `${siteUrl}/#organization` } },
      { '@type': 'WebPage', '@id': `${siteUrl}/#webpage`, url: `${siteUrl}/`, name: siteTitle, description: siteDescription, inLanguage: 'pt-BR', isPartOf: { '@id': `${siteUrl}/#website` } },
      { '@type': 'FAQPage', mainEntity: searchQuestions.map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })) },
    ] }).replace(/</g, '\\u003c') }} />
  </>;
}
