#!/bin/bash

# Deploy de Produção - Clini.One
# Uso: ./scripts/deploy-prod.sh [mensagem]

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuração
MESSAGE=${1:-"Deploy de produção $(date '+%Y-%m-%d %H:%M:%S')"}

echo -e "${YELLOW}🚀 Iniciando deploy de PRODUÇÃO...${NC}"
echo -e "${YELLOW}📝 Mensagem: $MESSAGE${NC}"
echo ""

# Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
    echo -e "${RED}❌ Erro: Deploy de produção deve ser feito na branch 'main'${NC}"
    echo -e "${YELLOW}💡 Branch atual: $CURRENT_BRANCH${NC}"
    echo -e "${YELLOW}💡 Execute: git checkout main${NC}"
    exit 1
fi

# Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas. Deseja continuar? [y/N]${NC}"
    read -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deploy cancelado${NC}"
        exit 0
    fi
fi

# Executar o script principal
./scripts/deploy.sh main "$MESSAGE"

echo -e "${GREEN}✅ Deploy de produção concluído!${NC}"
echo -e "${GREEN}🌐 URL: https://clini.one${NC}" 