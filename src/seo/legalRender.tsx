import { MarketingHeader } from '../features/landing/MarketingHeader.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { legalPages, legalUpdatedAt, privacyContact } from './legalContent.js';
import type { LegalPage } from './legalContent.js';
import { siteUrl } from './content.js';

export function renderLegal(page: LegalPage) {
  return renderToStaticMarkup(
    <div className={String.raw`landing-v0 [--landing-navy:#09264a] [--landing-navy-strong:#06172f] [--landing-emerald:#087a58] [--landing-emerald-bright:#0c936c] [--landing-field:#f8f9f7] [--landing-white:#fff] [--landing-ink:#10243e] [--landing-muted:#3d536b] [--landing-line:#cad6df] [min-width:20rem] min-h-screen overflow-x-clip text-(--landing-ink) [background:var(--landing-field)] font-['Manrope_Variable',Manrope,sans-serif] **:box-border [&_*::before]:box-border [&_*::after]:box-border [&_h1]:m-0 [&_h1]:text-balance [&_h2]:m-0 [&_h2]:text-balance [&_h3]:m-0 [&_h3]:text-balance [&_p]:m-0 [&_p]:text-pretty [&_a]:text-inherit motion-reduce:**:scroll-auto! motion-reduce:**:duration-[0ms]! motion-reduce:**:[animation-duration:0ms]! motion-reduce:[&_*::before]:scroll-auto! motion-reduce:[&_*::before]:duration-[0ms]! motion-reduce:[&_*::before]:[animation-duration:0ms]! motion-reduce:[&_*::after]:scroll-auto! motion-reduce:[&_*::after]:duration-[0ms]! motion-reduce:[&_*::after]:[animation-duration:0ms]! [&:has(.legal-article)_.landing-v0\_\_header]:relative [&:has(.legal-article)_.landing-v0\_\_header]:top-auto [&:has(.legal-article)_.landing-v0\_\_header]:mt-[24px] [&:has(.legal-article)_.landing-v0\_\_header]:grid-cols-[1fr_auto] [&:has(.legal-article)_.landing-v0\_\_header_nav]:flex [&:has(.legal-article)_.landing-v0\_\_header_nav]:items-center [&:has(.legal-article)_.landing-v0\_\_header_nav]:gap-[20px] [&:has(.legal-article)_.legal-article]:pt-[40px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header]:rounded-[20px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header_nav]:gap-[10px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header_nav_a]:text-[12px]`}>
      <MarketingHeader />
      <main className={String.raw`search-article [&_a:not(.landing-v0\_\_cta)]:text-(--landing-emerald) [&_a:not(.landing-v0\_\_cta)]:underline [&_a:not(.landing-v0\_\_cta)]:underline-offset-4 w-[min(calc(100%-40px),860px)] m-[0_auto] p-[56px_0_96px] text-(--landing-navy-strong) [&_h1]:m-[32px_0_24px] [&_h1]:text-[clamp(32px,5vw,52px)] [&_h1]:leading-[1.12] [&_h1]:tracking-tight [&_h2]:m-[36px_0_16px] [&_h2]:text-[26px] [&_h2]:leading-[1.3] [&_p]:text-[18px] [&_p]:leading-[1.75] [&_li]:text-[18px] [&_li]:leading-[1.75] [&_ul]:pl-[24px] [&_ul]:[list-style:disc] [&_.search-answer]:text-[21px] [&_.landing-v0\_\_cta]:inline-flex [&_.landing-v0\_\_cta]:mt-[24px] [&_ol]:pl-[24px] [&_ol]:[list-style:decimal] legal-article [&_article_section_p+p]:mt-[16px] [&_article_section_li+li]:mt-[12px] [&_article_section_ul]:mt-[16px]`}>
        <nav aria-label="Caminho da página"><a href="/">Início</a> / {page.title}</nav>
        <article>
          <h1>{page.title}</h1>
          <p className={"text-(--landing-muted) text-[15px]!"}>Última atualização: {legalUpdatedAt}</p>
          <p className={"search-answer"}>{page.intro}</p>
          {page.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}
          <p>Contato: <a href={`mailto:${privacyContact}`}>{privacyContact}</a>.</p>
          <p>Leia também: <a href={`/${page.slug === 'privacidade' ? 'termos-de-uso' : 'privacidade'}/`}>{page.slug === 'privacidade' ? 'Termos e Condições de Uso' : 'Política de Privacidade'}</a>.</p>
        </article>
      </main>
      <footer className={"landing-v0__footer grid grid-cols-[1fr_auto_1fr] items-center gap-[24px] min-h-[144px] p-[32px_max(24px,calc((100vw-1280px)/2))] text-(--landing-muted) bg-white [&_>_p]:text-[14px] [&_>_p]:leading-[20px] [&_>_div]:flex [&_>_div]:justify-end [&_>_div]:gap-[24px] [&_>_div]:text-[12px] [&_>_div]:leading-[16px] max-[900px]:grid-cols-[1fr] max-[900px]:justify-items-start max-[900px]:[&_>_div]:justify-start"}><a className={"inline-flex items-center gap-[8px] w-max text-(--landing-navy-strong) text-[20px] font-bold tracking-[-.04em] no-underline [&_img]:w-[32px] [&_img]:h-[32px] [&_img]:object-contain max-[560px]:[&_span]:text-[18px]"} href="/">NexaSST</a><div><a href="/privacidade/">Política de Privacidade</a><a href="/termos-de-uso/">Termos e Condições de Uso</a></div></footer>
    </div>,
  );
}

export function legalMarkdown(page: LegalPage) {
  const sections = page.sections.map((section) => `## ${section.title}\n\n${section.paragraphs.join('\n\n')}${section.bullets ? `\n\n${section.bullets.map((bullet) => `- ${bullet}`).join('\n')}` : ''}`).join('\n\n');
  return `# ${page.title}\n\nURL canônica: ${siteUrl}/${page.slug}/\n\nÚltima atualização: ${legalUpdatedAt}\n\n${page.intro}\n\n${sections}\n\nContato: [${privacyContact}](mailto:${privacyContact}).\n\n[Política de Privacidade](${siteUrl}/privacidade/) · [Termos e Condições de Uso](${siteUrl}/termos-de-uso/)\n`;
}

export { legalPages };
