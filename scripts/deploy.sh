#!/bin/bash

# Script de Deploy para Clini.One
# Faz push para o git e deploy na Vercel

set -e  # Parar se houver erro

echo "🚀 Iniciando processo de deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se há mudanças para commitar
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}📝 Detectadas mudanças não commitadas${NC}"
    
    # Mostrar status
    echo -e "${BLUE}Status atual:${NC}"
    git status --short
    
<<<<<<< Updated upstream
    # Perguntar se quer commitar
    read -p "Deseja commitar essas mudanças? (y/N): " -n 1 -r
=======
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
    
    # Verificar se o remote está configurado
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_error "Repositório remoto não configurado"
        print_warning "Execute: ./scripts/setup-github.sh"
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
        
        # Tentar usar AI commit se disponível
        if [[ -f "scripts/ai-commit.sh" ]] && [[ -n "$OPENAI_API_KEY" ]]; then
            echo -e "${PURPLE}🤖 Usando AI para gerar mensagem de commit...${NC}"
            if bash scripts/ai-commit.sh --auto; then
                print_success "Commit realizado com IA"
            else
                print_warning "Fallback para commit manual"
                git add .
                git commit -m "Auto-commit antes do deploy: $message"
            fi
        else
            git add .
            git commit -m "Auto-commit antes do deploy: $message"
        fi
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
    echo -e "${BLUE}📤 Fazendo push para GitHub...${NC}"
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
    echo -e "   🔗 GitHub: https://github.com/agenciaspace/clinione"
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
>>>>>>> Stashed changes
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Adicionar todas as mudanças
        echo -e "${BLUE}📦 Adicionando arquivos...${NC}"
        git add .
        
        # Pedir mensagem de commit ou usar padrão
        read -p "Mensagem do commit (Enter para usar 'deploy: update'): " commit_msg
        if [[ -z "$commit_msg" ]]; then
            commit_msg="deploy: update"
        fi
        
        echo -e "${BLUE}💾 Fazendo commit...${NC}"
        git commit -m "$commit_msg"
    else
        echo -e "${RED}❌ Deploy cancelado. Commit suas mudanças primeiro.${NC}"
        exit 1
    fi
fi

# Verificar se está no branch correto
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "clarissa" ]]; then
    echo -e "${YELLOW}⚠️  Você está no branch '$current_branch', mas o deploy é configurado para 'clarissa'${NC}"
    read -p "Deseja mudar para o branch clarissa? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Mudando para branch clarissa...${NC}"
        git checkout clarissa
    else
        echo -e "${YELLOW}⚠️  Continuando no branch atual...${NC}"
    fi
fi

# Push para o repositório
echo -e "${BLUE}📤 Fazendo push para o repositório...${NC}"
git push origin $(git branch --show-current)

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Deploy na Vercel
echo -e "${BLUE}🚀 Fazendo deploy na Vercel...${NC}"
vercel --prod

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Site disponível em: https://clini.one${NC}"
echo -e "${BLUE}📊 Dashboard Vercel: https://vercel.com/dashboard${NC}" 