#!/bin/bash

# Script de Demonstração - Clini.One
# Demonstra todas as funcionalidades dos scripts de deploy

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_demo_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🎬 DEMO - CLINI.ONE DEPLOY                 ║"
    echo "║              Demonstração dos Scripts de Deploy             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

demo_step() {
    echo -e "${BLUE}🎯 $1${NC}"
    echo -e "${YELLOW}   Comando: $2${NC}"
    echo ""
}

demo_working_trees() {
    echo -e "${PURPLE}📋 DEMONSTRAÇÃO: Working Trees${NC}"
    echo ""
    
    demo_step "1. Listar working trees atuais" "git worktree list"
    git worktree list || echo "Nenhuma working tree adicional"
    echo ""
    
    demo_step "2. Criar working tree de exemplo" "git worktree add ../demo-feature feature-demo"
    if ! git show-ref --verify --quiet refs/heads/feature-demo; then
        git checkout -b feature-demo
        git checkout main
    fi
    
    if [ ! -d "../demo-feature" ]; then
        git worktree add ../demo-feature feature-demo
        echo -e "${GREEN}✅ Working tree criada em: ../demo-feature${NC}"
    else
        echo -e "${YELLOW}⚠️  Working tree já existe${NC}"
    fi
    echo ""
    
    demo_step "3. Verificar working trees" "git worktree list"
    git worktree list
    echo ""
    
    demo_step "4. Remover working tree de exemplo" "git worktree remove ../demo-feature"
    if [ -d "../demo-feature" ]; then
        git worktree remove ../demo-feature --force 2>/dev/null || true
        rm -rf ../demo-feature 2>/dev/null || true
        echo -e "${GREEN}✅ Working tree removida${NC}"
    fi
    echo ""
}

demo_git_aliases() {
    echo -e "${PURPLE}📋 DEMONSTRAÇÃO: Git Aliases${NC}"
    echo ""
    
    demo_step "1. Aliases básicos do Git" "git config --get-regexp alias"
    git config --get-regexp alias | head -7
    echo ""
    
    demo_step "2. Aliases de deploy" "git config --get-regexp alias.deploy"
    git config --get-regexp alias.deploy
    echo ""
    
    echo -e "${CYAN}💡 Agora você pode usar comandos como:${NC}"
    echo -e "   ${YELLOW}git st${NC} (git status)"
    echo -e "   ${YELLOW}git co main${NC} (git checkout main)"
    echo -e "   ${YELLOW}git deploy${NC} (./scripts/deploy.sh)"
    echo -e "   ${YELLOW}git deploy-prod \"mensagem\"${NC} (./scripts/deploy-prod.sh)"
    echo ""
}

demo_scripts_info() {
    echo -e "${PURPLE}📋 DEMONSTRAÇÃO: Scripts Disponíveis${NC}"
    echo ""
    
    echo -e "${CYAN}🚀 Scripts de Deploy:${NC}"
    echo ""
    
    echo -e "${BLUE}1. deploy.sh${NC} - Script principal"
    echo -e "   📝 Uso: ${YELLOW}./scripts/deploy.sh [branch] [mensagem]${NC}"
    echo -e "   ✨ Recursos: Working tree, deploy simultâneo, limpeza automática"
    echo ""
    
    echo -e "${BLUE}2. deploy-prod.sh${NC} - Deploy de produção"
    echo -e "   📝 Uso: ${YELLOW}./scripts/deploy-prod.sh [mensagem]${NC}"
    echo -e "   ✨ Recursos: Validação branch main, tags automáticas, produção"
    echo ""
    
    echo -e "${BLUE}3. deploy-dev.sh${NC} - Deploy de desenvolvimento"
    echo -e "   📝 Uso: ${YELLOW}./scripts/deploy-dev.sh [branch] [mensagem]${NC}"
    echo -e "   ✨ Recursos: Criação automática de branch, preview deploy"
    echo ""
    
    echo -e "${BLUE}4. setup-git.sh${NC} - Configuração inicial"
    echo -e "   📝 Uso: ${YELLOW}./scripts/setup-git.sh${NC}"
    echo -e "   ✨ Recursos: Git hooks, aliases, working trees, branches"
    echo ""
}

