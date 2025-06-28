#!/bin/bash

# Script de Deploy Simples para Clini.One
# Uso: ./scripts/deploy-simple.sh "mensagem do commit"

set -e

echo "🚀 Deploy automático iniciado..."

# Usar mensagem passada como parâmetro ou padrão
COMMIT_MSG="${1:-deploy: automatic update}"

# Adicionar e commitar mudanças se houver
if [[ -n $(git status --porcelain) ]]; then
    echo "📦 Commitando mudanças..."
    git add .
    git commit -m "$COMMIT_MSG"
fi

# Garantir que está no branch clarissa
echo "🔄 Mudando para branch clarissa..."
git checkout clarissa

# Push para o repositório
echo "📤 Push para repositório..."
git push origin clarissa

# Deploy na Vercel (instala CLI se necessário)
if ! command -v vercel &> /dev/null; then
    echo "⚙️ Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🚀 Deploy na Vercel..."
vercel --prod --yes

echo "✅ Deploy concluído!"
echo "🌐 Site: https://clini.one" 