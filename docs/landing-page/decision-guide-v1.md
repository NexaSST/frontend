# Guia de decisão da landing page — implementação v1

## Objetivo e público

A conversão principal é uma demonstração contextualizada pelo WhatsApp. A página fala primeiro com o profissional de SST de uma empresa e fornece argumentos operacionais que ele possa levar à liderança. A indicação de oferta qualifica a conversa; não constitui proposta contratual nem promete que um combo seja ideal para todo visitante.

## Árvore de decisão

1. O visitante reconhece uma situação: prazos que viram urgência, evidências dispersas ou desconexão entre campo e gestão. A primeira situação abre a narrativa.
2. A página mostra o resultado operacional desejado e o fluxo real do NexaSST que o sustenta. A comparação anônima com Soluções A/B/C sai da página; seu lugar é ocupado por situações e resultados verificáveis, com telas reais quando houver.
3. Depois dos benefícios e antes dos preços, um guia curto pergunta a dor principal, os módulos de interesse e a escala aproximada. Cada campo de escala admite “não sei”. Não pede nome, contato nem dados de SST.
4. Se o interesse recair em um só módulo, o guia sugere conversar sobre módulo avulso. Para vários módulos, compara as necessidades informadas às franquias Starter, Growth e Scale. O menor combo que acomode todos os volumes conhecidos é um ponto de partida. Acima do Scale, ou quando faltarem dados essenciais, a saída é uma composição a definir na demonstração. A explicação da indicação mostra qual volume influenciou o resultado.
5. O resultado e os cards mantêm `Agendar demonstração` como ação principal. O link do WhatsApp leva apenas as escolhas feitas no guia e o ponto de partida indicado; o visitante pode revisar a mensagem antes de enviá-la.

## Oferta e preços

- Os preços mensais de Starter, Growth e Scale permanecem visíveis, assim como suas franquias, traduzidas em situações de uso. Os quatro módulos dos combos não são apresentados como degraus de funcionalidade: a diferença entre combos é principalmente capacidade.
- A soma dos valores de tabela dos módulos avulsos continua visível com o preço riscado, identificada como `Soma dos módulos avulsos`. Não é chamada de preço anterior. A comparação inclui ergonomia futura e deve trazer essa informação perto dos preços.
- Módulos avulsos são uma opção explícita para quem não precisa do conjunto do combo. Inventário de Espaços Confinados permanece separado e sob proposta. Trava Pré-Tarefa continua sob projeto e orçamento.
- Ergonomia está incluída comercialmente nos combos, com disponibilização em breve. A página não a descreve como fluxo utilizável hoje, não promete data de lançamento e informa que a franquia mensal começa na disponibilização, sem acúmulo retroativo. A redação final deve coincidir com as condições comerciais publicadas.

## Interações e provas

- Não haverá filtro “mostrar só diferenças” nesta versão; as diferenças de capacidade ficam visíveis nos cards e na explicação do guia.
- Não haverá calculadora numérica de ROI até existirem premissas verificáveis. A página pode tornar concretos os custos de atraso, retrabalho e evidência dispersa sem prometer economia medida.
- Não usar números inventados de tempo de implantação, SLA, produtividade ou conformidade. Distinguir claramente o que está disponível, o que depende de integração/projeto e o que está em breve.
- Medida principal: demonstrações efetivamente agendadas. Sinais intermediários: uso do guia e conversas iniciadas com contexto útil. Não tratar clique no WhatsApp como agendamento concluído.

## Rascunhos de texto para validar na implementação

- Abertura da comparação: `O prazo não espera sua equipe encontrar a evidência.`
- Explicação do guia: `Conte onde a rotina aperta. Mostramos por onde começar a conversa.`
- Indicação: `Pelo volume informado, o Combo Growth é um ponto de partida. Na demonstração, ajustamos módulos e franquias à sua operação.`
- Ergonomia: `Incluída no combo, com disponibilização em breve. A franquia mensal começa quando o módulo estiver disponível, sem acúmulo de meses anteriores.`
- Preço de referência: `Soma dos valores de tabela dos módulos avulsos, incluindo ergonomia em breve.`

## Estado

Direção confirmada pelo usuário e implementada em 30/09/2026 na landing. A indicação é calculada no navegador, sem enviar as respostas ao servidor; a mensagem do WhatsApp leva apenas as escolhas que o visitante decidiu informar. A medição de demonstrações efetivamente agendadas depende do registro comercial após a conversa, pois o clique no WhatsApp não comprova agendamento. Não requer ADR: a composição da página e as interações são reversíveis.
