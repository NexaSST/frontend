import { cx } from '../components/ui/utils.js';
import { MarketingHeader } from '../features/landing/MarketingHeader.js';
import './LandingPageV0.polish.css';

import { useEffect, useRef } from 'react';
import { OfferGuide } from '../features/landing/OfferGuide.js';
import { SearchContent } from '../seo/SearchContent.js';
import { siteTitle, siteDescription, siteUrl } from '../seo/content.js';

const WHATSAPP_URL = 'https://wa.me/5542998366677?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20NexaSST.';
const WHATSAPP_CONFINED_SPACES_URL = 'https://wa.me/5542998366677?text=Ol%C3%A1%2C%20gostaria%20de%20uma%20proposta%20para%20o%20Invent%C3%A1rio%20de%20Espa%C3%A7os%20Confinados%20do%20NexaSST.';

const risks = [
  ['01', 'Prazo vence sem aparecer na rotina', 'Treinamentos, inspeções e ações ficam espalhados até virarem urgência.'],
  ['02', 'A evidência existe, mas não está ligada ao trabalho', 'Fotos, documentos e decisões perdem força quando não contam a mesma história.'],
  ['03', 'O campo identifica e a gestão descobre tarde', 'Sem um fluxo único, o desvio leva tempo demais para chegar a quem pode agir.'],
] as const;

const preventionSteps = [
  {
    index: '01',
    title: 'Detectar no campo',
    copy: 'A equipe registra a condição real do ativo e da tarefa, com contexto e evidência.',
    image: '/illustrations/safety/danger.webp',
  },
  {
    index: '02',
    title: 'Organizar o que exige ação',
    copy: 'Prazos, responsáveis e registros deixam de competir em planilhas e conversas soltas.',
    image: '/illustrations/safety/work-permit.webp',
  },
  {
    index: '03',
    title: 'Agir antes da ocorrência',
    copy: 'A gestão enxerga o que mudou e consegue priorizar o próximo movimento preventivo.',
    image: '/illustrations/safety/work-order.webp',
  },
] as const;

const outcomes = [
  ['Inspeções digitais', 'Ativos, checklists, fotos e vencimentos conectados ao trabalho de campo.'],
  ['Treinamentos', 'Matrizes, validade e evidências visíveis antes que a capacitação vire uma lacuna.'],
  ['APR e Permissão de Trabalho', 'Risco analisado e autorização ligados à tarefa que realmente será executada.'],
  ['Inventário de espaços confinados', 'Cadastros, planos de resgate e responsáveis técnicos organizados por espaço, com identificação por QR Code.'],
] as const;

const operationalDifferences = [
  {
    situation: 'Prazo que vira urgência',
    without: 'Vencimentos ficam dispersos até alguém descobrir a pendência.',
    with: 'A equipe consulta obrigações e inspeções com prazo no contexto da filial e prioriza o que exige atenção.',
    proof: 'Matriz de treinamentos, vencimentos e painel de pontos de atenção.',
  },
  {
    situation: 'Evidência difícil de recuperar',
    without: 'Fotos e registros ficam longe da pessoa, do ativo ou da tarefa a que pertencem.',
    with: 'A evidência permanece associada ao registro de treinamento, à inspeção ou à revisão da APR.',
    proof: 'Histórico operacional, anexos e registros vinculados.',
  },
  {
    situation: 'Campo e gestão em tempos diferentes',
    without: 'O trabalho no campo termina antes de a gestão enxergar o que precisa acompanhar.',
    with: 'O aplicativo preserva inspeções durante a falta de conexão e mostra o estado da sincronização até a confirmação.',
    proof: 'Aplicativo de inspeções e painel web em execução.',
  },
] as const;

const combos = [
  {
    name: 'Starter',
    audience: 'Para estruturar uma rotina compacta de SST',
    price: 'R$ 1.690',
    oldPrice: 'R$ 2.260',
    items: ['Treinamentos para até 50 colaboradores', 'Inspeções com até 2 inspetores e 100 ativos', 'Até 50 emissões de APR ou PT por mês'],
    future: 'Ergonomia: 5 laudos por mês',
    featured: false,
  },
  {
    name: 'Growth',
    audience: 'Para acompanhar mais equipes e frentes de trabalho',
    price: 'R$ 3.890',
    oldPrice: 'R$ 5.060',
    items: ['Treinamentos para até 150 colaboradores', 'Inspeções com até 5 inspetores e 300 ativos', 'Até 200 emissões de APR ou PT por mês'],
    future: 'Ergonomia: 15 laudos por mês',
    featured: true,
  },
  {
    name: 'Scale',
    audience: 'Para operações com maior volume em várias frentes',
    price: 'R$ 9.645',
    oldPrice: 'R$ 12.860',
    items: ['Treinamentos para até 500 colaboradores', 'Inspeções com até 15 inspetores e 1.000 ativos', 'Até 500 emissões de APR ou PT por mês'],
    future: 'Ergonomia: 30 laudos por mês',
    featured: false,
  },
] as const;

const questions = [
  ['O NexaSST substitui o profissional de SST?', 'Não. O sistema organiza operação, prazos e evidências. As decisões técnicas e legais continuam com os profissionais habilitados e com a empresa.'],
  ['Funciona sem internet no campo?', 'O aplicativo de inspeções preserva o trabalho no aparelho e mostra o estado da sincronização até o servidor confirmar o recebimento.'],
  ['Preciso contratar todos os módulos?', 'Não. Existem módulos avulsos e combos por porte. A demonstração ajuda a identificar a composição adequada para a operação.'],
  ['O sistema garante que a empresa não será multada?', 'Não. O NexaSST apoia prevenção, organização e rastreabilidade, mas não substitui as obrigações legais nem garante o resultado de uma fiscalização.'],
] as const;

