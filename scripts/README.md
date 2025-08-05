# Scripts de Deploy

## 🚀 Como usar

### 1. Deploy Interativo (Recomendado)
```bash
npm run deploy
```
- Pergunta se quer commitar mudanças
- Permite escolher mensagem de commit
- Verifica branch atual
- Faz push e deploy na Vercel

### 2. Deploy Simples
```bash
npm run deploy:simple
```
- Commita automaticamente com mensagem padrão
- Muda para branch clarissa
- Faz push e deploy

### 3. Deploy Automático
```bash
npm run deploy:auto
```
- Totalmente automático
- Usa mensagem de commit padrão
- Ideal para CI/CD

### 4. Deploy com Mensagem Customizada
```bash
./scripts/deploy-simple.sh "feat: nova funcionalidade"
```

## 📋 O que os scripts fazem:

1. ✅ **Verificam mudanças** não commitadas
2. ✅ **Fazem commit** (se necessário)
3. ✅ **Mudam para branch clarissa** (se necessário)
4. ✅ **Push para git** repository
5. ✅ **Instalam Vercel CLI** (se necessário)
6. ✅ **Deploy na Vercel** em produção
7. ✅ **Mostram URLs** finais

## 🛠️ Pré-requisitos:

- Git configurado
- Node.js e npm instalados
- Acesso ao repositório GitHub
- Conta Vercel configurada (será solicitado login na primeira vez)

## 🎯 Resultado:

<<<<<<< Updated upstream
Após executar qualquer script:
- 🌐 Site atualizado em: https://clini.one
- 📊 Dashboard: https://vercel.com/dashboard 
=======
## 📜 Scripts Disponíveis

### `deploy.sh` - Script Principal
Deploy completo com working trees para qualquer branch.

```bash
./scripts/deploy.sh [branch] [mensagem]
```

**Recursos:**
- ✅ Deploy simultâneo GitHub + Vercel
- ✅ Working tree temporária (não bloqueia desenvolvimento)
- ✅ Auto-commit de mudanças pendentes com IA
- ✅ Tags automáticas para produção
- ✅ Limpeza automática
- ✅ Interface colorida e informativa

### `ai-commit.sh` - Commits Inteligentes com IA
Gera mensagens de commit automáticas usando inteligência artificial.

```bash
./scripts/ai-commit.sh          # Modo interativo
./scripts/ai-commit.sh --auto   # Modo automático
```

**Recursos:**
- 🤖 Analisa mudanças do código com IA
- 📝 Gera mensagens seguindo Conventional Commits
- 🇧🇷 Mensagens em português
- ✏️ Modo interativo para edição
- 🔄 Fallback para mensagens padrão

### `setup-openai.sh` - Configuração da OpenAI
Configura a chave da API da OpenAI para commits inteligentes.

```bash
./scripts/setup-openai.sh
```

**Recursos:**
- 🔑 Configuração segura da API key
- 🧪 Teste automático da chave
- 💾 Salvamento no shell config
- 📊 Informações de preços
- ✅ Validação de formato

### `deploy-prod.sh` - Deploy de Produção
Deploy específico para produção (branch main).

```bash
./scripts/deploy-prod.sh [mensagem]
```

**Validações:**
- ❌ Só executa na branch `main`
- ⚠️ Confirma mudanças não commitadas
- 🏷️ Cria tags de release automáticas
- 🌐 Deploy de produção na Vercel

### `deploy-dev.sh` - Deploy de Desenvolvimento
Deploy para branches de desenvolvimento/preview.

```bash
./scripts/deploy-dev.sh [branch] [mensagem]
```

**Recursos:**
- 🌱 Cria branch automaticamente se não existir
- 🔄 Muda para a branch especificada
- 👀 Deploy de preview na Vercel
- 🔧 Ideal para testes e desenvolvimento

### `setup-git.sh` - Configuração Inicial
Configura o repositório Git com working trees e hooks.

```bash
./scripts/setup-git.sh
```

**Configurações:**
- 📝 Atualiza `.gitignore`
- 🪝 Instala Git hooks (pre-commit)
- ⚙️ Configura Git para working trees
- 🌿 Cria branches padrão (main, dev)
- 🔗 Adiciona aliases úteis

## 🕐 Deploy Automático (Cron)

### `cron-deploy-dev.sh` - Deploy Dev Diário
Deploy automático diário para branch de desenvolvimento.

