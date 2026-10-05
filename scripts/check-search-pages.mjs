import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
assert.equal(urls.length, 14);
for (const url of urls) {
  const dom = new JSDOM(await readFile(`dist${url.pathname}index.html`, 'utf8'));
  const doc = dom.window.document;
  assert.equal(doc.querySelectorAll('h1').length, 1, url.pathname);
  assert.equal(doc.querySelector('link[rel="canonical"]').href, url.href);
  assert.match(doc.querySelector('meta[name="robots"]').content, /^index,/);
  assert.ok(doc.querySelector('meta[name="description"]').content.length > 60);
  assert.ok(doc.querySelector('main').textContent.length > 1000);
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) JSON.parse(script.textContent);
  for (const link of doc.querySelectorAll('a[href]')) {
    const target = new URL(link.getAttribute('href'), url);
    if (target.origin === url.origin && target.pathname.startsWith('/guias/')) {
      const file = target.pathname.endsWith('.md') ? `dist${target.pathname}` : `dist${target.pathname}index.html`;
      await readFile(file);
    }
  }
  if (url.pathname !== '/') assert.equal(doc.querySelectorAll('script[type="module"]').length, 0);
  const markdown = await readFile(`dist${url.pathname}index.md`, 'utf8');
  assert.ok(markdown.includes(url.href));
  assert.ok(markdown.length > 1000);
  if (url.pathname.startsWith('/guias/')) {
    for (const element of doc.querySelectorAll('article h1, article section p, article ol li')) {
      assert.ok(markdown.includes(element.textContent), `HTML/Markdown content mismatch: ${url.pathname}`);
    }
    const graph = [...doc.querySelectorAll('script[type="application/ld+json"]')].flatMap((script) => JSON.parse(script.textContent)['@graph']);
    const guideFaq = graph.find((item) => item['@type'] === 'FAQPage');
    for (const question of guideFaq?.mainEntity ?? []) {
      assert.ok(doc.querySelector('article').textContent.includes(question.name));
      assert.ok(doc.querySelector('article').textContent.includes(question.acceptedAnswer.text));
      assert.ok(markdown.includes(question.acceptedAnswer.text));
    }
  }
  if (['/privacidade/', '/termos-de-uso/'].includes(url.pathname)) {
    for (const element of doc.querySelectorAll('article h1, article section h2, article section p, article section li')) {
      assert.ok(markdown.includes(element.textContent), `Legal HTML/Markdown mismatch: ${url.pathname}`);
    }
    assert.match(doc.querySelector('article').textContent, /padilha\.matheus@hotmail\.com/);
  }
  dom.window.close();
}
const home = new JSDOM(await readFile('dist/index.html', 'utf8'));
const faq = [...home.window.document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)).flatMap((s) => s['@graph']).find((s) => s['@type'] === 'FAQPage');
for (const question of faq.mainEntity) {
  assert.ok(home.window.document.querySelector('main').textContent.includes(question.name));
  assert.ok(home.window.document.querySelector('main').textContent.includes(question.acceptedAnswer.text));
}
home.window.close();
const app = new JSDOM(await readFile('dist/app.html', 'utf8'));
assert.equal(app.window.document.querySelector('meta[name="robots"]').content, 'noindex, follow');
assert.equal(app.window.document.querySelector('link[rel="canonical"]'), null);
assert.equal(app.window.document.querySelector('#root').textContent, '');
app.window.close();
assert.match(await readFile('dist/_headers', 'utf8'), /Content-Type: text\/markdown/);
console.log('Search output verified: crawlable HTML, canonical URLs, schema, internal links, Markdown and separate app shell.');

const robots = await readFile('dist/robots.txt', 'utf8');
if (process.env.CONTEXT && process.env.CONTEXT !== 'production') assert.equal(robots, 'User-agent: *\nDisallow: /\n');
else for (const bot of ['OAI-SearchBot', 'Claude-SearchBot', 'Claude-User']) assert.ok(robots.includes(`User-agent: ${bot}\nAllow: /`));
