---
name: NexaSST
description: Comando operacional sereno para gestão de saúde e segurança do trabalho.
colors:
  canvas: "#f4f2ec"
  surface: "#fffefa"
  ink: "#13211d"
  muted: "#53635d"
  line: "#d8ddd8"
  accent: "#146c54"
  accent-strong: "#0c503d"
  danger: "#a6342b"
  danger-surface: "#fff8f7"
  control-border: "#bac3bd"
  control-focus: "rgb(20 108 84 / 16%)"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.8rem, 3vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.2rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 750
rounded:
  compact: "0.5rem"
  icon: "0.65rem"
  control: "0.75rem"
  panel: "0.875rem"
  pill: "999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
    height: "2.8rem"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
    textColor: "#ffffff"
  button-secondary:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.65rem 1rem"
    height: "2.8rem"
  input:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.65rem 0.75rem"
    height: "2.75rem"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "1.5rem"
  badge-success:
    backgroundColor: "#dff1e9"
    textColor: "#0b5b40"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.5rem"
  navigation-active:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.icon}"
    padding: "0.65rem 0.75rem"
---

# Design System: NexaSST

## Overview

**Creative North Star: "Comando Sereno"**

O NexaSST apresenta operações complexas com a calma de uma central de comando bem organizada. O canvas quente e as superfícies marfim reduzem fadiga; tinta verde muito escura sustenta a hierarquia; esmeralda aparece onde orienta navegação, foco ou ação. A expressão é editorial na clareza e operacional na densidade.

O sistema privilegia contexto explícito, divisórias finas e números fáceis de comparar. A composição de cada dashboard pode variar conforme o trabalho: a faixa contextual única é um padrão confirmado, mas a distribuição específica entre gráficos, prioridades e detalhes não é uma regra global.

**Key Characteristics:**

- Canvas quente e superfícies marfim com contraste baixo entre camadas.
- Tinta profunda, esmeralda funcional e cores semânticas reservadas para estado.
- Bordas finas, cantos contidos e sombras ambientais discretas.
- Densidade operacional legível, com contexto sempre aparente.
- Numerais tabulares para indicadores, datas e paginação.

## Colors

A paleta combina neutros quentes e verdes sóbrios; cor saturada comunica ação ou estado, nunca decoração gratuita.

### Primary

- **Esmeralda Operacional** (`colors.accent`): ações primárias, navegação ativa, seleção e indicadores positivos.
- **Esmeralda Profunda** (`colors.accent-strong`): texto de links, ícones e estados de hover que exigem mais contraste.

### Secondary

- **Perigo Ferrugem** (`colors.danger`): erros, invalidação e indicadores críticos.
- **Véu de Perigo** (`colors.danger-surface`): fundo de ações destrutivas sem competir com o conteúdo.

### Neutral

- **Canvas Linho** (`colors.canvas`): plano de fundo quente da aplicação e trilho de controles segmentados.
- **Marfim de Superfície** (`colors.surface`): painéis, menus e contêineres principais.
- **Tinta Profunda** (`colors.ink`): texto principal e ícones de alta prioridade.
- **Texto Sálvia** (`colors.muted`): descrições, metadados e rótulos de apoio.
- **Linha Mineral** (`colors.line`): divisórias e contornos de baixo contraste.
- **Borda de Controle** (`colors.control-border`): limite perceptível de campos interativos.
- **Halo de Foco** (`colors.control-focus`): foco acessível sem alterar a geometria do componente.

### Named Rules

**The Cor Tem Função Rule.** Esmeralda confirma ação, seleção ou estado positivo; perigo e avisos aparecem apenas quando o dado os justifica.

**The Escuro Estratégico Rule.** Superfícies escuras são exceções de alta prioridade, não um tratamento padrão para todo card.

## Typography

**Display Font:** System UI (`ui-sans-serif` com fallbacks nativos)
**Body Font:** System UI (`ui-sans-serif` com fallbacks nativos)

**Character:** Uma única família sans-serif nativa mantém a interface rápida, familiar e precisa. Peso, escala e espaçamento fazem a hierarquia; não há contraste ornamental entre famílias.

### Hierarchy

- **Display** (700, fluido de 2rem a 3.75rem, line-height 1.02): títulos de páginas editoriais com limite curto de linha.
- **Headline** (700, fluido de 1.8rem a 2.75rem, line-height 1.02): contexto principal de workspaces e módulos.
- **Title** (700, 1.2rem): títulos de seção e painéis.
- **Body** (400, 1rem, line-height 1.6): explicações e conteúdo corrido, normalmente limitado a 68–72 caracteres.
- **Label** (750, 0.78rem): rótulos compactos de controles e metadados; em telas estreitas, texto operacional sobe para pelo menos 0.875rem (14px).

