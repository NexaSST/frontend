# NexaSST landing page strategy v0

## Critical premise

The visitor is not shopping for an SST platform. They are trying to avoid missed deadlines, weak evidence, rework, operational interruption and exposure when something goes wrong. The page must sell recognition before it sells software.

The safest positioning is not “we prevent fines”. No system can guarantee compliance or remove legal exposure. The credible promise is that NexaSST helps the company build a continuous, traceable prevention routine and act earlier, which improves operational control and the quality of evidence.

## Design read

```yaml
artifact: conversion landing page
audience: SST technicians and coordinators as champions, with operations, HR and owners as economic buyers
visual-language: calm industrial instrument with editorial evidence and tactile 3D safety objects
mode: redesign-preserve across the product brand, greenfield for the public landing page
visual-variance: 7
motion-intensity: 5
information-density: 5
asset-dependence: 8
brand-fidelity: 9
```

Concrete consequences:

- A strict grid keeps legal and financial claims sober; asymmetry is concentrated in the hero and one narrative section.
- Motion explains the shift from reactive work to active prevention. Routine controls stay under 220ms.
- Real mobile and web screens are the product proof. The 3D assets attract attention but never impersonate product functionality.
- Navy and emerald from mobile become the public identity. The web application's warmer operational surfaces may appear inside screenshots only.

## Positioning questions answered

- Narrative role: diagnosis first, then mechanism, evidence, economic argument and action.
- Viewing distance: laptop first with a complete mobile path; body copy never drops below 16px and touch targets remain at least 44px.
- Visual temperature: authoritative and calm, with a human field ready warmth from the 3D objects.
- Capacity: one core claim per viewport. No repeated card walls or three consecutive image and text zigzags.

## One offer, one audience, one action

- Offer: a scheduled demonstration that starts from the visitor's current operational gaps and shows the relevant NexaSST workflow.
- Primary audience: SST professional who feels the operational pain and can influence a purchase.
- Economic audience: operations, HR, finance or business leadership that needs to understand avoidable exposure and recurring cost.
- Primary conversion: start a direct WhatsApp conversation to schedule the demonstration.
- Approved CTA: `Agendar demonstração`.
- Pending: connect the CTA after the official WhatsApp number with country and area code is provided.

## Layout recommendation

Use **B. Long form story**. The audience needs education and self recognition before product details or price. A classic SaaS hero followed by feature cards would assume category awareness that the brief explicitly says does not exist.

## Page outline

### 1. Hero: make the hidden cost visible

- Job: turn passive concern into an immediate, concrete reason to continue.
- Composition: top left lead with the 3D dimensional shield and safety objects forming a prevention orbit around one real mobile product crop. Avoid the default left text and right dashboard split.
- Headline v0: `Risco visto cedo custa menos.`
- Subheadline v0: `O NexaSST transforma inspeções, treinamentos, APR e ergonomia em uma rotina contínua de prevenção, com prazos, evidências e decisões no mesmo fluxo.`
- Primary CTA: `Agendar demonstração`
- Proof line: `Feito para a operação brasileira, no escritório e no campo, mesmo quando a internet falha.`
- Do not place pricing or a second competing CTA above the fold.

### 2. Recognition: where prevention usually breaks

- Job: let the visitor identify their own operational gap before naming modules.
- Structure: one continuous diagnostic rail, not a card grid.
- Signals: inspeção esquecida, treinamento vencendo, APR sem vínculo com a tarefa, evidência espalhada, ativo sem histórico, laudo ergonômico sem acompanhamento.
- Interaction option: select the two pains that happen most often and carry that context into the lead form.

### 3. Mechanism: prevention becomes a living routine

- Job: explain how active prevention works.
- Three stages: `Detectar no campo` → `Organizar evidências e prazos` → `Agir antes do desvio virar ocorrência`.
- Use the existing helmet, vest, hose, hearing protection and harness as authored anchors, not as decorative bullets.
- Mandatory tagline reveal: `O que sua equipe registra hoje ajuda a evitar o que sua empresa paga amanhã.`

### 4. Product proof: field and management stay connected

- Job: prove this is a working product, not a compliance promise.
- Show real mobile inspection and QR flow beside a real web management view.
- Evidence to highlight: offline queue remains visible, photos attach to inspections, deadlines surface before expiry, records remain linked to company and branch context.
- Never generate fake dashboards or invented metrics.

### 5. Financial case: cost appears before the fine

- Job: broaden the financial frame without fear based marketing.
- Explain cost categories: stopped work, urgent rework, missing evidence, retraining, replacement, investigation time, claims and administrative penalties.
- Copy guardrail: say `reduzir exposição`, `agir mais cedo` and `melhorar rastreabilidade`; never say `evitar qualquer multa`, `garantir conformidade` or `eliminar acidentes`.
- Official basis: GRO and PGR formalize continuous risk management; NR 28 governs inspection and administrative penalties; MPT action can include recommendations, TACs and civil actions, with case specific fines for breach.

### 6. Outcomes by operation, not features by module

- Inspections: know what is overdue and keep field evidence attached to the asset.
- Training: see validity, matrices and evidence before the schedule becomes a gap.
- APR and PT: connect risk analysis and authorization to the actual task.
- Ergonomics: organize AEP and AET work and follow the resulting actions.
- Only after the outcome is understood should each item reveal its product module name.

### 7. Commercial fit and pricing

