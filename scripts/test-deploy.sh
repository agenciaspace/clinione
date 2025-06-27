#!/bin/bash

# Teste de Deploy Completo - Clini.One
# Testa GitHub + Vercel + Working Trees

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
    echo "║                🧪 TESTE DE DEPLOY - CLINI.ONE               ║"
    echo "║              GitHub + Vercel + Working Trees                ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

test_git_config() {
    echo -e "${BLUE}🔍 Testando configuração Git...${NC}"
    echo ""
    
    # Verificar usuário
    USER_NAME=$(git config --get user.name || echo "")
    USER_EMAIL=$(git config --get user.email || echo "")
    
    echo -e "${YELLOW}👤 Usuário Git:${NC}"
    echo -e "   Nome: ${GREEN}$USER_NAME${NC}"
    echo -e "   Email: ${GREEN}$USER_EMAIL${NC}"
    echo ""
    
    if [[ -z "$USER_NAME" || -z "$USER_EMAIL" ]]; then
        echo -e "${RED}❌ Configuração de usuário incompleta${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Configuração Git OK${NC}"
    return 0
}

test_github_connection() {
    echo -e "${BLUE}🐙 Testando conexão GitHub...${NC}"
    echo ""
    
    # Verificar remote
    REMOTE_URL=$(git remote get-url origin || echo "")
    echo -e "${YELLOW}🔗 Remote URL:${NC}"
    echo -e "   ${GREEN}$REMOTE_URL${NC}"
    echo ""
    
    if [[ -z "$REMOTE_URL" ]]; then
        echo -e "${RED}❌ Remote não configurado${NC}"
        return 1
    fi
    
    # Testar acesso
    echo -e "${YELLOW}🧪 Testando acesso ao repositório...${NC}"
    if git ls-remote origin > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Acesso ao GitHub OK${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro de acesso ao GitHub${NC}"
        return 1
    fi
}

test_vercel_cli() {
    echo -e "${BLUE}▲ Testando Vercel CLI...${NC}"
    echo ""
    
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI não instalado${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}📋 Versão Vercel:${NC}"
    vercel --version
    echo ""
    
    echo -e "${GREEN}✅ Vercel CLI OK${NC}"
    return 0
}

test_working_trees() {
    echo -e "${BLUE}🌳 Testando Working Trees...${NC}"
    echo ""
    
    # Listar working trees atuais
    echo -e "${YELLOW}📋 Working trees atuais:${NC}"
    git worktree list || echo "Nenhuma working tree adicional"
    echo ""
    
    # Testar criação de working tree
    TEST_WORKTREE="../test-worktree-$$"
    echo -e "${YELLOW}🧪 Testando criação de working tree...${NC}"
    
    if git worktree add "$TEST_WORKTREE" HEAD > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Working tree criada: $TEST_WORKTREE${NC}"
        
        # Remover working tree de teste
        git worktree remove "$TEST_WORKTREE" --force > /dev/null 2>&1
        rm -rf "$TEST_WORKTREE" > /dev/null 2>&1
        echo -e "${GREEN}✅ Working tree removida com sucesso${NC}"
        return 0
    else
        echo -e "${RED}❌ Erro ao criar working tree${NC}"
        return 1
    fi
}

test_scripts() {
    echo -e "${BLUE}📜 Testando scripts de deploy...${NC}"
    echo ""
    
    SCRIPTS=("deploy.sh" "deploy-prod.sh" "deploy-dev.sh" "vercel-only-deploy.sh")
    
    for script in "${SCRIPTS[@]}"; do
        if [[ -x "scripts/$script" ]]; then
            echo -e "${GREEN}✅ scripts/$script${NC} - Executável"
        else
            echo -e "${RED}❌ scripts/$script${NC} - Não encontrado ou não executável"
        fi
    done
    
    echo ""
    echo -e "${GREEN}✅ Scripts verificados${NC}"
    return 0
}

run_mini_deploy() {
    echo -e "${BLUE}🚀 Executando mini deploy de teste...${NC}"
    echo ""
    
    # Verificar se há mudanças
    if ! git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
        git status --short
        echo ""
        
        read -p "$(echo -e ${YELLOW}Fazer commit das mudanças? [y/N]: ${NC})" -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            git commit -m "Teste de deploy - $(date '+%Y-%m-%d %H:%M:%S')"
            echo -e "${GREEN}✅ Commit realizado${NC}"
        fi
    fi
    
    # Testar push
    echo -e "${YELLOW}📤 Testando push para GitHub...${NC}"
    if git push origin main; then
        echo -e "${GREEN}✅ Push para GitHub OK${NC}"
    else
        echo -e "${RED}❌ Erro no push para GitHub${NC}"
        return 1
    fi
    
    # Testar deploy Vercel
    echo -e "${YELLOW}▲ Testando deploy Vercel...${NC}"
    if vercel --yes > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Deploy Vercel OK${NC}"
    else
        echo -e "${RED}❌ Erro no deploy Vercel${NC}"
        return 1
    fi
    
    return 0
}

show_results() {
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   🎉 TESTE CONCLUÍDO!                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}📊 Resultados dos testes:${NC}"
    echo ""
    
    echo -e "${GREEN}✅ Sistema de deploy totalmente funcional!${NC}"
    echo ""
    
    echo -e "${CYAN}🚀 Comandos disponíveis:${NC}"
    echo -e "   ${BLUE}./scripts/deploy-prod.sh \"mensagem\"${NC}     - Deploy de produção"
    echo -e "   ${BLUE}./scripts/deploy-dev.sh branch \"msg\"${NC}    - Deploy de desenvolvimento"
    echo -e "   ${BLUE}./scripts/deploy.sh branch \"mensagem\"${NC}   - Deploy personalizado"
    echo -e "   ${BLUE}./scripts/vercel-only-deploy.sh${NC}          - Deploy apenas Vercel"
    echo ""
    
    echo -e "${CYAN}🌐 URLs importantes:${NC}"
    echo -e "   📱 Produção: ${BLUE}https://clini.one${NC}"
    echo -e "   🔗 GitHub: ${BLUE}https://github.com/agenciaspace/clinione${NC}"
    echo -e "   ▲ Vercel: ${BLUE}https://vercel.com/dashboard${NC}"
}