```bash
./scripts/cron-deploy-dev.sh          # Executar deploy
./scripts/cron-deploy-dev.sh --test   # Modo teste
./scripts/cron-deploy-dev.sh --force  # Forçar deploy
```

**Recursos:**
- 📅 Execução diária automática (09:00)
- 🔍 Verifica mudanças antes de deployar
- 🧪 Testes básicos (lint, build)
- 📋 Logs detalhados
- 🔒 Sistema de lock (evita execução simultânea)

### `cron-deploy-prod.sh` - Deploy Prod com Confirmação
Deploy de produção com testes unitários e confirmação manual.

```bash
./scripts/cron-deploy-prod.sh           # Verificar e deployar se necessário
./scripts/cron-deploy-prod.sh --confirm # Confirmar deploy pendente
./scripts/cron-deploy-prod.sh --cancel  # Cancelar deploy pendente
```

**Recursos:**
- 🚀 Deploy apenas com testes aprovados
- ✅ Confirmação manual obrigatória
- 📊 Relatório detalhado de mudanças
- ⏰ Timeout de 30 minutos
- 💬 Notificações (webhook/email)

### `setup-cron.sh` - Configuração de Cron Jobs
Configura deploy automático com cron jobs.

```bash
./scripts/setup-cron.sh           # Configurar cron jobs
./scripts/setup-cron.sh --show    # Mostrar configuração
./scripts/setup-cron.sh --remove  # Remover cron jobs
```

**Recursos:**
- 🕐 Configuração automática de horários
- 📦 Scripts wrapper com ambiente completo
- 💬 Configuração de notificações
- 🧪 Testes de validação

### `monitor-deploys.sh` - Monitor de Deploys
Dashboard para monitorar deploys automáticos.

```bash
./scripts/monitor-deploys.sh            # Dashboard interativo
./scripts/monitor-deploys.sh --status   # Status atual
./scripts/monitor-deploys.sh --logs dev # Logs em tempo real
```

**Recursos:**
- 📊 Dashboard em tempo real
- 📋 Monitoramento de logs
- 📈 Estatísticas de deploy
- ⏳ Verificação de confirmações pendentes

## 🌳 Working Trees

### O que são Working Trees?

Working Trees permitem ter múltiplas cópias do repositório em diretórios diferentes, cada uma com uma branch diferente. Isso permite:

- 🔄 Trabalhar em uma feature enquanto faz deploy de outra
- 🚀 Deploy não bloqueia o desenvolvimento
- 🌿 Múltiplas branches ativas simultaneamente

### Como Funcionam nos Scripts

1. **Criação Automática**: Script cria working tree temporária
2. **Deploy Isolado**: Deploy acontece na working tree
3. **Desenvolvimento Contínuo**: Você pode continuar trabalhando
4. **Limpeza Automática**: Working tree é removida após deploy

### Comandos Manuais

```bash
# Criar working tree
git worktree add ../feature-branch feature-branch

# Listar working trees
git worktree list

# Remover working tree
git worktree remove ../feature-branch

# Mover working tree
git worktree move ../old-path ../new-path
```

## 📚 Exemplos de Uso

### Deploy de Produção

```bash
# Deploy simples
./scripts/deploy-prod.sh

# Deploy com mensagem personalizada
./scripts/deploy-prod.sh "Novo sistema de autenticação"
```

### Deploy de Desenvolvimento

```bash
# Deploy na branch dev
./scripts/deploy-dev.sh

# Deploy em branch específica
./scripts/deploy-dev.sh feature-login "Implementação do login"

# Deploy em nova branch
./scripts/deploy-dev.sh hotfix-bug-123 "Correção urgente"
```

### Deploy Personalizado

```bash
# Deploy básico
./scripts/deploy.sh

# Deploy em branch específica
./scripts/deploy.sh staging "Deploy para homologação"

# Deploy com working tree manual
git worktree add ../deploy-temp main
cd ../deploy-temp
# fazer mudanças
vercel --prod
cd -
git worktree remove ../deploy-temp
```

### Usando Aliases Git

Após executar `setup-git.sh`, você pode usar:

```bash
# Aliases padrão
git st          # git status
git co main     # git checkout main
git br          # git branch
git ci -m "msg" # git commit -m "msg"

# Aliases de deploy
git deploy                    # ./scripts/deploy.sh
git deploy-prod "mensagem"    # ./scripts/deploy-prod.sh
git deploy-dev branch "msg"   # ./scripts/deploy-dev.sh
```

### Commits com IA