demo_file_structure() {
    echo -e "${PURPLE}📋 DEMONSTRAÇÃO: Estrutura de Arquivos${NC}"
    echo ""
    
    demo_step "1. Scripts criados" "ls -la scripts/"
    ls -la scripts/ | grep -E "\.(sh|md)$"
    echo ""
    
    demo_step "2. Permissões dos scripts" "ls -la scripts/*.sh"
    ls -la scripts/*.sh
    echo ""
    
    demo_step "3. Documentação" "ls -la scripts/README.md"
    ls -la scripts/README.md
    echo ""
}

demo_git_status() {
    echo -e "${PURPLE}📋 DEMONSTRAÇÃO: Status do Repositório${NC}"
    echo ""
    
    demo_step "1. Branch atual" "git branch --show-current"
    git branch --show-current
    echo ""
    
    demo_step "2. Status do Git" "git status --short"
    git status --short
    echo ""
    
    demo_step "3. Branches disponíveis" "git branch"
    git branch
    echo ""
    
    demo_step "4. Último commit" "git log -1 --oneline"
    git log -1 --oneline
    echo ""
}

show_next_steps() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     🎉 PRÓXIMOS PASSOS                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}🔧 Para começar a usar:${NC}"
    echo ""
    echo -e "1. ${YELLOW}Instalar Vercel CLI:${NC}"
    echo -e "   ${BLUE}npm install -g vercel${NC}"
    echo -e "   ${BLUE}vercel login${NC}"
    echo ""
    echo -e "2. ${YELLOW}Fazer primeiro deploy:${NC}"
    echo -e "   ${BLUE}./scripts/deploy-prod.sh \"Primeiro deploy\"${NC}"
    echo ""
    echo -e "3. ${YELLOW}Deploy de desenvolvimento:${NC}"
    echo -e "   ${BLUE}./scripts/deploy-dev.sh feature-nova \"Nova funcionalidade\"${NC}"
    echo ""
    echo -e "4. ${YELLOW}Usar aliases do Git:${NC}"
    echo -e "   ${BLUE}git deploy${NC}"
    echo -e "   ${BLUE}git deploy-prod \"mensagem\"${NC}"
    echo ""
    echo -e "${CYAN}📚 Documentação completa: ${YELLOW}scripts/README.md${NC}"
    echo -e "${CYAN}🌐 URLs importantes:${NC}"
    echo -e "   📱 Produção: https://clini.one"
    echo -e "   ▲ Vercel: https://vercel.com/dashboard"
    echo ""
}

main() {
    print_demo_header
    
    echo -e "${YELLOW}🎬 Esta demonstração mostra todas as funcionalidades dos scripts de deploy${NC}"
    echo -e "${YELLOW}📋 Pressione ENTER para continuar entre as seções...${NC}"
    echo ""
    
    read -p "$(echo -e ${CYAN}Pressione ENTER para começar...${NC})"
    echo ""
    
    demo_scripts_info
    read -p "$(echo -e ${CYAN}Pressione ENTER para continuar...${NC})"
    echo ""
    
    demo_file_structure
    read -p "$(echo -e ${CYAN}Pressione ENTER para continuar...${NC})"
    echo ""
    
    demo_git_aliases
    read -p "$(echo -e ${CYAN}Pressione ENTER para continuar...${NC})"
    echo ""
    
    demo_working_trees
    read -p "$(echo -e ${CYAN}Pressione ENTER para continuar...${NC})"
    echo ""
    
    demo_git_status
    read -p "$(echo -e ${CYAN}Pressione ENTER para ver próximos passos...${NC})"
    echo ""
    
    show_next_steps
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 