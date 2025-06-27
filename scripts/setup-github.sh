#!/bin/bash

# Setup GitHub - Clini.One
# Script para configurar o repositório GitHub corretamente

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   🐙 SETUP GITHUB - CLINI.ONE               ║"
    echo "║              Configuração do Repositório GitHub             ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_current_config() {
    echo -e "${BLUE}📋 Configuração atual:${NC}"
    echo ""
    
    echo -e "${YELLOW}🔗 Repositório remoto:${NC}"
    git remote -v || echo "Nenhum repositório remoto configurado"
    echo ""
    
    echo -e "${YELLOW}👤 Usuário Git:${NC}"
    echo "Nome: $(git config --get user.name || echo 'Não configurado')"
    echo "Email: $(git config --get user.email || echo 'Não configurado')"
    echo ""
    
    echo -e "${YELLOW}🌿 Branch atual:${NC}"
    git branch --show-current
    echo ""
}

setup_new_repo() {
    echo -e "${BLUE}🆕 Configurando novo repositório...${NC}"
    echo ""
    
    # Solicitar informações do usuário
    read -p "$(echo -e ${YELLOW}Digite seu nome de usuário do GitHub: ${NC})" GITHUB_USER
    read -p "$(echo -e ${YELLOW}Digite o nome do repositório: ${NC})" REPO_NAME
    
    # Validar entrada
    if [[ -z "$GITHUB_USER" || -z "$REPO_NAME" ]]; then
        echo -e "${RED}❌ Nome de usuário e repositório são obrigatórios${NC}"
        exit 1
    fi
    
    # Configurar novo remote
    NEW_REMOTE="https://github.com/$GITHUB_USER/$REPO_NAME.git"
    echo -e "${BLUE}🔗 Configurando remote: $NEW_REMOTE${NC}"
    
    # Remover remote atual se existir
    git remote remove origin 2>/dev/null || true
    
    # Adicionar novo remote
    git remote add origin "$NEW_REMOTE"
    
    echo -e "${GREEN}✅ Remote configurado com sucesso!${NC}"
    echo ""
    
    # Mostrar instruções
    echo -e "${CYAN}📋 Próximos passos:${NC}"
    echo -e "1. ${YELLOW}Criar o repositório no GitHub:${NC}"
    echo -e "   https://github.com/new"
    echo -e "   Nome: $REPO_NAME"
    echo -e "   Deixe sem README, .gitignore, etc. (já temos)"
    echo ""
    echo -e "2. ${YELLOW}Fazer o primeiro push:${NC}"
    echo -e "   git push -u origin main"
    echo ""
    
    return 0
}

fix_existing_repo() {
    echo -e "${BLUE}🔧 Corrigindo repositório existente...${NC}"
    echo ""
    
    # Verificar se o repositório existe
    CURRENT_REMOTE=$(git remote get-url origin)
    echo -e "${YELLOW}🔍 Testando acesso ao repositório: $CURRENT_REMOTE${NC}"
    
    # Tentar fazer fetch para verificar se existe
    if git ls-remote origin > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Repositório existe e está acessível${NC}"
        
        # Fazer pull das mudanças
        echo -e "${BLUE}📥 Sincronizando com o repositório remoto...${NC}"
        git pull origin main --allow-unrelated-histories || {
            echo -e "${YELLOW}⚠️  Conflitos detectados ou históricos não relacionados${NC}"
            echo -e "${YELLOW}💡 Você pode resolver manualmente ou fazer push forçado${NC}"
        }
        
    else
        echo -e "${RED}❌ Repositório não existe ou não está acessível${NC}"
        echo -e "${YELLOW}💡 Opções:${NC}"
        echo -e "   1. Criar o repositório no GitHub"
        echo -e "   2. Configurar um novo repositório"
        echo -e "   3. Verificar permissões de acesso"
        
        read -p "$(echo -e ${YELLOW}Deseja configurar um novo repositório? [y/N]: ${NC})" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            setup_new_repo
        fi
    fi
}