```bash
# Configurar OpenAI (uma vez)
./scripts/setup-openai.sh

# Commit interativo com IA
./scripts/ai-commit.sh

# Commit automático com IA
./scripts/ai-commit.sh --auto

# Exemplo de uso no workflow
git add .
./scripts/ai-commit.sh  # IA sugere: "feat(auth): implementar sistema de login"
```

### Deploy Automático

```bash
# Configurar cron jobs (uma vez)
./scripts/setup-cron.sh

# Monitorar deploys em tempo real
./scripts/monitor-deploys.sh

# Deploy manual dev
./scripts/cron-deploy-dev.sh --force

# Confirmar deploy de produção pendente
./scripts/cron-deploy-prod.sh --confirm

# Ver logs em tempo real
./scripts/monitor-deploys.sh --logs all
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. "vite: command not found"
```bash
# Instalar dependências
npm install

# Ou usar npx
npx vite
```

#### 2. "vercel: command not found"
```bash
# Instalar Vercel CLI
npm install -g vercel

# Verificar instalação
vercel --version
```

#### 3. Working tree já existe
```bash
# Remover working tree existente
git worktree remove ../clinione-deploy --force
rm -rf ../clinione-deploy
```

#### 4. Mudanças não commitadas
O script automaticamente commita mudanças pendentes, mas você pode fazer manualmente:

```bash
git add .
git commit -m "Suas mudanças"
```

#### 5. Branch não existe remotamente
```bash
# Criar branch remotamente
git push -u origin nova-branch
```

#### 6. Problemas com AI Commits
```bash
# Verificar se OpenAI API key está configurada
echo $OPENAI_API_KEY

# Reconfigurar OpenAI
./scripts/setup-openai.sh

# Testar conexão com OpenAI
curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models | jq '.data[0].id'

# Usar commit manual se IA falhar
git add .
git commit -m "feat: sua mensagem manual"
```

#### 7. Problemas com Deploy Automático
```bash
# Verificar cron jobs
crontab -l | grep "Clini.One"

# Ver logs de deploy
./scripts/monitor-deploys.sh --logs all

# Testar deploy dev
./scripts/cron-deploy-dev.sh --test

# Testar deploy prod
./scripts/cron-deploy-prod.sh --test

# Reconfigurar cron jobs
./scripts/setup-cron.sh --remove
./scripts/setup-cron.sh

# Confirmar deploy pendente
./scripts/cron-deploy-prod.sh --confirm

# Cancelar deploy pendente
./scripts/cron-deploy-prod.sh --cancel
```

### Logs e Debug

```bash
# Ver logs do Vercel
vercel logs

# Ver status detalhado do Git
git status --porcelain

# Ver working trees ativas
git worktree list

# Ver últimos commits
git log --oneline -10
```

### Limpeza Manual

```bash
# Remover todas as working trees
git worktree list | grep -v "(bare)" | awk '{print $1}' | xargs -I {} git worktree remove {} --force

# Limpar tags locais
git tag -l "v*" | xargs git tag -d

# Resetar configurações Git
git config --unset-all alias.deploy
git config --unset-all alias.deploy-prod
git config --unset-all alias.deploy-dev
```

## 🤖 AI Commits

### Configuração
```bash
# Configurar OpenAI API Key (uma vez)
./scripts/setup-openai.sh

# Testar configuração
./scripts/demo-ai-commit.sh
```

### Uso Básico
```bash
# Modo interativo (recomendado)
./scripts/ai-commit.sh

# Modo automático (para scripts)
./scripts/ai-commit.sh --auto
```

### Integração com Deploy
O sistema de deploy automaticamente usa AI commits quando disponível:

```bash
# Deploy com AI commits automáticos
OPENAI_API_KEY="sua-chave" ./scripts/deploy.sh
```

### Exemplos de Mensagens Geradas
- `feat(auth): implementar sistema de login com JWT`
- `fix(api): corrigir validação de dados do usuário`
- `docs(readme): atualizar instruções de instalação`
- `refactor(components): otimizar componentes React`

## 🌐 URLs Importantes

- **Produção**: https://clini.one
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub**: https://github.com/agenciaspace/clinione

## 📞 Suporte

Se encontrar problemas:

1. ✅ Verifique se todas as dependências estão instaladas
2. 🔍 Execute `./scripts/setup-git.sh` novamente
3. 📋 Verifique os logs com `vercel logs`
4. 🧹 Faça limpeza manual se necessário

---

**Criado para Clini.One** 🏥✨ 
>>>>>>> Stashed changes
