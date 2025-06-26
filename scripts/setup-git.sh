#!/bin/bash

# Setup Git e Working Trees - Clini.One
# Configura o repositório Git com working trees e hooks úteis

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   🔧 SETUP GIT - CLINI.ONE                  ║"
    echo "║              Configuração de Working Trees                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

setup_gitignore() {
    echo -e "${BLUE}📝 Configurando .gitignore...${NC}"
    
    # Adicionar entradas específicas para working trees se não existirem
    if ! grep -q "# Working Trees" .gitignore 2>/dev/null; then
        cat >> .gitignore << EOF

# Working Trees
*-deploy/
*-worktree/

# Deploy scripts logs
deploy-*.log

# Vercel
.vercel

# Environment variables
.env.local
.env.production
EOF
        echo -e "${GREEN}✅ .gitignore atualizado${NC}"
    else
        echo -e "${YELLOW}⚠️  .gitignore já configurado${NC}"
    fi
}

setup_git_hooks() {
    echo -e "${BLUE}🪝 Configurando Git hooks...${NC}"
    
    # Criar diretório de hooks se não existir
    mkdir -p .git/hooks
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook para Clini.One

echo "🔍 Executando verificações pré-commit..."

# Verificar se há arquivos TypeScript/JavaScript com erros
if command -v npm &> /dev/null; then
    echo "📝 Verificando lint..."
    npm run lint --silent 2>/dev/null || echo "⚠️  Lint não configurado ou com erros"
fi

# Verificar se há arquivos grandes (>50MB)
large_files=$(find . -type f -size +50M -not -path "./.git/*" -not -path "./node_modules/*" 2>/dev/null)
if [ -n "$large_files" ]; then
    echo "❌ Arquivos muito grandes encontrados:"
    echo "$large_files"
    echo "💡 Considere usar Git LFS para arquivos grandes"
    exit 1
fi

echo "✅ Verificações pré-commit concluídas"
EOF

    # Tornar o hook executável
    chmod +x .git/hooks/pre-commit
    
    echo -e "${GREEN}✅ Git hooks configurados${NC}"
}

setup_git_config() {
    echo -e "${BLUE}⚙️  Configurando Git...${NC}"
    
    # Configurar merge strategy
    git config merge.tool vimdiff 2>/dev/null || true
    
    # Configurar push default
    git config push.default simple 2>/dev/null || true
    
    # Configurar rebase automático
    git config pull.rebase true 2>/dev/null || true
    
    # Configurar working tree
    git config worktree.guessRemote true 2>/dev/null || true
    
    echo -e "${GREEN}✅ Git configurado${NC}"
}

setup_branches() {
    echo -e "${BLUE}🌿 Configurando branches...${NC}"
    
    # Verificar se estamos na main
    current_branch=$(git branch --show-current)
    if [[ "$current_branch" != "main" ]]; then
        echo -e "${YELLOW}⚠️  Não está na branch main. Mudando...${NC}"
        git checkout main 2>/dev/null || git checkout -b main
    fi
    
    # Criar branch de desenvolvimento se não existir
    if ! git show-ref --verify --quiet refs/heads/dev; then
        echo -e "${BLUE}🌱 Criando branch dev...${NC}"
        git checkout -b dev
        git checkout main
    fi
    
    echo -e "${GREEN}✅ Branches configuradas${NC}"
}

create_aliases() {
    echo -e "${BLUE}🔗 Criando aliases úteis...${NC}"
    
    # Aliases Git
    git config alias.st status
    git config alias.co checkout
    git config alias.br branch
    git config alias.ci commit
    git config alias.unstage 'reset HEAD --'
    git config alias.last 'log -1 HEAD'
    git config alias.visual '!gitk'
    git config alias.deploy '!./scripts/deploy.sh'
    git config alias.deploy-prod '!./scripts/deploy-prod.sh'
    git config alias.deploy-dev '!./scripts/deploy-dev.sh'
    
    echo -e "${GREEN}✅ Aliases criados${NC}"
    echo -e "${CYAN}💡 Agora você pode usar: git deploy, git deploy-prod, git deploy-dev${NC}"
}

show_working_tree_help() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   📚 GUIA DE WORKING TREES                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${YELLOW}🌟 Working Trees permitem trabalhar em múltiplas branches simultaneamente${NC}"
    echo ""
    echo -e "${CYAN}📋 Comandos úteis:${NC}"
    echo -e "   🔧 Criar working tree: ${YELLOW}git worktree add ../feature-branch feature-branch${NC}"
    echo -e "   📊 Listar working trees: ${YELLOW}git worktree list${NC}"
    echo -e "   🗑️  Remover working tree: ${YELLOW}git worktree remove ../feature-branch${NC}"
    echo -e "   🔄 Mover working tree: ${YELLOW}git worktree move ../old-path ../new-path${NC}"
    echo ""
    echo -e "${CYAN}🚀 Scripts de deploy:${NC}"
    echo -e "   📱 Deploy produção: ${YELLOW}./scripts/deploy-prod.sh \"mensagem\"${NC}"
    echo -e "   🔧 Deploy desenvolvimento: ${YELLOW}./scripts/deploy-dev.sh branch \"mensagem\"${NC}"
    echo -e "   ⚙️  Deploy personalizado: ${YELLOW}./scripts/deploy.sh branch \"mensagem\"${NC}"
}

main() {
    print_header
    
    # Verificar se está em um repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${YELLOW}📦 Inicializando repositório Git...${NC}"
        git init
    fi
    
    setup_gitignore
    setup_git_config
    setup_git_hooks
    setup_branches
    create_aliases
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    ✅ SETUP CONCLUÍDO!                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    show_working_tree_help
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 