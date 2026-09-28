# Privacidade e publicação do aplicativo NexaSST

Este registro conecta a política pública ao comportamento observado no código em 27/09/2026. Não substitui revisão jurídica nem o preenchimento do App Store Connect. As URLs planejadas são `https://nexasst.com.br/privacidade/` e `https://nexasst.com.br/termos-de-uso/`.

## Dados e permissões observados

| Recurso | Comportamento observado | Conferir no App Store Connect |
| --- | --- | --- |
| Conta | Login corporativo; nome, e-mail, organização e permissões; sessão guardada no SecureStore | Contact Info, Identifiers se aplicável |
| Câmera | QR Codes e fotos de inspeção; outro fluxo de espaços confinados também pode ler QR | Photos or Videos, Other User Content conforme uso real |
| Localização | Captura precisa ao tirar foto de evidência; coordenadas, precisão e horário seguem para o backend com o arquivo | Precise Location, vinculada à conta/empresa; finalidade App Functionality |
| Sincronização | Dados operacionais, fotos e rascunhos ficam no aparelho e podem ser enviados ao servidor, inclusive por tarefa oportunista em segundo plano | Não declarar localização em segundo plano; revisar dados enviados |
| Web e backend | Cookies de sessão/CSRF, logs técnicos, arquivos privados na AWS, site Netlify; Microsoft SSO se ativado pela empresa | Declarar dados coletados por SDKs e provedores no contexto do app |

Verificar a build final, os manifests de todos os SDKs e os dados realmente acessados por terceiros antes de responder ao questionário. Dados operacionais eventualmente podem conter informações sensíveis adicionadas pela empresa cliente, mas a classificação depende do uso real.

## O que foi implementado

- Páginas públicas estáticas, sem exigir login, no domínio oficial; links no rodapé da landing e no aplicativo antes e depois do login.
- Conteúdo sobre câmera, localização precisa, fotos, QR, sincronização offline, armazenamento local, provedores, acesso por empresa/QR, direitos e contato para pedidos.
- URLs incluídas no sitemap e versões Markdown geradas a partir da mesma fonte das páginas HTML.
- No aplicativo, **Conta → Solicitar exclusão da conta** permite confirmar o pedido sem envio de e-mail. A API registra `deletion_requested_at`, suspende a conta e revoga as sessões; o aplicativo encerra a sessão e tenta remover os dados locais dessa conta. O pedido ainda precisa de processamento operacional dos dados no servidor.

## Pontos que ainda exigem ação antes da submissão

1. Publicar o frontend e confirmar resposta HTTP 200 com HTML em ambas as URLs. Informar `https://nexasst.com.br/privacidade/` no campo **Privacy Policy URL** do App Store Connect.
2. Revisar com assessor jurídico a identificação do responsável pessoa física, os papéis de controlador/operador, a base legal por categoria, as condições comerciais e os prazos de retenção. Confirmar localização da infraestrutura, contratos de processamento e proteção equivalente dos provedores antes de afirmar isso à Apple.
3. Definir e executar o processamento de cada pedido de exclusão registrado em `account.deletion_requested_at`: apagar ou desidentificar os dados pessoais que não precisem ser retidos, documentar os registros preservados e a justificativa, comunicar ao usuário um prazo de conclusão e confirmar quando o trabalho terminar. **Suspender a conta e registrar o pedido não conclui a exclusão exigida pela Apple.** Revisar esse procedimento com a assessoria jurídica antes da submissão.
4. Validar em build iOS real os textos de permissão da câmera e da localização, o momento da solicitação, a captura com precisão reduzida e a ausência de pedido de localização em segundo plano. O fluxo atual não conclui a foto sem localização precisa; a Apple recomenda alternativa quando viável. Avaliar essa decisão de produto antes da revisão.
5. Preparar conta de demonstração, QR Code de teste e backend acessível para a equipe de App Review. Conferir se o Apple Developer Program pode ser registrado em nome de pessoa física para o escopo final do aplicativo e se haverá tratamento de informações sensíveis de saúde, pois isso pode afetar a revisão.
6. Validar no iOS a limpeza local ao confirmar a solicitação de exclusão. O app avisa que rascunhos e fotos não sincronizados serão apagados; o logout normal continua preservando a fila offline. Se a limpeza falhar, o marcador de exclusão impede recuperar a conta offline e a tela orienta desinstalar o app para remover os dados remanescentes.

Fontes oficiais: [App Review Guidelines 5.1.1 e 5.1.5](https://developer.apple.com/app-store/review/guidelines/), [orientação de exclusão de conta](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) e [guia da ANPD para agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/anonimizado___guia_de_agente_de_tratamento_e_encarregado_da_anpd_novo.pdf).
