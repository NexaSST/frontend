# Busca orgânica e descoberta por IA — NexaSST

Domínio canônico confirmado: https://nexasst.com.br.

## Implementação

`npm run build` gera a landing completa em HTML, seis guias estáticos, `/index.md`, versões Markdown dos guias, `/llms.txt`, sitemap, robots e headers de descoberta. Conteúdo editorial e schema ficam em `src/seo/content.ts`, `SearchContent.tsx` e `render.tsx`. A versão Markdown da landing é extraída do HTML para acompanhar a oferta visível. Os arquivos gerados ficam em `dist/`; não editar esses arquivos manualmente.

A landing mantém o aplicativo React; os guias são documentos estáticos sem o JavaScript da aplicação. O gerador de redirects do Netlify usa `app.html` para as rotas da aplicação, mantendo a landing e os guias com seus próprios metadados. O shell da aplicação usa `noindex`. Os guias inexistentes retornam 404. Markdown tem canonical HTTP para a página HTML e `X-Robots-Tag: noindex`, evitando duplicação nos índices. Não implementamos negociação de `Accept: text/markdown`: os documentos têm URLs explícitas e links de descoberta.

Deploys de preview e de branches no Netlify ficam com `noindex` e robots bloqueado, usando `CONTEXT`; produção fica aberta. Não bloquear os bots de busca no CDN/WAF. O build precisa continuar executando `scripts/build-netlify-redirects.mjs` após `npm run check`, como definido em `netlify.toml`. Não publicar `dist/_redirects` de um teste local com `api.example.com`; o deploy gera o valor a partir de `API_ORIGIN` real.

## Intenções atendidas

- Gestão de treinamento / melhorar treinamentos de segurança do trabalho: matriz, frequência, evidências e vencimentos.
- Inspeção online / inspeção de extintor: identificação, checklist, fotos, histórico e ação.
- APR segurança do trabalho: atividade, análise e autorização.
- CBO técnico de segurança do trabalho: resposta 3516-05 com fonte oficial.
- Espaço confinado: inventário, responsáveis e registros com referência à NR-33.
- Ergonomia: organização das avaliações e ações, fonte NR-17 e confirmação do escopo comercial.

As URLs usam palavras sem acentos, mas o conteúdo mantém português correto. Não criar páginas duplicadas ou listas repetitivas para `seguranca`, `inspecao`, `gestao` e `espaco`: acompanhar essas variantes no Search Console e melhorar a página que atende a mesma intenção.

SGG-SST é tratado como produto distinto e Transpetro como entidade externa. Não há alegação de cliente, parceria, homologação, integração ou comparação funcional sem evidências. Uma busca isolada por Transpetro ou MTE tem intenção predominantemente institucional: priorizar buscas de problemas realmente atendidos. O conteúdo não atribui certificação do MTE ao produto.

## Depois de publicar

1. Verificar a propriedade de domínio `nexasst.com.br` no Google Search Console e enviar `https://nexasst.com.br/sitemap.xml`.
2. Inspecionar a landing e os seis guias, confirmar leitura do HTML, canonical e ausência de bloqueio/noindex em produção; solicitar indexação das páginas prioritárias.
3. Cadastrar o site no Bing Webmaster Tools e enviar o mesmo sitemap.
4. Testar `/index.md`, `/llms.txt` e os Markdown dos guias: resposta 200, conteúdo correto e headers esperados. Validar o schema com Schema Markup Validator; FAQ não implica rich result no Google.
5. Acompanhar semanalmente indexação, consultas, impressões, cliques e contatos recebidos. Separar consultas informativas das que resultam em demonstração. Não há analytics novo neste trabalho.
6. Acrescentar casos reais, autores técnicos identificáveis e evidências verificáveis de uso. Para ergonomia, confirmar recursos da oferta comercial antes de ampliar as promessas da landing.
7. Ao editar materialmente uma página, atualizar seu `lastmod` e a data editorial correspondente; não usar automaticamente a data de cada deploy.

`llms.txt` e Markdown facilitam a leitura por ferramentas que os consumam. Não garantem posição no Google nem recomendação por ChatGPT, Gemini ou Claude. A documentação do Google informa que arquivos especiais de IA não são necessários para suas funcionalidades de busca generativa: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide.

## Validação

`npm run check:search` valida HTML indexável, H1, canonical, descrições, JSON-LD, links internos, Markdown e isolamento do shell autenticado. Executar após o build. `npm run lint`, `npm test` e typecheck continuam nos checks normais.
