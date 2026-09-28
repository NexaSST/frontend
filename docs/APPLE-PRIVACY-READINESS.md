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

## Pontos que ainda exigem ação antes da submissão

1. Publicar o frontend e confirmar resposta HTTP 200 com HTML em ambas as URLs. Informar `https://nexasst.com.br/privacidade/` no campo **Privacy Policy URL** do App Store Connect.
2. Revisar com assessor jurídico a identificação do responsável pessoa física, os papéis de controlador/operador, a base legal por categoria, as condições comerciais e os prazos de retenção. Confirmar localização da infraestrutura, contratos de processamento e proteção equivalente dos provedores antes de afirmar isso à Apple.
3. Decidir e implementar o fluxo de exclusão de conta. Hoje há apenas contato por e-mail e a conta é criada pela empresa por convite na web; não há exclusão iniciada dentro do app. A Apple exige exclusão iniciável dentro do app para aplicativos que suportam criação de conta, inclusive criação fora do aplicativo. Salvo enquadramento específico em setor altamente regulado, um simples e-mail de suporte não basta. A desativação da conta também não basta. O fluxo precisa considerar registros da empresa que devam ser preservados e dar confirmação do andamento.
4. Validar em build iOS real os textos de permissão da câmera e da localização, o momento da solicitação, a captura com precisão reduzida e a ausência de pedido de localização em segundo plano. O fluxo atual não conclui a foto sem localização precisa; a Apple recomenda alternativa quando viável. Avaliar essa decisão de produto antes da revisão.
5. Preparar conta de demonstração, QR Code de teste e backend acessível para a equipe de App Review. Conferir se o Apple Developer Program pode ser registrado em nome de pessoa física para o escopo final do aplicativo e se haverá tratamento de informações sensíveis de saúde, pois isso pode afetar a revisão.
6. Conferir o fluxo de exclusão de dados locais: logout preserva rascunhos e fila. É necessário definir uma ação de limpeza após confirmação de sincronização ou encerramento da conta, sem apagar evidências pendentes por engano.

Fontes oficiais: [App Review Guidelines 5.1.1 e 5.1.5](https://developer.apple.com/app-store/review/guidelines/), [orientação de exclusão de conta](https://developer.apple.com/support/offering-account-deletion-in-your-app/), [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) e [guia da ANPD para agentes de tratamento](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/anonimizado___guia_de_agente_de_tratamento_e_encarregado_da_anpd_novo.pdf).
