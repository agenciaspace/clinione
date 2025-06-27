#!/bin/bash

# Deploy Rápido - Clini.One
# Script simplificado para testar o deploy

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Deploy Rápido - Clini.One${NC}"
echo ""

# Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Branch atual: $CURRENT_BRANCH${NC}"

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    git status --short
else
    echo -e "${GREEN}✅ Repositório limpo${NC}"
fi

# Push para GitHub
echo -e "${BLUE}📤 Fazendo push para GitHub...${NC}"
git push origin "$CURRENT_BRANCH"
echo -e "${GREEN}✅ Push concluído${NC}"

# Deploy na Vercel
echo -e "${BLUE}▲ Fazendo deploy na Vercel...${NC}"

# Verificar se é produção
if [[ "$CURRENT_BRANCH" == "main" ]]; then
    echo -e "${YELLOW}🚀 Deploy de PRODUÇÃO${NC}"
    vercel --prod --yes
else
    echo -e "${YELLOW}👀 Deploy de PREVIEW${NC}"
    vercel --yes
fi

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo -e "${GREEN}🌐 URL: https://clini.one${NC}"
echo ""
echo -e "${BLUE}📋 Para ver o status:${NC}"
echo -e "   vercel ls"
echo -e "   vercel logs" 