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
    
    # Perguntar se quer commitar
    read -p "Deseja commitar essas mudanças? (y/N): " -n 1 -r
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