function WhatsAppButton({ compact = false, intent = 'demo', secondary = false, label }: { compact?: boolean; intent?: 'demo' | 'plans' | 'confined-spaces'; secondary?: boolean; label?: string }) {
  const action = intent === 'plans'
    ? { href: '#planos', label: 'Ver planos' }
    : intent === 'confined-spaces'
      ? { href: WHATSAPP_CONFINED_SPACES_URL, label: 'Solicitar proposta' }
      : { href: WHATSAPP_URL, label: 'Agendar demonstração' };
  return (
    <span className={"landing-v0__cta-wrap inline-grid justify-items-start gap-[8px] [&_small]:text-(--landing-muted) [&_small]:text-[12px] [&_small]:leading-[16px]"}>
      <a
        className={cx(
          "landing-v0__cta inline-flex min-h-[44px] items-center justify-center px-4 py-2 border-0 rounded-xl font-[inherit] font-[650] no-underline cursor-pointer [transition:background-color_140ms_cubic-bezier(.23,1,.32,1),transform_140ms_cubic-bezier(.23,1,.32,1),box-shadow_140ms_cubic-bezier(.23,1,.32,1)] active:scale-[.97] focus-visible:outline-3 focus-visible:outline-[#6ee7b7] focus-visible:outline-offset-3",
          compact ? "text-sm leading-normal" : "text-base",
          secondary
            ? "text-(--landing-navy-strong)! bg-white shadow-[0_10px_26px_rgb(6_23_47/18%)] hover:bg-[#eaf5f0] hover:shadow-[0_14px_30px_rgb(6_23_47/22%)]"
            : "text-white! bg-(--landing-emerald) shadow-[0_10px_26px_rgb(8_122_88/24%)] hover:bg-[#076348] hover:shadow-[0_14px_30px_rgb(8_122_88/30%)]",
        )}
        href={action.href}
        target={intent === 'plans' ? undefined : '_blank'}
        rel={intent === 'plans' ? undefined : 'noreferrer'}
      >
        {label ?? action.label}
      </a>
      {!compact && <small>Conversa direta pelo WhatsApp, sem formulário longo.</small>}
    </span>
  );
}

