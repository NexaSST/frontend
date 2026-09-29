import { useEffect, useRef } from 'react';
import { SearchContent } from '../seo/SearchContent.js';
import { siteTitle, siteDescription, siteUrl } from '../seo/content.js';

const WHATSAPP_URL = 'https://wa.me/5542998366677?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20NexaSST.';
const WHATSAPP_PLANS_URL = 'https://wa.me/5542998366677?text=Ol%C3%A1%2C%20gostaria%20de%20conhecer%20os%20planos%20do%20NexaSST.';
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
  ['Ergonomia', 'AEP, AET e ações organizadas para acompanhar o que precisa mudar.'],
  ['Inventário de espaços confinados', 'Cadastros, planos de resgate e responsáveis técnicos organizados por espaço, com identificação por QR Code.'],
] as const;

type ComparisonState = 'native' | 'partial' | 'none' | 'integration' | 'project';

const comparisonRows: ReadonlyArray<{
  feature: string;
  nexa: ComparisonState;
  a: ComparisonState;
  b: ComparisonState;
  c: ComparisonState;
  emphasis?: boolean;
}> = [
  { feature: 'Matriz de treinamentos por colaborador e NRs', nexa: 'native', a: 'native', b: 'none', c: 'none' },
  { feature: 'Emissão digital de APR e Permissão de Trabalho', nexa: 'native', a: 'none', b: 'native', c: 'none' },
  { feature: 'Análise ergonômica AEP/AET — NR-17', nexa: 'native', a: 'partial', b: 'none', c: 'none' },
  { feature: 'Inspeções digitais e checklists', nexa: 'native', a: 'partial', b: 'native', c: 'native' },
  { feature: 'Trava preventiva antes da tarefa', nexa: 'project', a: 'none', b: 'none', c: 'none', emphasis: true },
  { feature: 'Validação de capacitação em portaria ou catraca', nexa: 'integration', a: 'none', b: 'none', c: 'none' },
  { feature: 'Perfil público e leitura rápida por QR Code', nexa: 'native', a: 'partial', b: 'partial', c: 'native' },
  { feature: 'Evidência com data/hora e captura pela câmera', nexa: 'native', a: 'partial', b: 'native', c: 'native' },
  { feature: 'Conectividade MCP com agentes de IA', nexa: 'project', a: 'none', b: 'none', c: 'none' },
];

const comparisonLabels: Record<ComparisonState, { short: string; label: string }> = {
  native: { short: '✓', label: 'Completo ou nativo' },
  partial: { short: '◐', label: 'Parcial ou documental' },
  none: { short: '—', label: 'Não oferecido' },
  integration: { short: '+', label: 'Disponível por integração' },
  project: { short: '○', label: 'Oferta sob projeto' },
};

const combos = [
  {
    name: 'Starter',
    audience: 'Pequenas operações',
    price: 'R$ 1.690',
    oldPrice: 'R$ 2.260',
    items: ['50 colaboradores', '2 inspetores e 100 ativos', '50 emissões de APR ou PT', '5 laudos de ergonomia'],
    featured: false,
  },
  {
    name: 'Growth',
    audience: 'Operações médias',
    price: 'R$ 3.890',
    oldPrice: 'R$ 5.060',
    items: ['150 colaboradores', '5 inspetores e 300 ativos', '200 emissões de APR ou PT', '15 laudos de ergonomia'],
    featured: true,
  },
  {
    name: 'Scale',
    audience: 'Indústrias e operações amplas',
    price: 'R$ 9.645',
    oldPrice: 'R$ 12.860',
    items: ['500 colaboradores', '15 inspetores e 1.000 ativos', '500 emissões de APR ou PT', '30 laudos de ergonomia'],
    featured: false,
  },
] as const;

const questions = [
  ['O NexaSST substitui o profissional de SST?', 'Não. O sistema organiza operação, prazos e evidências. As decisões técnicas e legais continuam com os profissionais habilitados e com a empresa.'],
  ['Funciona sem internet no campo?', 'O aplicativo de inspeções preserva o trabalho no aparelho e mostra o estado da sincronização até o servidor confirmar o recebimento.'],
  ['Preciso contratar todos os módulos?', 'Não. Existem módulos avulsos e combos por porte. A demonstração ajuda a identificar a composição adequada para a operação.'],
  ['O sistema garante que a empresa não será multada?', 'Não. O NexaSST apoia prevenção, organização e rastreabilidade, mas não substitui as obrigações legais nem garante o resultado de uma fiscalização.'],
] as const;