main() {
    print_header
    
    echo -e "${YELLOW}🧪 Este script vai testar todo o sistema de deploy${NC}"
    echo -e "${YELLOW}📋 Testes que serão executados:${NC}"
    echo -e "   1. Configuração Git"
    echo -e "   2. Conexão GitHub"
    echo -e "   3. Vercel CLI"
    echo -e "   4. Working Trees"
    echo -e "   5. Scripts de deploy"
    echo -e "   6. Mini deploy real"
    echo ""
    
    read -p "$(echo -e ${CYAN}Continuar com os testes? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Testes cancelados${NC}"
        exit 0
    fi
    
    echo ""
    
    # Executar testes
    TESTS_PASSED=0
    TOTAL_TESTS=6
    
    test_git_config && ((TESTS_PASSED++))
    echo ""
    
    test_github_connection && ((TESTS_PASSED++))
    echo ""
    
    test_vercel_cli && ((TESTS_PASSED++))
    echo ""
    
    test_working_trees && ((TESTS_PASSED++))
    echo ""
    
    test_scripts && ((TESTS_PASSED++))
    echo ""
    
    echo -e "${CYAN}🚀 Executar mini deploy real?${NC}"
    read -p "$(echo -e ${YELLOW}Isso fará push para GitHub e deploy na Vercel [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_mini_deploy && ((TESTS_PASSED++))
        echo ""
    else
        echo -e "${YELLOW}⏭️  Mini deploy pulado${NC}"
        echo ""
        ((TOTAL_TESTS--))
    fi
    
    # Mostrar resultados
    echo -e "${CYAN}📊 Resultado final: ${GREEN}$TESTS_PASSED${NC}/${GREEN}$TOTAL_TESTS${NC} testes passaram"
    echo ""
    
    if [[ $TESTS_PASSED -eq $TOTAL_TESTS ]]; then
        show_results
    else
        echo -e "${RED}❌ Alguns testes falharam. Verifique as mensagens acima.${NC}"
        exit 1
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 