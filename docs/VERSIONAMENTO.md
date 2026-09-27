# O que versionar

Versionar código, testes, scripts, configurações de build/CI, assets do produto, documentação, modelos de ambiente sem segredos e package-lock.json. Usar `npm ci` para instalar as dependências do lockfile.

Não versionar `.env` e suas variantes locais, `.seed/`, credenciais de cloud ou serviços, chaves privadas e de assinatura, certificados com chave privada, node_modules, dist, coverage, logs, resultados de testes, caches locais, bases SQLite, dumps, backups, fotos/documentos de clientes e uploads operacionais. O `.gitignore` mantém esses arquivos locais sem apagá-los. Segredos de CI devem ser configurados nos mecanismos de secrets do GitHub ou do provedor.

Arquivos `.env.example` e `.env.*.example` só podem conter valores públicos ou placeholders. A exceção do Git não torna seu conteúdo automaticamente seguro. Variáveis VITE_* e EXPO_PUBLIC_* são incorporadas no cliente: nunca colocar segredos nelas. URLs públicas, IDs de projeto e identificadores de aplicativo podem ser versionados.

Senhas descartáveis usadas por testes isolados são fixtures, não acessos de produção. Migrações SQL de schema podem ser versionadas. SQL consolidado gerado com hashes de contas demo em `database/install/` fica fora; versionar seu gerador e produzir uma nova cópia para cada ambiente.

Antes de um commit, conferir `git status`, `git diff --cached` e `git check-ignore` para os arquivos sensíveis. Se um segredo já tiver sido publicado, removê-lo do arquivo ou adicionar ao ignore não basta: revogar/rotacionar o segredo e avaliar a limpeza do histórico.
