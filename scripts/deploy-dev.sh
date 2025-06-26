#!/bin/bash

# Deploy de Desenvolvimento/Preview - Clini.One
# Uso: ./scripts/deploy-dev.sh [branch] [mensagem]

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuração
BRANCH=${1:-"dev"}
MESSAGE=${2:-"Deploy de desenvolvimento $(date '+%Y-%m-%d %H:%M:%S')"}

echo -e "${BLUE}🔧 Iniciando deploy de DESENVOLVIMENTO...${NC}"
echo -e "${BLUE}🌿 Branch: $BRANCH${NC}"
echo -e "${BLUE}📝 Mensagem: $MESSAGE${NC}"
echo ""

# Criar branch se não existir
if ! git show-ref --verify --quiet refs/heads/"$BRANCH"; then
    echo -e "${YELLOW}🌱 Criando nova branch: $BRANCH${NC}"
    git checkout -b "$BRANCH"
else
    echo -e "${BLUE}🔄 Mudando para branch: $BRANCH${NC}"
    git checkout "$BRANCH"
fi

# Executar o script principal
./scripts/deploy.sh "$BRANCH" "$MESSAGE"

echo -e "${GREEN}✅ Deploy de desenvolvimento concluído!${NC}"
echo -e "${GREEN}🔗 Verifique o dashboard da Vercel para a URL do preview${NC}" 