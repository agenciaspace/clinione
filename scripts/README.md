# 🚀 Scripts de Deploy - Clini.One

Scripts automatizados para deploy simultâneo no GitHub e Vercel com suporte a Git Working Trees.

## 📋 Índice

- [Configuração Inicial](#-configuração-inicial)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Working Trees](#-working-trees)
- [Exemplos de Uso](#-exemplos-de-uso)
- [Troubleshooting](#-troubleshooting)

## 🔧 Configuração Inicial

### 1. Executar Setup Inicial

```bash
# Configurar Git, hooks e working trees
./scripts/setup-git.sh
```

### 2. Instalar Vercel CLI (se necessário)

```bash
# Instalar globalmente
npm install -g vercel

# Fazer login
vercel login
```

### 3. Tornar Scripts Executáveis

```bash
chmod +x scripts/*.sh
```

## 📜 Scripts Disponíveis

### `deploy.sh` - Script Principal
Deploy completo com working trees para qualquer branch.

```bash
./scripts/deploy.sh [branch] [mensagem]
```

**Recursos:**
- ✅ Deploy simultâneo GitHub + Vercel
- ✅ Working tree temporária (não bloqueia desenvolvimento)
- ✅ Auto-commit de mudanças pendentes
- ✅ Tags automáticas para produção
- ✅ Limpeza automática
- ✅ Interface colorida e informativa

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