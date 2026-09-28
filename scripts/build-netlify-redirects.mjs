import { mkdir, writeFile } from 'node:fs/promises';

// Set API_ORIGIN per Netlify context: production/main and develop/homolog.
const value = process.env.API_ORIGIN;
if (!value) throw new Error('Set API_ORIGIN to the HTTPS EC2 API domain in this Netlify deploy context');
const origin = new URL(value);
if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('API_ORIGIN must be an HTTPS origin without credentials, path or query');
}
await mkdir('dist', { recursive: true });
await writeFile('dist/_redirects', `/v1/* ${origin.origin}/v1/:splat 200!\n/apresentacao / 301\n/guias/* /404.html 404\n/privacidade/* /404.html 404\n/termos-de-uso/* /404.html 404\n/* /app.html 200\n`);
console.log('Netlify API proxy and SPA fallback generated.');