configure_git_user() {
    echo -e "${BLUE}👤 Configurando usuário Git...${NC}"
    echo ""
    
    CURRENT_NAME=$(git config --get user.name || echo "")
    CURRENT_EMAIL=$(git config --get user.email || echo "")
    
    echo -e "${YELLOW}Configuração atual:${NC}"
    echo "Nome: $CURRENT_NAME"
    echo "Email: $CURRENT_EMAIL"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Deseja alterar a configuração do usuário? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "$(echo -e ${YELLOW}Digite seu nome: ${NC})" NEW_NAME
        read -p "$(echo -e ${YELLOW}Digite seu email: ${NC})" NEW_EMAIL
        
        if [[ -n "$NEW_NAME" ]]; then
            git config user.name "$NEW_NAME"
            echo -e "${GREEN}✅ Nome configurado: $NEW_NAME${NC}"
        fi
        
        if [[ -n "$NEW_EMAIL" ]]; then
            git config user.email "$NEW_EMAIL"
            echo -e "${GREEN}✅ Email configurado: $NEW_EMAIL${NC}"
        fi
    fi
}

test_github_connection() {
    echo -e "${BLUE}🧪 Testando conexão com GitHub...${NC}"
    echo ""
    
    # Testar push
    echo -e "${YELLOW}📤 Testando push...${NC}"
    if git push origin main 2>/dev/null; then
        echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
        
        # Mostrar informações do repositório
        REPO_URL=$(git remote get-url origin | sed 's/\.git$//')
        echo -e "${GREEN}🌐 Repositório: $REPO_URL${NC}"
        
    else
        echo -e "${RED}❌ Erro no push${NC}"
        echo -e "${YELLOW}💡 Possíveis soluções:${NC}"
        echo -e "   1. Verificar se o repositório existe no GitHub"
        echo -e "   2. Verificar permissões de acesso"
        echo -e "   3. Fazer push forçado: git push -u origin main --force"
        echo ""
        
        read -p "$(echo -e ${YELLOW}Deseja fazer push forçado? [y/N]: ${NC})" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push -u origin main --force
            echo -e "${GREEN}✅ Push forçado realizado!${NC}"
        fi
    fi
}

show_final_status() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   ✅ GITHUB CONFIGURADO!                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}📋 Configuração final:${NC}"
    echo ""
    
    echo -e "${YELLOW}🔗 Repositório remoto:${NC}"
    git remote -v
    echo ""
    
    echo -e "${YELLOW}👤 Usuário Git:${NC}"
    echo "Nome: $(git config --get user.name)"
    echo "Email: $(git config --get user.email)"
    echo ""
    
    echo -e "${YELLOW}🌿 Branch:${NC}"
    git branch --show-current
    echo ""
    
    echo -e "${CYAN}🚀 Agora você pode usar os scripts de deploy completos:${NC}"
    echo -e "   ${BLUE}./scripts/deploy-prod.sh \"mensagem\"${NC}"
    echo -e "   ${BLUE}./scripts/deploy-dev.sh branch \"mensagem\"${NC}"
    echo -e "   ${BLUE}./scripts/deploy.sh branch \"mensagem\"${NC}"
}

main() {
    print_header
    
    check_current_config
    
    echo -e "${YELLOW}🎯 O que você deseja fazer?${NC}"
    echo -e "   ${BLUE}1.${NC} Configurar novo repositório"
    echo -e "   ${BLUE}2.${NC} Corrigir repositório existente"
    echo -e "   ${BLUE}3.${NC} Configurar usuário Git"
    echo -e "   ${BLUE}4.${NC} Testar conexão com GitHub"
    echo -e "   ${BLUE}5.${NC} Fazer tudo automaticamente"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Escolha uma opção [1-5]: ${NC})" -n 1 -r
    echo
    echo ""
    
    case $REPLY in
        1)
            setup_new_repo
            ;;
        2)
            fix_existing_repo
            ;;
        3)
            configure_git_user
            ;;
        4)
            test_github_connection
            ;;
        5)
            configure_git_user
            echo ""
            fix_existing_repo
            echo ""
            test_github_connection
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            exit 1
            ;;
    esac
    
    echo ""
    show_final_status
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 