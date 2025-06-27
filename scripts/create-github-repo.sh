#!/bin/bash

# Criar Repositório GitHub - Clini.One
# Script para facilitar a criação do repositório

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🐙 Criando Repositório GitHub - Clini.One${NC}"
echo ""

# Obter informações do repositório atual
REMOTE_URL=$(git remote get-url origin)
REPO_INFO=$(echo "$REMOTE_URL" | sed 's/https:\/\/github.com\///; s/\.git$//')
USER=$(echo "$REPO_INFO" | cut -d'/' -f1)
REPO=$(echo "$REPO_INFO" | cut -d'/' -f2)

echo -e "${BLUE}📋 Informações do repositório:${NC}"
echo -e "   👤 Usuário: ${YELLOW}$USER${NC}"
echo -e "   📦 Repositório: ${YELLOW}$REPO${NC}"
echo -e "   🔗 URL: ${YELLOW}$REMOTE_URL${NC}"
echo ""

# Criar URL para criação do repositório
CREATE_URL="https://github.com/new"

echo -e "${CYAN}🎯 Passos para criar o repositório:${NC}"
echo ""
echo -e "${YELLOW}1. Abrir GitHub para criar repositório${NC}"
echo -e "   Abrindo: $CREATE_URL"
echo ""
echo -e "${YELLOW}2. Configurar o repositório:${NC}"
echo -e "   📝 Repository name: ${BLUE}$REPO${NC}"
echo -e "   📄 Description: ${BLUE}Sistema de gestão clínica Clini.One${NC}"
echo -e "   🔒 Private/Public: ${BLUE}Sua escolha${NC}"
echo -e "   ❌ NÃO marcar: Add a README file"
echo -e "   ❌ NÃO marcar: Add .gitignore"  
echo -e "   ❌ NÃO marcar: Choose a license"
echo ""

# Tentar abrir o navegador
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    open "$CREATE_URL"
elif command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}🌐 Abrindo navegador...${NC}"
    xdg-open "$CREATE_URL"
else
    echo -e "${YELLOW}⚠️  Não foi possível abrir automaticamente${NC}"
    echo -e "${YELLOW}📋 Acesse manualmente: $CREATE_URL${NC}"
fi

echo ""
echo -e "${CYAN}⏳ Aguardando você criar o repositório...${NC}"
read -p "$(echo -e ${YELLOW}Pressione ENTER após criar o repositório no GitHub...${NC})"

echo ""
echo -e "${BLUE}🧪 Testando conexão com o repositório...${NC}"

# Testar se o repositório existe agora
if git ls-remote origin > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Repositório criado com sucesso!${NC}"
    
    # Fazer o primeiro push
    echo -e "${BLUE}📤 Fazendo primeiro push...${NC}"
    git push -u origin main
    
    echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Repositório disponível em:${NC}"
    echo -e "   ${BLUE}$(echo "$REMOTE_URL" | sed 's/\.git$//')${NC}"
    echo ""
    echo -e "${GREEN}🎉 GitHub configurado completamente!${NC}"
    echo ""
    echo -e "${CYAN}🚀 Agora você pode usar todos os scripts de deploy:${NC}"
    echo -e "   ${BLUE}./scripts/deploy-prod.sh \"mensagem\"${NC}"
    echo -e "   ${BLUE}./scripts/deploy-dev.sh branch \"mensagem\"${NC}"
    echo -e "   ${BLUE}./scripts/deploy.sh branch \"mensagem\"${NC}"
    
else
    echo -e "${YELLOW}⚠️  Repositório ainda não encontrado${NC}"
    echo -e "${YELLOW}💡 Verifique se:${NC}"
    echo -e "   1. O repositório foi criado com o nome: ${BLUE}$REPO${NC}"
    echo -e "   2. Você tem permissões de acesso"
    echo -e "   3. O repositório está público ou você está logado"
    echo ""
    echo -e "${YELLOW}🔄 Você pode tentar novamente executando:${NC}"
    echo -e "   ${BLUE}git push -u origin main${NC}"
fi 