### Named Rules

**The Número Estável Rule.** Indicadores, datas, totais e paginação usam numerais tabulares para preservar alinhamento e leitura comparativa.

## Layout

O shell desktop usa conteúdo centralizado e, no contexto empresarial, uma navegação lateral de 17rem com área principal fluida. A lateral contém somente raízes de navegação; subseções vivem nas abas horizontais do próprio módulo. Painéis operacionais usam grids responsivos e espaçamento recorrente de 1rem; a largura útil varia entre 82rem e 100rem conforme a densidade da área.

Em até 800px, a navegação lateral vira drawer e composições principais colapsam para uma coluna. Listas com edição contextual mantêm o editor ao lado no desktop e o empilham abaixo da lista em telas estreitas, preservando a seleção e uma ação de fechar explícita. Em até 520px, métricas e detalhes empilham, os textos operacionais chegam a pelo menos 14px e controles de alternância atingem 2.75rem (44px). A faixa contextual reúne escopo, período e atualização; ela se reorganiza sem perder essas informações.

## Elevation & Depth

O sistema é plano por padrão e usa uma sombra ambiental baixa nos painéis para separá-los do canvas sem aparência flutuante. Bordas e mudanças tonais fazem a maior parte do trabalho estrutural; menus, drawer e a superfície excepcional de prioridades recebem profundidade apenas quando a hierarquia exige.

### Shadow Vocabulary

- **Painel ambiental** (`0 0.75rem 2.5rem -1.75rem rgb(19 33 29 / 35%)`): painéis principais, menus e superfícies persistentes.
- **Prioridade contida** (`0 12px 30px rgb(19 37 31 / 14%)`): painel escuro de prioridades operacionais.
- **Seleção baixa** (`0 0.35rem 1rem -0.65rem rgb(19 33 29 / 45%)`): estado selecionado dentro de controles segmentados.

### Named Rules

**The Baixo Relevo Rule.** A sombra separa camadas; borda, contraste tonal e espaçamento continuam responsáveis pela hierarquia.

## Shapes

Controles usam cantos gentilmente contidos (`rounded.control`), painéis ampliam o raio apenas um passo (`rounded.panel`) e itens internos ficam entre `rounded.compact` e `rounded.icon`. Pílulas (`rounded.pill`) pertencem a badges, contadores e estados compactos. Bordas de 1px preservam continuidade entre métricas, listas e tabelas; formas totalmente arredondadas não substituem a geometria operacional.

## Components

Os componentes são firmes, compactos e previsíveis. Estados mudam cor e contraste com transições curtas; foco visível usa halo esmeralda e movimento respeita `prefers-reduced-motion`.

### Buttons

- **Shape:** cantos contidos (`rounded.control`) e altura padrão de 2.8rem.
- **Primary:** fundo esmeralda, texto branco e padding de 0.65rem por 1rem.
- **Hover / Focus:** hover escurece para Esmeralda Profunda; foco usa halo de 3px; active desloca 1px verticalmente.
- **Secondary / Ghost / Danger:** secundário usa fundo branco e borda mineral; ghost preserva fundo transparente; danger combina texto ferrugem e fundo de perigo claro.

### Chips

- **Style:** badges semânticos usam padding de 0.25rem por 0.5rem, raio de pílula e peso 800.
- **State:** tons neutral, success, warning, danger e info comunicam significado também por texto, nunca apenas por cor.

### Cards / Containers

- **Corner Style:** raio de painel (`rounded.panel`).
- **Background:** Marfim de Superfície sobre Canvas Linho; o painel de prioridades pode usar tinta verde muito escura como exceção funcional.
- **Shadow Strategy:** sombra ambiental baixa com borda de 1px.
- **Internal Padding:** normalmente 1rem a 1.5rem conforme a densidade.

### Inputs / Fields

- **Style:** fundo branco, Borda de Controle, altura mínima de 2.75rem e raio de controle.
- **Focus:** borda esmeralda com Halo de Foco de 3px.
- **Error / Disabled:** erro muda a borda para Perigo Ferrugem; desabilitado usa neutro frio e cursor bloqueado.

### Navigation

Itens têm altura mínima de 2.65rem, tipografia de 0.86rem em peso 700 e ícone alinhado ao rótulo. Hover usa um verde acinzentado baixo; o item ativo recebe fundo esmeralda e texto branco. No mobile, a lateral se torna drawer com scrim e botão de navegação visível.