export function LandingPageV0() {
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = siteTitle;
    const description = document.querySelector('meta[name="description"]');
    description?.setAttribute('content', siteDescription);
    document.querySelector('meta[name="robots"]')?.setAttribute('content', 'index, follow, max-image-preview:large');
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = `${siteUrl}/`;
    return () => {
      document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex, follow');
      canonical?.remove();
      document.title = 'NexaSST - Gestão em Segurança do Trabalho';
    };
  }, []);

  useEffect(() => {
    const root = landingRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    root.classList.add(...(String.raw`**:data-reveal:opacity-[0] **:data-reveal:transform-[translate3d(0,28px,0)] **:data-reveal:[transition:opacity_640ms_cubic-bezier(.23,1,.32,1),transform_760ms_cubic-bezier(.23,1,.32,1)] **:data-[reveal='left']:transform-[translate3d(-40px,0,0)] **:data-[reveal='right']:transform-[translate3d(40px,0,0)] **:data-[reveal='hero']:transform-[translate3d(0,18px,0)_scale(.985)] [&_[data-reveal].is-visible]:opacity-[1] [&_[data-reveal].is-visible]:transform-[translate3d(0,0,0)_scale(1)] [&_.landing-v0\_\_risk-list_article:nth-child(2)]:delay-90 [&_.landing-v0\_\_prevention-grid_article:nth-child(2)]:delay-90 [&_.landing-v0\_\_solutions_article:nth-child(2)]:delay-90 [&_.landing-v0\_\_pricing-grid_article:nth-child(2)]:delay-90 [&_.landing-v0\_\_qr-cases_article:nth-child(2)]:delay-90 [&_.landing-v0\_\_risk-list_article:nth-child(3)]:delay-180 [&_.landing-v0\_\_prevention-grid_article:nth-child(3)]:delay-180 [&_.landing-v0\_\_solutions_article:nth-child(3)]:delay-180 [&_.landing-v0\_\_pricing-grid_article:nth-child(3)]:delay-180 [&_.landing-v0\_\_solutions_article:nth-child(4)]:delay-270` ?? '').split(/\s+/));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.14 });

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={String.raw`landing-v0 [--landing-navy:#09264a] [--landing-navy-strong:#06172f] [--landing-emerald:#087a58] [--landing-emerald-bright:#0c936c] [--landing-field:#f8f9f7] [--landing-white:#fff] [--landing-ink:#10243e] [--landing-muted:#3d536b] [--landing-line:#cad6df] [min-width:20rem] min-h-screen overflow-x-clip text-(--landing-ink) [background:var(--landing-field)] font-['Manrope_Variable',Manrope,sans-serif] **:box-border [&_*::before]:box-border [&_*::after]:box-border [&_h1]:m-0 [&_h1]:text-balance [&_h2]:m-0 [&_h2]:text-balance [&_h3]:m-0 [&_h3]:text-balance [&_p]:m-0 [&_p]:text-pretty [&_a]:text-inherit motion-reduce:**:scroll-auto! motion-reduce:**:duration-[0ms]! motion-reduce:**:[animation-duration:0ms]! motion-reduce:[&_*::before]:scroll-auto! motion-reduce:[&_*::before]:duration-[0ms]! motion-reduce:[&_*::before]:[animation-duration:0ms]! motion-reduce:[&_*::after]:scroll-auto! motion-reduce:[&_*::after]:duration-[0ms]! motion-reduce:[&_*::after]:[animation-duration:0ms]! [&:has(.legal-article)_.landing-v0\_\_header]:relative [&:has(.legal-article)_.landing-v0\_\_header]:top-auto [&:has(.legal-article)_.landing-v0\_\_header]:mt-[24px] [&:has(.legal-article)_.landing-v0\_\_header]:grid-cols-[1fr_auto] [&:has(.legal-article)_.landing-v0\_\_header_nav]:flex [&:has(.legal-article)_.landing-v0\_\_header_nav]:items-center [&:has(.legal-article)_.landing-v0\_\_header_nav]:gap-[20px] [&:has(.legal-article)_.legal-article]:pt-[40px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header]:rounded-[20px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header_nav]:gap-[10px] max-[620px]:[&:has(.legal-article)_.landing-v0\_\_header_nav_a]:text-[12px]`} ref={landingRef}>
      <a className={"fixed top-[8px] left-[8px] z-100 p-[8px_12px] rounded-[6px] text-white [background:var(--landing-navy-strong)] transform-[translateY(-160%)] [transition:transform_140ms_cubic-bezier(.23,1,.32,1)] focus-visible:transform-[translateY(0)]"} href="#conteudo">Ir para o conteúdo</a>

      <MarketingHeader home />

      <main id="conteudo">
        <section className={String.raw`landing-v0__hero relative grid min-h-[min(900px,100svh)] place-items-center p-[152px_24px_96px] overflow-hidden isolate text-white bg-(--landing-navy-strong) bg-[url('/landing/hero-active-prevention-v1.webp')] bg-center bg-cover [&::before]:absolute [&::before]:inset-0 [&::before]:z-[-1] [&::before]:bg-[rgb(6_23_47/48%)] [&::before]:[content:''] [&_.landing-v0\_\_eyebrow]:text-[#6ee7b7] [&_h1]:max-w-[16ch] [&_h1]:text-white [&_h1]:text-[clamp(56px,7.4vw,96px)] [&_h1]:font-[650] [&_h1]:leading-[.98] [&_h1]:tracking-[-.045em] [&_h1]:[text-shadow:0_4px_30px_rgb(0_0_0/36%)] [&_.landing-v0\_\_cta-wrap]:justify-items-center [&_.landing-v0\_\_cta-wrap_small]:text-[#d3dfe7] [&_.landing-v0\_\_cta-wrap_small]:[text-shadow:0_2px_14px_rgb(0_0_0/60%)] max-[900px]:min-h-[760px] max-[900px]:p-[128px_24px_72px] max-[900px]:[&_h1]:text-[60px] max-[560px]:min-h-[720px] max-[560px]:p-[112px_20px_64px] max-[560px]:bg-center max-[560px]:[&::before]:bg-[rgb(6_23_47/58%)] max-[560px]:[&_h1]:text-[48px]`} id="inicio">
          <div className={"grid w-[min(100%,780px)] justify-items-center gap-[24px] text-center [&_>_p]:max-w-[64ch] [&_>_p]:text-[#e7eef4] [&_>_p]:text-[18px] [&_>_p]:leading-[28px] [&_>_p]:[text-shadow:0_2px_18px_rgb(0_0_0/60%)] [&_>_span:last-child]:max-w-[58ch] [&_>_span:last-child]:text-[#d3dfe7] [&_>_span:last-child]:text-[14px] [&_>_span:last-child]:leading-[20px] [&_>_span:last-child]:[text-shadow:0_2px_14px_rgb(0_0_0/60%)] max-[560px]:[&_>_p]:text-[16px] max-[560px]:[&_>_p]:leading-[24px]"} data-reveal="hero">
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Prevenção ativa para segurança do trabalho</span>
            <h1>Seu software para gestão de SST.</h1>
            <p>Organize treinamentos, inspeções e APR/PT com painel web e aplicativo de inspeções que preserva registros sem conexão.</p>
            <div className={String.raw`flex flex-wrap justify-center gap-[12px] [&_.landing-v0\_\_cta]:min-h-[44px] [&_.landing-v0\_\_cta]:text-[16px]`}>
              <WhatsAppButton compact label="Agendar demonstração pelo WhatsApp" />
              <WhatsAppButton compact intent="plans" secondary />
            </div>
            <span>Combos e módulos avulsos para sua operação. Inventário de espaços confinados contratado à parte.</span>
          </div>
        </section>
        <section className={"landing-v0__product w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] grid grid-cols-12 items-center gap-[24px] min-h-[760px] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[48px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.035em] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[48px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} id="produto" aria-labelledby="product-title">
          <div className={"col-[1/6] [&_p]:max-w-[48ch] [&_p]:mt-[24px] [&_p]:text-(--landing-muted) [&_p]:text-[18px] [&_p]:leading-[28px] max-[900px]:col-1"} data-reveal="left">
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Campo e gestão no mesmo fluxo</span>
            <h2 id="product-title">A evidência acompanha o trabalho, não uma pasta esquecida.</h2>
            <p>O aplicativo registra a execução em campo. O painel organiza prazos, responsáveis e contexto para a equipe que precisa decidir.</p>
          </div>
          <div className={"relative col-[7/13] min-h-[520px] max-[900px]:col-1 max-[900px]:min-h-[440px] max-[560px]:min-h-[380px]"}>
            <figure className={"absolute m-0 overflow-hidden text-white rounded-[16px] [background:var(--landing-navy-strong)] shadow-[0_18px_48px_rgb(6_23_47/18%)] [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_figcaption]:absolute [&_figcaption]:right-0 [&_figcaption]:bottom-0 [&_figcaption]:left-0 [&_figcaption]:grid [&_figcaption]:gap-[4px] [&_figcaption]:p-[48px_24px_20px] [&_figcaption]:[background:linear-gradient(to_bottom,transparent,rgb(6_23_47/92%))] [&_span]:text-[#cad6df] [&_span]:text-[12px] [&_span]:leading-[16px] [&_strong]:text-[18px] [&_strong]:leading-[24px] inset-[0_48px_72px_0] [&_img]:object-top-left max-[560px]:inset-[0_24px_72px_0]"} data-reveal="left">
              <img src="/landing/product/web-dashboard-training.png" alt="Painel web do NexaSST mostrando cobertura e pontos de atenção em treinamentos" />
              <figcaption><span>Painel web em execução</span><strong>Cobertura, vencimentos e pontos de atenção</strong></figcaption>
            </figure>
            <figure className={"absolute m-0 overflow-hidden text-white rounded-[16px] [background:var(--landing-navy-strong)] shadow-[0_18px_48px_rgb(6_23_47/18%)] [&_img]:block [&_img]:w-full [&_img]:h-full [&_img]:object-cover [&_figcaption]:absolute [&_figcaption]:right-0 [&_figcaption]:bottom-0 [&_figcaption]:left-0 [&_figcaption]:grid [&_figcaption]:gap-[4px] [&_figcaption]:[background:linear-gradient(to_bottom,transparent,rgb(6_23_47/92%))] [&_span]:text-[#cad6df] [&_span]:text-[12px] [&_span]:leading-[16px] right-0 bottom-0 w-[34%] h-[84%] border-[8px] border-solid border-[#fff] [&_img]:object-[center_top] [&_figcaption]:p-[56px_16px_16px] [&_strong]:text-[14px] [&_strong]:leading-[20px] max-[560px]:w-[48%] max-[560px]:h-[78%]"} data-reveal="right">
              <img src="/landing/product/mobile-field-home.webp" alt="Tela inicial do aplicativo NexaSST com ativos mapeados, vencimentos e sincronização de dados" />
              <figcaption><span>Aplicativo em execução</span><strong>Ativos, vencimentos e sincronização no campo</strong></figcaption>
            </figure>
          </div>
        </section>
        <section className={"landing-v0__qr grid grid-cols-[minmax(300px,.85fr)_minmax(0,1.15fr)] items-center gap-[80px] w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] border-t border-solid border-t-[var(--landing-line)] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[48px] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0]"} id="rastreabilidade" aria-labelledby="qr-title">
          <div className={"relative min-h-[520px] overflow-hidden rounded-[16px] [background:var(--landing-navy-strong)] shadow-[0_24px_64px_rgb(6_23_47/16%)] [&::after]:absolute [&::after]:inset-0 [&::after]:border [&::after]:border-solid [&::after]:border-[rgb(255_255_255/12%)] [&::after]:rounded-[inherit] [&::after]:[content:''] [&::after]:pointer-events-none [&_>_img]:w-full [&_>_img]:h-full [&_>_img]:min-h-[520px] [&_>_img]:object-cover [&_>_span]:absolute [&_>_span]:right-[20px] [&_>_span]:bottom-[20px] [&_>_span]:left-[20px] [&_>_span]:p-[12px_16px] [&_>_span]:border [&_>_span]:border-solid [&_>_span]:border-[rgb(255_255_255/18%)] [&_>_span]:rounded-[10px] [&_>_span]:text-white [&_>_span]:bg-[rgb(6_23_47/78%)] [&_>_span]:text-[13px] [&_>_span]:font-[650] [&_>_span]:text-center [&_>_span]:[backdrop-filter:blur(16px)] max-[900px]:min-h-[460px] max-[900px]:[&_>_img]:min-h-[460px] max-[560px]:min-h-[360px] max-[560px]:[&_>_img]:min-h-[360px]"} data-reveal="left">
            <img src="/illustrations/safety/qrcode.webp" alt="Código QR tridimensional representando identificação no ponto de uso" />
            <span>Identificação no ponto de uso</span>
          </div>
          <div className={"[&_h2]:max-w-[13ch] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[52px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.04em] [&_>_div:first-child_>_p]:max-w-[58ch] [&_>_div:first-child_>_p]:mt-[24px] [&_>_div:first-child_>_p]:text-(--landing-muted) [&_>_div:first-child_>_p]:text-[18px] [&_>_div:first-child_>_p]:leading-[28px] max-[900px]:[&_h2]:max-w-[16ch] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"}>
            <div data-reveal>
              <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Rastreabilidade por QR Code</span>
              <h2 id="qr-title">A evidência começa ligada à pessoa, ao ativo e ao espaço certos.</h2>
              <p>O QR Code reduz a distância entre o campo e a gestão. Cada leitura abre o contexto correto para consultar informações publicadas e acompanhar a operação.</p>
            </div>
            <div className={"grid mt-[48px] [&_article]:grid [&_article]:grid-cols-[104px_minmax(0,1fr)] [&_article]:items-center [&_article]:gap-[24px] [&_article]:p-[20px_0] [&_article]:border-t [&_article]:border-solid [&_article]:border-t-[var(--landing-line)] [&_article:last-child]:border-b [&_article:last-child]:border-solid [&_article:last-child]:border-b-[var(--landing-line)] [&_img]:w-[104px] [&_img]:h-[104px] [&_img]:rounded-[14px] [&_img]:object-cover [&_span]:text-(--landing-emerald) [&_span]:text-[12px] [&_span]:font-bold [&_span]:tracking-[.06em] [&_span]:uppercase [&_h3]:mt-[4px] [&_h3]:text-(--landing-navy-strong) [&_h3]:text-[20px] [&_h3]:leading-[28px] [&_p]:mt-[4px] [&_p]:text-(--landing-muted) [&_p]:text-[14px] [&_p]:leading-[20px] max-[560px]:[&_article]:grid-cols-[80px_minmax(0,1fr)] max-[560px]:[&_article]:gap-[16px] max-[560px]:[&_img]:w-[80px] max-[560px]:[&_img]:h-[80px] max-[560px]:[&_img]:rounded-[12px]"}>
              <article data-reveal>
                <img src="/illustrations/safety/work-permit.webp" alt="" />
                <div><span>Treinamentos</span><h3>Mapeie o colaborador</h3><p>Vincule presença, capacitação e evidências ao profissional correto.</p></div>
              </article>
              <article data-reveal>
                <img src="/illustrations/safety/work-order.webp" alt="" />
                <div><span>Inspeções</span><h3>Rastreie o ativo</h3><p>Acesse o equipamento certo e preserve histórico, fotos e recorrências.</p></div>
              </article>
              <article data-reveal>
                <img src="/illustrations/safety/rope.webp" alt="" />
                <div><span>Espaços confinados</span><h3>Consulte o espaço</h3><p>Cada espaço tem QR próprio para consultar informações e o recorte público aprovado do plano de resgate, quando disponível.</p></div>
              </article>
            </div>
          </div>
        </section>
        <section className={"landing-v0__comparison w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] border-t border-solid border-t-[var(--landing-line)] [&_>_header]:grid [&_>_header]:grid-cols-12 [&_>_header]:items-end [&_>_header]:gap-[24px] [&_>_header_>_div]:col-[1/8] [&_>_header_>_p]:col-[9/13] [&_>_header_>_p]:text-(--landing-muted) [&_>_header_>_p]:text-[16px] [&_>_header_>_p]:leading-[24px] [&_h2]:max-w-[16ch] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[52px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.04em] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:[&_>_header]:grid-cols-[1fr] max-[900px]:[&_>_header_>_div]:col-1 max-[900px]:[&_>_header_>_p]:col-1 max-[900px]:[&_>_header_>_p]:mt-[8px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} id="comparativo" aria-labelledby="comparison-title">
          <header data-reveal>
            <div>
              <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Da pendência à próxima ação</span>
              <h2 id="comparison-title">O prazo não espera sua equipe encontrar a evidência.</h2>
            </div>
            <p>Veja como três situações comuns mudam quando prazo, registro e responsável são consultados no mesmo fluxo.</p>
          </header>
          <div className={"mt-[56px] border-t border-solid border-t-[var(--landing-line)] max-[560px]:mt-[40px]"}>
            <div className={"grid grid-cols-[minmax(180px,.8fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-[24px] p-[16px_24px] text-(--landing-muted) text-[12px] font-bold leading-[18px] tracking-[.04em] uppercase max-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-[900px]:[&_span:first-child]:hidden max-[560px]:hidden"} aria-hidden="true"><span>Situação recorrente</span><span>Quando os registros ficam soltos</span><span>Com o fluxo NexaSST</span></div>
            {operationalDifferences.map((item, index) => (
              <article key={item.situation} className={(cx("grid grid-cols-[minmax(180px,.8fr)_minmax(0,1fr)_minmax(0,1.35fr)] gap-[24px] items-start p-[32px_24px] border-t border-solid border-t-[var(--landing-line)] [&_h3]:text-(--landing-navy-strong) [&_h3]:text-[22px] [&_h3]:leading-[28px] [&_>_p]:text-(--landing-muted) [&_>_p]:text-[16px] [&_>_p]:leading-[24px] [&_>_div]:grid [&_>_div]:gap-[12px] [&_>_div]:pl-[24px] [&_>_div]:border-l [&_>_div]:border-solid [&_>_div]:border-l-[#a9cabe] [&_strong]:text-(--landing-navy-strong) [&_strong]:text-[17px] [&_strong]:font-[650] [&_strong]:leading-[26px] [&_small]:text-(--landing-emerald) [&_small]:text-[13px] [&_small]:font-bold [&_small]:leading-[20px] max-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] max-[900px]:[&_h3]:col-span-full max-[560px]:grid-cols-[1fr] max-[560px]:gap-[12px] max-[560px]:p-[28px_16px] max-[560px]:[&_h3]:col-1 max-[560px]:[&_>_div]:pl-[16px]", index === 0 ? "bg-[#eaf5f0]" : ""))} data-reveal>
                <h3>{item.situation}</h3>
                <p>{item.without}</p>
                <div><strong>{item.with}</strong><small>{item.proof}</small></div>
              </article>
            ))}
          </div>
        </section>
        <section className={"landing-v0__solutions w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] grid grid-cols-12 gap-[64px_24px] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[48px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.035em] [&_article_>_span]:text-(--landing-emerald) [&_article_>_span]:text-[12px] [&_article_>_span]:font-bold [&_article_>_span]:leading-[16px] [&_h3]:text-(--landing-navy-strong) [&_h3]:text-[20px] [&_h3]:leading-[28px] [&_p]:text-(--landing-muted) [&_p]:text-[16px] [&_p]:leading-[24px] [&_>_header]:col-[1/6] [&_>_div]:col-[7/13] [&_article]:grid [&_article]:grid-cols-[48px_minmax(160px,.7fr)_minmax(0,1fr)] [&_article]:gap-[24px] [&_article]:p-[24px_0] [&_article]:border-t [&_article]:border-solid [&_article]:border-t-[var(--landing-line)] [&_article:last-of-type]:border-b [&_article:last-of-type]:border-solid [&_article:last-of-type]:border-b-[var(--landing-line)] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[48px] max-[900px]:[&_>_header]:col-1 max-[900px]:[&_>_div]:col-1 max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px] max-[560px]:[&_article]:grid-cols-[32px_minmax(0,1fr)] max-[560px]:[&_article]:gap-[12px_16px] max-[560px]:[&_article_p]:col-2"} id="solucoes" aria-labelledby="solutions-title">
          <header data-reveal>
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Resultados por operação</span>
            <h2 id="solutions-title">Comece pela dor que existe hoje.</h2>
          </header>
          <div>
            {outcomes.map(([title, copy], index) => (
              <article key={title} data-reveal>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
            <div className={"mt-[32px]"} data-reveal>
              <WhatsAppButton compact intent="plans" />
            </div>
          </div>
        </section>
        <section className={"grid grid-cols-[minmax(44px,80px)_minmax(0,900px)] justify-center gap-[48px] p-[96px_max(24px,calc((100vw-1280px)/2))] text-white [background:var(--landing-emerald)] [&_h2]:max-w-[18ch] [&_h2]:text-[60px] [&_h2]:font-semibold [&_h2]:leading-none [&_h2]:tracking-[-.04em] [&_p]:max-w-[64ch] [&_p]:mt-[32px] [&_p]:text-[#e6fff5] [&_p]:text-[18px] [&_p]:leading-[28px] max-[900px]:p-[80px_24px] max-[900px]:[&_h2]:text-[48px] max-[560px]:grid-cols-[1fr] max-[560px]:gap-[24px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} aria-labelledby="finance-title">
          <div className={"[writing-mode:vertical-rl] text-[#d1fae5] text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase max-[560px]:[writing-mode:initial]"} data-reveal="left">Custo operacional começa antes da penalidade</div>
          <div data-reveal>
            <h2 id="finance-title">A multa é só uma das formas de pagar por um risco percebido tarde.</h2>
            <p>Parada, retrabalho, treinamento emergencial, investigação e evidência dispersa também consomem a operação. O NexaSST ajuda a agir antes e a manter rastreabilidade do que foi identificado e executado.</p>
          </div>
        </section>
        <section className={String.raw`landing-v0__pricing w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] border-t border-solid border-t-[var(--landing-line)] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[48px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.035em] [&_>_header]:grid [&_>_header]:grid-cols-12 [&_>_header]:gap-[24px] [&_>_header]:items-end [&_>_header_>_div]:col-[1/8] [&_>_header_>_p]:col-[9/13] [&_>_header_>_p]:text-(--landing-muted) [&_>_header_>_p]:text-[16px] [&_>_header_>_p]:leading-[24px] [&_>_.landing-v0\_\_pricing-disclosure]:max-w-[90ch] [&_>_.landing-v0\_\_pricing-disclosure]:m-[24px_auto_0] [&_>_.landing-v0\_\_pricing-disclosure]:text-(--landing-muted) [&_>_.landing-v0\_\_pricing-disclosure]:text-[14px] [&_>_.landing-v0\_\_pricing-disclosure]:leading-[22px] [&_>_.landing-v0\_\_pricing-disclosure]:text-center [&_>_.landing-v0\_\_pricing-note]:mt-[24px] [&_>_.landing-v0\_\_pricing-note]:text-(--landing-muted) [&_>_.landing-v0\_\_pricing-note]:text-[14px] [&_>_.landing-v0\_\_pricing-note]:leading-[20px] [&_>_.landing-v0\_\_pricing-note]:text-center max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:[&_>_header]:grid-cols-[1fr] max-[900px]:[&_>_header_>_div]:col-1 max-[900px]:[&_>_header_>_p]:col-1 max-[900px]:[&_>_header_>_p]:mt-[24px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]`} id="planos" aria-labelledby="pricing-title">
          <header data-reveal>
            <div>
              <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Combos do ecossistema</span>
              <h2 id="pricing-title">Uma base proporcional ao tamanho da operação.</h2>
            </div>
            <p>Starter, Growth e Scale reúnem as mesmas frentes com capacidades diferentes. Você também pode começar por módulos avulsos; o Inventário de Espaços Confinados tem proposta própria.</p>
          </header>
          <div className={"landing-v0__pricing-grid grid grid-cols-[repeat(3,1fr)] items-stretch gap-[16px] mt-[64px] max-[900px]:grid-cols-[1fr]"}>
            {combos.map((combo) => (
              <article className={(cx(String.raw`landing-v0__price relative flex flex-col min-h-[540px] p-[32px] border border-solid rounded-[16px] [&_>_p]:text-[14px] [&_>_p]:leading-[20px] [&_h3]:mt-[8px] [&_h3]:text-[30px] [&_h3]:leading-[36px] [&_>_div]:grid [&_>_div]:mt-[40px] [&_>_div_strong]:mt-[4px] [&_>_div_strong]:text-[48px] [&_>_div_strong]:font-[650] [&_>_div_strong]:leading-none [&_>_div_strong]:tracking-[-.035em] [&_>_div_span]:mt-[8px] [&_>_div_span]:text-[14px] [&_>_div_span]:leading-[20px] [&_ul]:grid [&_ul]:gap-[12px] [&_ul]:m-[32px_0] [&_ul]:p-[24px_0_0] [&_ul]:border-t [&_ul]:border-solid [&_ul]:border-t-[var(--landing-line)] [&_ul]:list-none [&_li]:relative [&_li]:pl-[20px] [&_li]:text-[14px] [&_li]:leading-[20px] [&_li::before]:absolute [&_li::before]:top-[7px] [&_li::before]:left-0 [&_li::before]:w-[6px] [&_li::before]:h-[6px] [&_li::before]:rounded-[50%] [&_li::before]:[background:var(--landing-emerald-bright)] [&_li::before]:[content:''] [&_.landing-v0\_\_cta-wrap]:mt-auto max-[900px]:min-h-auto max-[560px]:p-[24px] max-[560px]:[&_>_div_strong]:text-[36px] max-[560px]:[&_>_div_strong]:leading-[40px]`, combo.featured ? String.raw`landing-v0__price--featured text-white border-(--landing-navy-strong) [background:var(--landing-navy-strong)] shadow-[0_18px_48px_rgb(6_23_47/14%)] [&_>_p]:text-[#cad6df] [&_.landing-v0\_\_price-reference]:text-[#cad6df] [&_>_div_span]:text-[#cad6df] [&_ul]:border-t-[rgb(255_255_255/18%)]! [&_li]:text-[#e5edf2]` : "border-(--landing-line) bg-white [&_>_p]:text-(--landing-muted) [&_>_div_span]:text-(--landing-muted) [&_li]:text-(--landing-muted)"))} key={combo.name} data-reveal>
                <p>{combo.audience}</p>
                <h3>Combo {combo.name}</h3>
                <div><span className={"landing-v0__price-reference flex flex-wrap items-baseline gap-[6px] text-(--landing-muted) text-[12px] leading-[20px]"}>Soma dos módulos avulsos <span className={"text-[15px] font-[650] line-through decoration-1!"}>{combo.oldPrice}</span></span><strong>{combo.price}</strong><span>por mês</span></div>
                <p className="mt-[16px]! text-[13px]! font-bold">Disponível hoje</p>
                <ul>{combo.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <div className="landing-v0__future">
                  <p className="text-[13px]! font-bold">Em breve · incluído no combo</p>
                  <p className="mt-[8px]! text-[14px]!">{combo.future}. A franquia começa quando o módulo estiver disponível.</p>
                </div>
                <WhatsAppButton compact />
              </article>
            ))}
          </div>
          <p className={"landing-v0__pricing-disclosure"}>A soma avulsa inclui ergonomia, que integra os combos e estará disponível em breve. A franquia mensal de laudos começa quando o módulo estiver disponível, sem acúmulo de meses anteriores.</p>
          <div className={"grid grid-cols-[minmax(0,1fr)_auto] items-end gap-[48px] mt-[32px] p-[32px] border border-solid border-[#c9ded5] rounded-[16px] bg-[#eaf5f0] [&_h3]:mt-[8px] [&_h3]:text-(--landing-navy-strong) [&_h3]:text-[28px] [&_h3]:leading-[36px] [&_p]:max-w-[62ch] [&_p]:mt-[12px] [&_p]:text-(--landing-muted) [&_p]:text-[16px] [&_p]:leading-[24px] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[24px] max-[560px]:p-[24px]"} data-reveal>
            <div>
              <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Módulo contratado à parte</span>
              <h3>Inventário de espaços confinados</h3>
              <p>Organize espaços, planos de resgate e publicação por QR Code. Converse com a equipe para definir o escopo e receber uma proposta para sua operação.</p>
            </div>
            <div className={"grid justify-items-start gap-[16px] [&_strong]:text-(--landing-navy-strong) [&_strong]:text-[18px] [&_strong]:leading-[24px]"}>
              <strong>Valor sob consulta</strong>
              <WhatsAppButton compact intent="confined-spaces" />
            </div>
          </div>
          <p className={"landing-v0__pricing-note"}>Trava preventiva para APR e PT: oferta sob projeto e orçamento.</p>
        </section>

        <OfferGuide />

        <section className={"landing-v0__faq w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] grid grid-cols-12 gap-[64px_24px] border-t border-solid border-t-[var(--landing-line)] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[48px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.035em] [&_>_div:first-child]:col-[1/6] [&_>_div:last-child]:col-[7/13] [&_details]:border-t [&_details]:border-solid [&_details]:border-t-[var(--landing-line)] [&_details:last-child]:border-b [&_details:last-child]:border-solid [&_details:last-child]:border-b-[var(--landing-line)] [&_summary]:p-[24px_32px_24px_0] [&_summary]:text-(--landing-navy-strong) [&_summary]:text-[18px] [&_summary]:font-[650] [&_summary]:leading-[28px] [&_summary]:cursor-pointer [&_details_p]:max-w-[58ch] [&_details_p]:p-[0_0_24px] [&_details_p]:text-(--landing-muted) [&_details_p]:text-[16px] [&_details_p]:leading-[24px] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[48px] max-[900px]:[&_>_div:first-child]:col-1 max-[900px]:[&_>_div:last-child]:col-1 max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} aria-labelledby="faq-title">
          <div data-reveal>
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Perguntas diretas</span>
            <h2 id="faq-title">Sem promessa que o produto não possa cumprir.</h2>
          </div>
          <div>
            {questions.map(([question, answer]) => (
              <details key={question} data-reveal>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className={String.raw`landing-v0__closing grid grid-cols-[minmax(240px,.7fr)_minmax(0,1.3fr)] items-center gap-[64px] mt-[32px] p-[96px_max(24px,calc((100vw-1120px)/2))] text-white [background:var(--landing-navy-strong)] [&_img]:w-full [&_img]:max-w-[380px] [&_img]:justify-self-center [&_img]:filter-[drop-shadow(0_28px_36px_rgb(0_0_0/28%))] [&_.landing-v0\_\_eyebrow]:text-[#6ee7b7] [&_h2]:max-w-[18ch] [&_h2]:mt-[16px] [&_h2]:text-[48px] [&_h2]:font-semibold [&_h2]:leading-none [&_h2]:tracking-[-.035em] [&_p]:max-w-[56ch] [&_p]:m-[24px_0_32px] [&_p]:text-[#cad6df] [&_p]:text-[18px] [&_p]:leading-[28px] [&_.landing-v0\_\_cta-wrap_small]:text-[#cad6df] max-[900px]:grid-cols-[1fr] max-[900px]:p-[80px_24px] max-[900px]:[&_img]:max-w-[280px] max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]`} id="demonstracao" aria-labelledby="closing-title">
          <img src="/illustrations/safety/safety-harness.webp" alt="Cinto de segurança em três dimensões" data-reveal="left" />
          <div data-reveal>
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Veja com a sua operação</span>
            <h2 id="closing-title">A demonstração começa pelos seus riscos, não por uma apresentação genérica.</h2>
            <ol className="pl-[20px] m-[0_0_32px] leading-[1.7]">
              <li>Envie sua mensagem pelo WhatsApp.</li>
              <li>Converse sobre sua rotina e combine a demonstração.</li>
              <li>Avalie módulos, capacidades e condições na proposta comercial.</li>
            </ol>
            <WhatsAppButton />
          </div>
        </section>
        <section className={"landing-v0__recognition w-[min(calc(100%-48px),1280px)] m-[0_auto] p-[96px_0] grid grid-cols-12 gap-[64px_24px] border-t border-solid border-t-[var(--landing-line)] [&_>_div:first-child]:col-[1/6] [&_h2]:mt-[16px] [&_h2]:text-(--landing-navy-strong) [&_h2]:text-[48px] [&_h2]:font-[650] [&_h2]:leading-none [&_h2]:tracking-[-.035em] max-[900px]:w-[min(calc(100%-32px),1280px)] max-[900px]:p-[80px_0] max-[900px]:grid-cols-[1fr] max-[900px]:gap-[48px] max-[900px]:[&_>_div:first-child]:col-1 max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} aria-labelledby="recognition-title">
          <div data-reveal>
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Onde a prevenção costuma quebrar</span>
            <h2 id="recognition-title">O problema raramente começa na fiscalização.</h2>
          </div>
          <div className={"col-[7/13] [&_article]:grid [&_article]:grid-cols-[48px_minmax(0,.72fr)_minmax(0,1fr)] [&_article]:gap-[24px] [&_article]:items-start [&_article]:p-[24px_0] [&_article]:border-t [&_article]:border-solid [&_article]:border-t-[var(--landing-line)] [&_article:last-child]:border-b [&_article:last-child]:border-solid [&_article:last-child]:border-b-[var(--landing-line)] [&_article_>_span]:text-(--landing-emerald) [&_article_>_span]:text-[12px] [&_article_>_span]:font-bold [&_article_>_span]:leading-[16px] [&_h3]:text-(--landing-navy-strong) [&_h3]:text-[20px] [&_h3]:leading-[28px] [&_p]:text-(--landing-muted) [&_p]:text-[16px] [&_p]:leading-[24px] max-[900px]:col-1 max-[560px]:[&_article]:grid-cols-[32px_minmax(0,1fr)] max-[560px]:[&_article]:gap-[12px_16px] max-[560px]:[&_article_p]:col-2"}>
            {risks.map(([index, title, copy]) => (
              <article key={index} data-reveal>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
        <section className={String.raw`p-[96px_max(24px,calc((100vw-1280px)/2))] text-white [background:var(--landing-navy-strong)] [&_.landing-v0\_\_eyebrow]:text-[#6ee7b7] max-[900px]:p-[80px_16px]`} id="prevencao" aria-labelledby="prevention-title">
          <div className={"grid grid-cols-12 gap-[24px] [&_>_span]:col-[1/4] [&_h2]:col-[4/12] [&_h2]:max-w-[880px] [&_h2]:text-[48px] [&_h2]:font-semibold [&_h2]:leading-none [&_h2]:tracking-[-.035em] max-[900px]:grid-cols-[1fr] max-[900px]:[&_>_span]:col-1 max-[900px]:[&_h2]:col-1 max-[560px]:[&_h2]:text-[36px] max-[560px]:[&_h2]:leading-[40px]"} data-reveal>
            <span className={"landing-v0__eyebrow block text-(--landing-emerald) text-[12px] font-[650] leading-[16px] tracking-[.08em] uppercase"}>Uma rotina viva</span>
            <h2 id="prevention-title">Prevenção não é um documento guardado.<br />É o próximo desvio que sua equipe consegue enxergar.</h2>
          </div>
          <div className={"grid grid-cols-[repeat(3,1fr)] gap-[24px] mt-[80px] [&_article]:pt-[24px] [&_article]:border-t [&_article]:border-solid [&_article]:border-t-[rgb(255_255_255/18%)] [&_article]:text-center [&_article_>_div]:relative [&_article_>_div]:grid [&_article_>_div]:h-[180px] [&_article_>_div]:place-items-center [&_article_>_div_span]:absolute [&_article_>_div_span]:top-0 [&_article_>_div_span]:left-0 [&_article_>_div_span]:text-[#6ee7b7] [&_article_>_div_span]:text-[12px] [&_article_>_div_span]:font-bold [&_img]:w-[160px] [&_img]:h-[160px] [&_img]:object-contain [&_img]:filter-[drop-shadow(0_16px_24px_rgb(0_0_0/24%))] [&_h3]:text-[24px] [&_h3]:leading-[32px] [&_p]:max-w-[36ch] [&_p]:m-[12px_auto_0] [&_p]:text-[#cad6df] [&_p]:text-[16px] [&_p]:leading-[24px] max-[900px]:grid-cols-[1fr] max-[900px]:mt-[64px] max-[900px]:[&_article]:grid max-[900px]:[&_article]:grid-cols-[160px_minmax(0,1fr)] max-[900px]:[&_article]:gap-x-[24px] max-[900px]:[&_article]:text-left max-[900px]:[&_article_>_div]:row-[1/3] max-[900px]:[&_article_>_div]:h-auto max-[900px]:[&_p]:mr-0 max-[900px]:[&_p]:ml-0 max-[560px]:[&_article]:grid-cols-[112px_minmax(0,1fr)] max-[560px]:[&_img]:w-[104px] max-[560px]:[&_img]:h-[104px]"}>
            {preventionSteps.map((step) => (
              <article key={step.index} data-reveal>
                <div><span>{step.index}</span><img src={step.image} alt="" /></div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
          <div className={"flex items-center justify-center gap-[24px] mt-[64px] pt-[32px] border-t border-solid border-t-[rgb(255_255_255/18%)] [&_p]:text-[#cad6df] [&_p]:text-[16px] [&_p]:leading-[24px] max-[900px]:justify-start max-[560px]:items-start max-[560px]:flex-col max-[560px]:gap-[16px]"} data-reveal>
            <p>Veja essa rotina aplicada à sua operação.</p>
            <WhatsAppButton compact />
          </div>
        </section>
        <SearchContent />
      </main>

      <footer className={"landing-v0__footer grid grid-cols-[1fr_auto_1fr] items-center gap-[24px] min-h-[144px] p-[32px_max(24px,calc((100vw-1280px)/2))] text-(--landing-muted) bg-white [&_>_p]:text-[14px] [&_>_p]:leading-[20px] [&_>_div]:flex [&_>_div]:justify-end [&_>_div]:gap-[24px] [&_>_div]:text-[12px] [&_>_div]:leading-[16px] max-[900px]:grid-cols-[1fr] max-[900px]:justify-items-start max-[900px]:[&_>_div]:justify-start"}>
        <a className={"inline-flex items-center gap-[8px] w-max text-(--landing-navy-strong) text-[20px] font-bold tracking-[-.04em] no-underline [&_img]:w-[32px] [&_img]:h-[32px] [&_img]:object-contain max-[560px]:[&_span]:text-[18px]"} href="#inicio">
          <img src="/brand/nexasst-symbol-flat.png" alt="" />
          <span>NexaSST</span>
        </a>
        <p>Prevenção ativa com operação rastreável. <a href="/index.md">NexaSST em Markdown</a> · <a href="/llms.txt">Índice para IA</a></p>
        <div><a href="/sobre/">Sobre</a><a href="/modulos/treinamentos/">Módulos</a><a href="/privacidade/">Política de Privacidade</a><a href="/termos-de-uso/">Termos e Condições de Uso</a></div>
      </footer>
    </div>
  );
}
