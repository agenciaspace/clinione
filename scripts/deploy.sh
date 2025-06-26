#!/bin/bash

# Script de Deploy Automatizado - Clini.One
# Faz deploy simultâneo no GitHub e Vercel com suporte a working tree
# Uso: ./scripts/deploy.sh [branch] [message]

set -e  # Para na primeira falha

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
DEFAULT_BRANCH="main"
DEFAULT_MESSAGE="Deploy automático $(date '+%Y-%m-%d %H:%M:%S')"
VERCEL_PROJECT_NAME="clinione"
GITHUB_REPO="origin"

# Funções auxiliares
print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 DEPLOY CLINI.ONE                      ║"
    echo "║              GitHub + Vercel + Working Tree                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_dependencies() {
    print_step "Verificando dependências..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git não está instalado"
        exit 1
    fi
    
    # Verificar Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI não encontrado. Instalando..."
        npm install -g vercel
    fi
    
    # Verificar se está em um repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Não está em um repositório Git"
        exit 1
    fi
    
    print_success "Todas as dependências verificadas"
}

setup_working_tree() {
    print_step "Configurando Working Tree..."
    
    # Criar diretório para working trees se não existir
    WORKTREE_DIR="../clinione-deploy"
    
    if [ -d "$WORKTREE_DIR" ]; then
        print_warning "Working tree já existe. Removendo..."
        git worktree remove "$WORKTREE_DIR" --force 2>/dev/null || true
        rm -rf "$WORKTREE_DIR" 2>/dev/null || true
    fi
    
    # Criar nova working tree
    print_step "Criando working tree para deploy..."
    git worktree add "$WORKTREE_DIR" HEAD
    
    print_success "Working tree criada em: $WORKTREE_DIR"
    echo -e "${CYAN}💡 Você pode trabalhar no diretório principal enquanto o deploy acontece${NC}"
}

prepare_deploy() {
    local branch=$1
    local message=$2
    
    print_step "Preparando deploy..."
    
    # Verificar se há mudanças não commitadas
    if ! git diff-index --quiet HEAD --; then
        print_warning "Há mudanças não commitadas. Commitando automaticamente..."
        git add .
        git commit -m "Auto-commit antes do deploy: $message"
    fi
    
    # Verificar se a branch existe remotamente
    if git ls-remote --heads "$GITHUB_REPO" "$branch" | grep -q "$branch"; then
        print_step "Branch '$branch' existe remotamente. Fazendo merge..."
        git pull "$GITHUB_REPO" "$branch" --rebase
    else
        print_warning "Branch '$branch' não existe remotamente. Será criada."
    fi
    
    print_success "Preparação concluída"
}

deploy_github() {
    local branch=$1
    local message=$2
    
    print_step "🐙 Fazendo deploy no GitHub..."
    
    # Push para o GitHub
    git push "$GITHUB_REPO" "$branch"
    
    # Criar tag de release se for main/master
    if [[ "$branch" == "main" || "$branch" == "master" ]]; then
        local tag="v$(date '+%Y.%m.%d-%H%M%S')"
        print_step "Criando tag de release: $tag"
        git tag -a "$tag" -m "$message"
        git push "$GITHUB_REPO" "$tag"
        print_success "Tag criada: $tag"
    fi
    
    print_success "Deploy no GitHub concluído"
}

deploy_vercel() {
    local branch=$1
    local is_production=$2
    
    print_step "▲ Fazendo deploy na Vercel..."
    
    # Entrar no diretório da working tree
    cd "../clinione-deploy"
    
    # Configurar Vercel se necessário
    if [ ! -f ".vercel/project.json" ]; then
        print_step "Configurando projeto Vercel..."
        vercel --yes
    fi
    
    # Deploy baseado na branch
    if [[ "$is_production" == "true" ]]; then
        print_step "Deploy de PRODUÇÃO na Vercel..."
        vercel --prod --yes
    else
        print_step "Deploy de PREVIEW na Vercel..."
        vercel --yes
    fi
    
    # Voltar ao diretório original
    cd - > /dev/null
    
    print_success "Deploy na Vercel concluído"
}

cleanup() {
    print_step "Limpando working tree..."
    
    if [ -d "../clinione-deploy" ]; then
        git worktree remove "../clinione-deploy" --force 2>/dev/null || true
        rm -rf "../clinione-deploy" 2>/dev/null || true
    fi
    
    print_success "Limpeza concluída"
}

show_status() {
    local branch=$1
    
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     📊 STATUS DO DEPLOY                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}🌐 URLs de Acesso:${NC}"
    echo -e "   📱 Produção: https://clini.one"
    echo -e "   🔗 GitHub: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')"
    echo -e "   ▲ Vercel Dashboard: https://vercel.com/dashboard"
    echo ""
    
    echo -e "${CYAN}📋 Informações do Deploy:${NC}"
    echo -e "   🌿 Branch: $branch"
    echo -e "   📝 Último commit: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
    echo -e "   🕒 Horário: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    echo -e "${CYAN}🔍 Comandos Úteis:${NC}"
    echo -e "   📊 Status Git: ${YELLOW}git status${NC}"
    echo -e "   📜 Logs Vercel: ${YELLOW}vercel logs${NC}"
    echo -e "   🔄 Novo deploy: ${YELLOW}./scripts/deploy.sh${NC}"
}

main() {
    # Parâmetros
    local branch=${1:-$DEFAULT_BRANCH}
    local message=${2:-$DEFAULT_MESSAGE}
    local is_production="false"
    
    # Verificar se é deploy de produção
    if [[ "$branch" == "main" || "$branch" == "master" ]]; then
        is_production="true"
    fi
    
    print_header
    
    echo -e "${CYAN}🎯 Configuração do Deploy:${NC}"
    echo -e "   🌿 Branch: $branch"
    echo -e "   📝 Mensagem: $message"
    echo -e "   🚀 Produção: $([ "$is_production" == "true" ] && echo "Sim" || echo "Não (Preview)")"
    echo ""
    
    # Confirmar deploy
    read -p "$(echo -e ${YELLOW}Continuar com o deploy? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Deploy cancelado pelo usuário"
        exit 0
    fi
    
    # Executar deploy
    trap cleanup EXIT  # Garantir limpeza em caso de erro
    
    check_dependencies
    setup_working_tree
    prepare_deploy "$branch" "$message"
    
    # Deploy paralelo (GitHub em background)
    deploy_github "$branch" "$message" &
    GITHUB_PID=$!
    
    # Deploy Vercel em foreground
    deploy_vercel "$branch" "$is_production"
    
    # Aguardar GitHub terminar
    wait $GITHUB_PID
    
    cleanup
    show_status "$branch"
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  🎉 DEPLOY CONCLUÍDO!                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar se o script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 