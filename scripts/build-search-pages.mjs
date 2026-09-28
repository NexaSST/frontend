import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { JSDOM } from 'jsdom';
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' });
try {
  const c = await server.ssrLoadModule('/src/seo/render.tsx');
  const legal = await server.ssrLoadModule('/src/seo/legalRender.tsx');
  const template = await readFile('dist/index.html', 'utf8');
  await writeFile('dist/app.html', template);
  const escape = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const page = (title, description, path, markup, guide = false) => {
    const url = `${c.siteUrl}${path}`;
    const meta = `
<link rel="canonical" href="${url}" />
<link rel="alternate" type="text/markdown" href="${url}index.md" />
<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
<meta property="og:type" content="${guide ? 'article' : 'website'}" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:site_name" content="NexaSST" />
<meta property="og:title" content="${escape(title)}" />
<meta property="og:description" content="${escape(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${c.siteUrl}/landing/product/web-dashboard-training.png" />
<meta property="og:image:alt" content="Painel de treinamentos do NexaSST" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escape(title)}" />
<meta name="twitter:description" content="${escape(description)}" />
<meta name="twitter:image" content="${c.siteUrl}/landing/product/web-dashboard-training.png" />`;
    let html = template.replace(/<title>.*?<\/title>/s, `<title>${escape(title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${escape(description)}`)
      .replace('noindex, follow', 'index, follow, max-image-preview:large')
      .replace('</head>', `${meta}\n</head>`).replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    if (guide) html = html.replace(/<script\b[^>]*type="module"[^>]*><\/script>/g, '').replace(/<link\b[^>]*rel="modulepreload"[^>]*>/g, '');
    return html;
  };
  const home = c.renderHome();
  await writeFile('dist/index.html', page(c.siteTitle, c.siteDescription, '/', home));
  const dom = new JSDOM(home);
  const doc = dom.window.document;
  doc.querySelectorAll('script,style').forEach((el) => el.remove());
  const text = (el) => [...el.childNodes].map((node) => node.textContent).join(' ').replace(/\s+/g, ' ').trim();
  const body = [...doc.querySelectorAll('h1,h2,h3,p,summary,li,table,.landing-v0__price > div')].filter((el) => !el.closest('table') || el.tagName === 'TABLE').map((el) => {
    if (el.tagName === 'TABLE') return [...el.querySelectorAll('tr')].map((row) => [...row.cells].map(text).join(' | ')).join('\n');
    const prefix = /^H[1-3]$/.test(el.tagName) ? `${'#'.repeat(Number(el.tagName[1]))} ` : el.tagName === 'SUMMARY' ? '### ' : el.tagName === 'LI' ? '- ' : '';
    return `${prefix}${text(el)}`;
  }).join('\n\n');
  const links = [...doc.querySelectorAll('a[href]')].filter((el) => text(el)).map((el) => `- [${text(el)}](${new URL(el.getAttribute('href'), c.siteUrl).href})`);
  dom.window.close();
  await writeFile('dist/index.md', `${c.markdownIntro}${body}\n\n## Links oficiais e contato\n\n${[...new Set(links)].join('\n')}\n`);
  const paths = ['/'];
  const headers = [
    `/\n  Link: </index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="service-doc"; type="text/plain", </sitemap.xml>; rel="sitemap"; type="application/xml"`,
    `/index.md\n  Content-Type: text/markdown; charset=UTF-8\n  X-Robots-Tag: noindex\n  Link: <${c.siteUrl}/>; rel="canonical"`,
    '/llms.txt\n  Content-Type: text/plain; charset=UTF-8\n  X-Robots-Tag: noindex',
    '/app.html\n  X-Robots-Tag: noindex',
  ];
  for (const g of c.guides) {
    const path = `/guias/${g.slug}/`;
    await mkdir(`dist${path}`, { recursive: true });
    await writeFile(`dist${path}index.html`, page(`${g.title} | NexaSST`, g.description, path, c.renderGuide(g), true));
    await writeFile(`dist${path}index.md`, c.guideMarkdown(g));
    paths.push(path);
    headers.push(`${path}\n  Link: <${path}index.md>; rel="alternate"; type="text/markdown"`, `${path}index.md\n  Content-Type: text/markdown; charset=UTF-8\n  X-Robots-Tag: noindex\n  Link: <${c.siteUrl}${path}>; rel="canonical"`);
  }
  for (const legalPage of legal.legalPages) {
    const path = `/${legalPage.slug}/`;
    await mkdir(`dist${path}`, { recursive: true });
    await writeFile(`dist${path}index.html`, page(`${legalPage.title} | NexaSST`, legalPage.description, path, legal.renderLegal(legalPage), true));
    await writeFile(`dist${path}index.md`, legal.legalMarkdown(legalPage));
    paths.push(path);
    headers.push(`${path}\n  Link: <${path}index.md>; rel="alternate"; type="text/markdown"`, `${path}index.md\n  Content-Type: text/markdown; charset=UTF-8\n  X-Robots-Tag: noindex\n  Link: <${c.siteUrl}${path}>; rel="canonical"`);
  }
  await writeFile('dist/404.html', '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Página não encontrada | NexaSST</title><h1>Página não encontrada</h1><a href="/">Voltar ao NexaSST</a></html>');
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${c.siteUrl}${p}</loc><lastmod>2026-09-27</lastmod></url>`).join('\n')}\n</urlset>\n`);
  const preview = process.env.CONTEXT && process.env.CONTEXT !== 'production';
  await writeFile('dist/robots.txt', preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n\nSitemap: ${c.siteUrl}/sitemap.xml\n`);
  if (preview) headers.push('/*\n  X-Robots-Tag: noindex');
  await writeFile('dist/_headers', `${headers.join('\n\n')}\n`);
  await writeFile('dist/llms.txt', `# NexaSST\n\n> Sistema independente para equipes brasileiras de segurança do trabalho: gestão de treinamentos, inspeções e APR.\n\n## Páginas oficiais\n\n- [Landing](${c.siteUrl}/): produto, planos e contato.\n- [Landing em Markdown](${c.siteUrl}/index.md): versão textual da landing.\n${c.guides.map((g) => `- [${g.title}](${c.siteUrl}/guias/${g.slug}/index.md): ${g.description}`).join('\n')}\n- [Política de Privacidade](${c.siteUrl}/privacidade/): tratamento de dados no site, web e aplicativo.\n- [Termos e Condições de Uso](${c.siteUrl}/termos-de-uso/): condições de uso do serviço.\n\n## Limites da oferta\n\nDecisões técnicas continuam com os profissionais responsáveis. Não há vínculo com Transpetro, MTE ou SGG-SST declarado no site. Confirmar ergonomia, integrações e recursos sob projeto em demonstração. Não há garantia de conformidade ou resultado de fiscalização.\n\n[Agendar demonstração](${c.siteUrl}/#planos)\n`);
  console.log(`Search pages generated: homepage, ${c.guides.length} guides, ${legal.legalPages.length} legal pages, Markdown, sitemap and headers.`);
} finally { await server.close(); }