function WhatsAppButton({ compact = false, intent = 'demo', secondary = false }: { compact?: boolean; intent?: 'demo' | 'plans' | 'confined-spaces'; secondary?: boolean }) {
  const action = intent === 'plans'
    ? { href: WHATSAPP_PLANS_URL, label: 'Ver planos' }
    : intent === 'confined-spaces'
      ? { href: WHATSAPP_CONFINED_SPACES_URL, label: 'Solicitar proposta' }
      : { href: WHATSAPP_URL, label: 'Agendar demonstração' };
  return (
    <span className="landing-v0__cta-wrap">
      <a
        className={`landing-v0__cta${compact ? ' landing-v0__cta--compact' : ''}${secondary ? ' landing-v0__cta--secondary' : ''}`}
        href={action.href}
        target="_blank"
        rel="noreferrer"
      >
        {action.label}
      </a>
      {!compact && <small>Conversa direta pelo WhatsApp, sem formulário longo.</small>}
    </span>
  );
}

function ComparisonStatus({ state }: { state: ComparisonState }) {
  const status = comparisonLabels[state];
  return (
    <span className={`landing-v0__comparison-status landing-v0__comparison-status--${state}`} aria-label={status.label}>
      <b aria-hidden="true">{status.short}</b>
      <span>{status.label}</span>
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
    root.classList.add('landing-v0--motion-ready');

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
    <div className="landing-v0" ref={landingRef}>
      <a className="landing-v0__skip" href="#conteudo">Ir para o conteúdo</a>

      <header className="landing-v0__header">
        <a className="landing-v0__brand" href="#inicio" aria-label="NexaSST, início da apresentação">
          <img src="/brand/nexasst-symbol-flat.png" alt="" />
          <span>NexaSST</span>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#prevencao">Prevenção ativa</a>
          <a href="#rastreabilidade">QR e rastreio</a>
          <a href="#comparativo">Comparativo</a>
          <a href="#planos">Planos</a>
        </nav>
        <div className="landing-v0__header-actions">
          <a href="/login">Entrar</a>
          <WhatsAppButton compact />
        </div>
      </header>

      <main id="conteudo">
        <section className="landing-v0__hero" id="inicio">
          <div className="landing-v0__hero-content" data-reveal="hero">
            <span className="landing-v0__eyebrow">Prevenção ativa para segurança do trabalho</span>
            <h1>Risco visto cedo custa menos.</h1>
            <p>O NexaSST reúne inspeções, treinamentos, APR/PT, ergonomia e inventário de espaços confinados em uma rotina de prevenção com prazos, evidências e decisões conectadas.</p>
            <div className="landing-v0__hero-actions">
              <WhatsAppButton compact />
              <WhatsAppButton compact intent="plans" secondary />
            </div>
            <span>Feito para a operação brasileira, no escritório e no campo, mesmo quando a internet falha.</span>
          </div>
        </section>

        <section className="landing-v0__recognition" aria-labelledby="recognition-title">
          <div data-reveal>
            <span className="landing-v0__eyebrow">Onde a prevenção costuma quebrar</span>
            <h2 id="recognition-title">O problema raramente começa na fiscalização.</h2>
          </div>
          <div className="landing-v0__risk-list">
            {risks.map(([index, title, copy]) => (
              <article key={index} data-reveal>
                <span>{index}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-v0__prevention" id="prevencao" aria-labelledby="prevention-title">
          <div className="landing-v0__prevention-head" data-reveal>
            <span className="landing-v0__eyebrow">Uma rotina viva</span>
            <h2 id="prevention-title">Prevenção não é um documento guardado.<br />É o próximo desvio que sua equipe consegue enxergar.</h2>
          </div>
          <div className="landing-v0__prevention-grid">
            {preventionSteps.map((step) => (
              <article key={step.index} data-reveal>
                <div><span>{step.index}</span><img src={step.image} alt="" /></div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
          <div className="landing-v0__prevention-action" data-reveal>
            <p>Veja essa rotina aplicada à sua operação.</p>
            <WhatsAppButton compact />
          </div>
        </section>

        <section className="landing-v0__product" id="produto" aria-labelledby="product-title">
          <div className="landing-v0__product-copy" data-reveal="left">
            <span className="landing-v0__eyebrow">Campo e gestão no mesmo fluxo</span>
            <h2 id="product-title">A evidência acompanha o trabalho, não uma pasta esquecida.</h2>
            <p>O aplicativo registra a execução em campo. O painel organiza prazos, responsáveis e contexto para a equipe que precisa decidir.</p>
          </div>
          <div className="landing-v0__product-stack">
            <figure className="landing-v0__product-frame landing-v0__product-frame--web" data-reveal="left">
              <img src="/landing/product/web-dashboard-training.png" alt="Painel web do NexaSST mostrando cobertura e pontos de atenção em treinamentos" />
              <figcaption><span>Painel web em execução</span><strong>Cobertura, vencimentos e pontos de atenção</strong></figcaption>
            </figure>
            <figure className="landing-v0__product-frame landing-v0__product-frame--mobile" data-reveal="right">
              <img src="/landing/product/mobile-field-home.webp" alt="Tela inicial do aplicativo NexaSST com ativos mapeados, vencimentos e sincronização de dados" />
              <figcaption><span>Aplicativo em execução</span><strong>Ativos, vencimentos e sincronização no campo</strong></figcaption>
            </figure>
          </div>
        </section>

        <section className="landing-v0__qr" id="rastreabilidade" aria-labelledby="qr-title">
          <div className="landing-v0__qr-visual" data-reveal="left">
            <img src="/illustrations/safety/qrcode.webp" alt="Código QR tridimensional representando identificação no ponto de uso" />
            <span>Identificação no ponto de uso</span>
          </div>
          <div className="landing-v0__qr-copy">
            <div data-reveal>
              <span className="landing-v0__eyebrow">Rastreabilidade por QR Code</span>
              <h2 id="qr-title">A evidência começa ligada à pessoa, ao ativo e ao espaço certos.</h2>
              <p>O QR Code reduz a distância entre o campo e a gestão. Cada leitura abre o contexto correto para consultar informações publicadas e acompanhar a operação.</p>
            </div>
            <div className="landing-v0__qr-cases">
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

        <section className="landing-v0__finance" aria-labelledby="finance-title">
          <div className="landing-v0__finance-rail" data-reveal="left">Custo operacional começa antes da penalidade</div>
          <div data-reveal>
            <h2 id="finance-title">A multa é só uma das formas de pagar por um risco percebido tarde.</h2>
            <p>Parada, retrabalho, treinamento emergencial, investigação e evidência dispersa também consomem a operação. O NexaSST ajuda a agir antes e a manter rastreabilidade do que foi identificado e executado.</p>
          </div>
        </section>

        <section className="landing-v0__solutions" id="solucoes" aria-labelledby="solutions-title">
          <header data-reveal>
            <span className="landing-v0__eyebrow">Resultados por operação</span>
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
            <div className="landing-v0__solutions-action" data-reveal>
              <WhatsAppButton compact intent="plans" />
            </div>
          </div>
        </section>

        <section className="landing-v0__comparison" id="comparativo" aria-labelledby="comparison-title">
          <header data-reveal>
            <div>
              <span className="landing-v0__eyebrow">Um ecossistema, não ferramentas isoladas</span>
              <h2 id="comparison-title">Compare a cobertura operacional.</h2>
            </div>
            <p>O diferencial está em conectar capacitação, risco, tarefa, ativo e evidência. Recursos que dependem de integração ou projeto continuam indicados dessa forma.</p>
          </header>

          <div className="landing-v0__comparison-shell" tabIndex={0} aria-label="Tabela comparativa; deslize horizontalmente em telas menores">
            <table>
              <caption className="sr-only">Comparação anonimizada entre abordagens de software de segurança do trabalho</caption>
              <thead>
                <tr>
                  <th scope="col">Funcionalidade ou recurso</th>
                  <th className="landing-v0__comparison-nexa" scope="col"><strong>NexaSST</strong><span>Ecossistema conectado</span></th>
                  <th scope="col"><strong>Solução A</strong><span>Medicina e eSocial</span></th>
                  <th scope="col"><strong>Solução B</strong><span>Risco e PT</span></th>
                  <th scope="col"><strong>Solução C</strong><span>Checklists e incêndio</span></th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className={row.emphasis ? 'landing-v0__comparison-emphasis' : undefined}>
                    <th scope="row">{row.feature}</th>
                    <td className="landing-v0__comparison-nexa"><ComparisonStatus state={row.nexa} /></td>
                    <td><ComparisonStatus state={row.a} /></td>
                    <td><ComparisonStatus state={row.b} /></td>
                    <td><ComparisonStatus state={row.c} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer data-reveal>
            <div className="landing-v0__comparison-legend" aria-label="Legenda">
              {(['native', 'partial', 'integration', 'project', 'none'] as const).map((state) => <ComparisonStatus state={state} key={state} />)}
            </div>
            <p>Comparação de abordagens anonimizada para orientação comercial. A disponibilidade final varia conforme módulo, plano, integração e escopo contratado.</p>
          </footer>
        </section>

        <section className="landing-v0__pricing" id="planos" aria-labelledby="pricing-title">
          <header data-reveal>
            <div>
              <span className="landing-v0__eyebrow">Combos do ecossistema</span>
              <h2 id="pricing-title">Uma base proporcional ao tamanho da operação.</h2>
            </div>
            <p>Os combos reúnem inspeções, treinamentos, APR/PT e ergonomia. O Inventário de Espaços Confinados é contratado à parte; os módulos também podem ser escolhidos individualmente.</p>
          </header>
          <div className="landing-v0__pricing-grid">
            {combos.map((combo) => (
              <article className={combo.featured ? 'landing-v0__price landing-v0__price--featured' : 'landing-v0__price'} key={combo.name} data-reveal>
                {combo.featured && <span className="landing-v0__price-badge">Recomendado para crescer</span>}
                <p>{combo.audience}</p>
                <h3>Combo {combo.name}</h3>
                <div><del>{combo.oldPrice}</del><strong>{combo.price}</strong><span>por mês</span></div>
                <ul>{combo.items.map((item) => <li key={item}>{item}</li>)}</ul>
                <WhatsAppButton compact />
              </article>
            ))}
          </div>
          <div className="landing-v0__module-offer" data-reveal>
            <div>
              <span className="landing-v0__eyebrow">Módulo contratado à parte</span>
              <h3>Inventário de espaços confinados</h3>
              <p>Organize espaços, planos de resgate e publicação por QR Code. Converse com a equipe para definir o escopo e receber uma proposta para sua operação.</p>
            </div>
            <div className="landing-v0__module-offer-action">
              <strong>Valor sob consulta</strong>
              <WhatsAppButton compact intent="confined-spaces" />
            </div>
          </div>
          <p className="landing-v0__pricing-note">Trava preventiva para APR e PT: oferta sob projeto e orçamento.</p>
        </section>

        <section className="landing-v0__faq" aria-labelledby="faq-title">
          <div data-reveal>
            <span className="landing-v0__eyebrow">Perguntas diretas</span>
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

        <SearchContent />

        <section className="landing-v0__closing" aria-labelledby="closing-title">
          <img src="/illustrations/safety/safety-harness.webp" alt="Cinto de segurança em três dimensões" data-reveal="left" />
          <div data-reveal>
            <span className="landing-v0__eyebrow">Veja com a sua operação</span>
            <h2 id="closing-title">A demonstração começa pelos seus riscos, não por uma apresentação genérica.</h2>
            <p>Mostre como sua equipe trabalha hoje. O NexaSST entra na conversa a partir do que precisa ser prevenido, registrado e acompanhado.</p>
            <WhatsAppButton />
          </div>
        </section>
      </main>

      <footer className="landing-v0__footer">
        <a className="landing-v0__brand" href="#inicio">
          <img src="/brand/nexasst-symbol-flat.png" alt="" />
          <span>NexaSST</span>
        </a>
        <p>Prevenção ativa com operação rastreável. <a href="/index.md">NexaSST em Markdown</a> · <a href="/llms.txt">Índice para IA</a></p>
        <div><a href="/privacidade/">Política de Privacidade</a><a href="/termos-de-uso/">Termos e Condições de Uso</a></div>
      </footer>
    </div>
  );
}