- Recommendation: show pricing after value and proof, never as the first education device.
- Candidate offers from migrations: Starter at R$ 1.690 per month, Growth at R$ 3.890 per month and Scale at R$ 9.645 per month.
- Current blocker: the database configured in `backend/.env.local` does not contain the commercial catalog tables. Confirm the correct environment and commercial approval before publishing these values.
- Prefer `a partir de R$ 1.690 por mês` only if the Starter package truly fits the advertised diagnostic audience.
- Do not fetch the current master only endpoint directly from a public landing page. Add a public read only catalog contract or publish versioned approved content.

### 8. Objection handling and FAQ

1. O NexaSST substitui o profissional de SST?
   No. It organizes the operation, records and alerts. Technical and legal decisions remain with qualified professionals and the company.
2. Funciona sem internet no campo?
   The inspection app preserves work locally and shows synchronization status until the server confirms receipt.
3. Preciso contratar todos os módulos?
   The catalog supports modules and combos. The landing offer must reflect only commercially active options.
4. Consigo usar por empresa e filial?
   Yes. The product model keeps company and branch context explicit.
5. O sistema garante que a empresa não será multada?
   No. It supports prevention, organization and traceability, but does not replace legal compliance or guarantee an inspection outcome.
6. Posso anexar fotos e evidências?
   Yes, where the product workflow supports them, including inspection and training evidence.
7. Quanto tempo leva para começar?
   Commercial and onboarding must confirm a truthful answer before publication.
8. Meus dados ficam protegidos?
   Security and privacy copy must be reviewed against the deployed infrastructure and privacy policy before publication.

### 9. Final CTA and footer

- Repeat the same primary action: `Agendar demonstração`.
- Support line: `Mostre como sua operação funciona hoje. A conversa parte dos seus riscos, não de uma apresentação genérica.`
- Include privacy, terms, cookie consent where required, company identification and a direct contact path.

## Benefits

- **Enxergue o próximo desvio antes da urgência** — deadlines and operational gaps surface in the same context as the responsible workflow.
- **Mantenha a evidência ligada ao trabalho** — fotos, registros e histórico permanecem associados à inspeção, ao treinamento ou à tarefa.
- **Conecte campo e gestão** — offline capable mobile work reaches a web view designed for follow up and decisions.
- **Sustente decisões com rastreabilidade** — a empresa consegue mostrar o que foi identificado, atribuído, executado e sincronizado.
- **Escale a prevenção por módulo e filial** — a operação cresce sem perder o contexto atual de empresa, filial e permissão.

## SEO and AEO

- Recommendation: index the page because the offer is evergreen, but do not optimize only for the category term `software de SST`.
- Search intent clusters: `controle de inspeções de segurança`, `treinamentos NR vencidos`, `gestão de APR e PT`, `controle de equipamentos por QR`, `evidências de segurança do trabalho`, `gestão de riscos ocupacionais`.
- Title v0: `NexaSST | Prevenção ativa e rastreável para segurança do trabalho`
- Meta description v0: `Organize inspeções, treinamentos, APR, PT e ergonomia em uma rotina de prevenção com prazos, evidências e operação no campo.`
- Add plain language FAQ schema only after the answers and commercial claims are approved.

## Evidence and copy guardrails

- The Ministry of Labor describes GRO as coordinated prevention actions and PGR as the documented or electronic materialization of that continuous process: <https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/pgr>
- NR 28 establishes inspection procedures and administrative penalties for noncompliance with occupational safety and health rules: <https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-28-nr-28>
- The official eSocial manual defines SST events S 2210, S 2220 and S 2240 and their purposes: <https://www.gov.br/esocial/pt-br/empresas/manual-web-geral>
- The MPT describes CODEMAT as the national coordination for protecting occupational health and safety and reducing accidents and occupational diseases: <https://midia-ext.mpt.mp.br/pgt/apge/portal-sge/capacitacoes/2023/2023-semana-do-conhecimento.pdf>
- Published TAC examples show that obligations and breach penalties are case specific, not a universal fine table: <https://www.prt3.mpt.mp.br/procuradorias/ptm-governador-valadares/2291-tac-firmado-perante-o-mpt-garante-implementacao-de-normas-de-seguranca-para-prevenir-acidentes-em-construtora>

## Design decisions checkpoint

- Anchor: custom NexaSST active prevention system, led by the approved mobile identity.
- Palette: measured warm white, deep navy structure, emerald action and sparse semantic amber and red.
- Typography: Manrope throughout the landing UI; product screenshots preserve their native type.
- Spacing: 4px base with the constrained scale in `design-dna.json`.
- Radius: 6px, 12px and 16px according to component role; pills only for compact status.
- Shadows: three sparse navy tinted levels; borders and tonal shifts do most of the grouping.
- Motion: crisp 140ms and 220ms interactions, one 800ms narrative reveal, one word activation tagline, full reduced motion path.
- Narrative spine: precision instrument.
- Signature components: off grid hero, product UI panel stack, vertical prevention timeline and one oversized financial statement.
- Second read moment: a narrow side rail that translates each operational gap into its likely business cost without claiming a guaranteed amount.

## Confirmed decisions and remaining input

1. Conversion is a scheduled demonstration through direct WhatsApp contact.
2. Starter, Growth and Scale may be presented with the approved values in this document; database publication remains a later integration concern.
3. There is no publishable customer proof yet. The first release will use product proof and official sources, never testimonials or invented numbers.
4. The official WhatsApp number with country and area code remains required to activate the CTA.
