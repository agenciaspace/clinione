#!/bin/bash

# Deploy apenas Vercel - Clini.One
# Script para testar deploy apenas na Vercel

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}▲ Deploy Vercel - Clini.One${NC}"
echo ""

# Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Branch atual: $CURRENT_BRANCH${NC}"

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI não encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    git status --short
    echo -e "${YELLOW}💡 Considere fazer commit antes do deploy${NC}"
else
    echo -e "${GREEN}✅ Repositório limpo${NC}"
fi

# Deploy na Vercel
echo -e "${BLUE}▲ Fazendo deploy na Vercel...${NC}"
echo ""

# Verificar se é produção
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${CYAN}🚀 Deploy de PRODUÇÃO na Vercel${NC}"
    vercel --prod --yes
else
    echo -e "${CYAN}👀 Deploy de PREVIEW na Vercel${NC}"
    vercel --yes
fi

echo ""
echo -e "${GREEN}✅ Deploy na Vercel concluído!${NC}"
echo -e "${GREEN}🌐 URL: https://clini.one${NC}"
echo ""
echo -e "${BLUE}📋 Comandos úteis:${NC}"
echo -e "   ${YELLOW}vercel ls${NC}          - Listar deployments"
echo -e "   ${YELLOW}vercel logs${NC}        - Ver logs"
echo -e "   ${YELLOW}vercel domains${NC}     - Ver domínios"
echo -e "   ${YELLOW}vercel --help${NC}      - Ajuda" 