A sidebar lista apenas as raízes de navegação. Seções internas de um módulo usam abas horizontais com linha-base mineral e sublinhado esmeralda no item ativo; URLs preservam a aba para retorno, histórico e compartilhamento. Quando as abas excedem a largura disponível, a faixa rola horizontalmente e recentraliza a aba ativa depois de mudança de rota ou de viewport, sem depender de interação manual.

### Side Editors

Cadastros contextuais usam uma composição mestre–detalhe: lista principal e `EditorPanel` lado a lado no desktop, com cabeçalho próprio, descrição curta e fechar acessível. No mobile, o editor entra no fluxo abaixo da lista em vez de virar uma camada estreita ou ocultar o contexto da seleção.

### Parent–Child Catalogs

Quando um catálogo pai puder nascer com registros filhos opcionais, a criação reúne ambos no mesmo editor. Filhos ainda não persistidos aparecem como chips de rascunho removíveis e são salvos com o pai na mesma operação transacional; depois da criação, os filhos existentes são adicionados, editados ou arquivados somente após selecionar o pai.

### Multi-step Workflows

Cadastros que dependem de sequência usam um stepper numerado e conectado, com rótulos curtos e estados distintos para futuro bloqueado, atual e concluído; publicação ou conclusão ocupa a etapa final do fluxo. Etapas concluídas podem ser revisitadas, etapas futuras permanecem desabilitadas e avançar persiste o rascunho no servidor. Fechar um rascunho não concluído pede confirmação antes de arquivá-lo.

Quando o fluxo exige várias etapas e bastante contexto, `WorkflowModal` fornece um diálogo nativo compartilhado com cabeçalho e rodapé persistentes, corpo rolável e largura máxima de 70rem. Matriz e Turmas usam esse shell; em até 640px ele ocupa a viewport inteira e empilha as ações. Cadastros simples continuam em `EditorPanel` ou no fluxo da página, sem promoção automática para modal.

### Confirmation Dialogs

Ações destrutivas usam um diálogo modal reutilizável e acessível, com título e descrição associados, alvo explícito, consequência em linguagem de negócio, ação secundária `Cancelar` e confirmação em tom de perigo. Escape e fechamento nativo seguem o mesmo caminho de cancelamento; durante a mutação, a confirmação comunica estado ocupado. O modal não promete sucesso quando referências ativas podem bloquear a operação.

### Evidence-gated Completion

Uma turma de treinamento só pode avançar à revisão quando há ao menos uma evidência coletiva ou uma evidência individual para cada participante selecionado. A conclusão envia evidências coletivas e individuais com os participantes e só então apresenta o treinamento como concluído; quantidade de anexos isolada não substitui a cobertura exigida.

### Operational Metrics

Métricas compartilham um contêiner contínuo dividido por linhas de 1px. Ícone em bloco suave, rótulo compacto, valor em 1.85rem com numerais tabulares e detalhe curto criam leitura em varredura; success, warning e danger alteram o valor apenas quando o estado exige.

## Vocabulário de interface

- **Área** é uma raiz de navegação, como Pessoas e estrutura ou Treinamentos; **ação** é uma operação explícita do usuário, como cadastrar, publicar ou arquivar.
- **Visão geral** nomeia o painel de leitura e decisão de uma área. Não use “dashboard” na interface quando o rótulo em português for suficiente.
- **Primeiro uso** explica o benefício e oferece a ação inicial quando ainda não existe conteúdo.
- **Sem resultados** informa que filtros ou busca não encontraram registros e oferece limpar ou ajustar esses critérios.
- **Sem permissão** explica a restrição de acesso sem sugerir que o dado não existe.
- Estados vazios nunca exibem placeholders de implementação, “TODO da API” ou promessas técnicas ao usuário final.

## Do's and Don'ts

### Do:

- **Do** mantenha empresa, filial, módulo e período visíveis quando forem relevantes à decisão.
- **Do** use bordas finas e alinhamento para organizar densidade antes de adicionar sombra ou cor.
- **Do** preserve texto operacional em pelo menos 14px e alvos de toque em pelo menos 44px no mobile.
- **Do** use rótulos, ícones e texto para reforçar estados comunicados por cor.

### Don't:

- **Don't** transforme toda superfície em card independente; prefira painéis contínuos quando os dados formarem um conjunto.
- **Don't** espalhe esmeralda, perigo ou avisos como decoração sem significado operacional.
- **Don't** promova a proporção ou a ordem de um dashboard específico a regra para outras telas.
- **Don't** esconda contexto, foco ou estado apenas para reduzir densidade visual.
