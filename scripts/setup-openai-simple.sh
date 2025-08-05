#!/bin/bash

# Setup OpenAI Simple - Clini.One
# Versão simplificada para configurar OpenAI API Key

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}"
echo "🔑 Configuração Simples da OpenAI API Key"
echo "========================================"
echo -e "${NC}"

echo -e "${YELLOW}📝 Passos para obter sua chave:${NC}"
echo "1. Acesse: https://platform.openai.com/api-keys"
echo "2. Faça login na sua conta OpenAI"
echo "3. Clique em 'Create new secret key'"
echo "4. Copie a chave gerada"
echo ""

echo -e "${YELLOW}💰 Custo aproximado:${NC}"
echo "• Cada commit: ~$0.001 USD"
echo "• 1000 commits: ~$1 USD"
echo ""

# Método 1: Entrada visível
echo -e "${CYAN}Método 1 - Cole sua chave aqui (será visível):${NC}"
read -p "OpenAI API Key: " api_key

# Se não funcionou, tentar método 2
if [[ -z "$api_key" ]]; then
    echo ""
    echo -e "${CYAN}Método 2 - Vamos criar um arquivo temporário:${NC}"
    echo "1. Abra um novo terminal"
    echo "2. Execute: nano /tmp/openai-key.txt"
    echo "3. Cole sua chave e salve (Ctrl+X, Y, Enter)"
    echo "4. Volte aqui e pressione Enter"
    echo ""
    read -p "Pressione Enter quando terminar..."
    
    if [[ -f "/tmp/openai-key.txt" ]]; then
        api_key=$(cat /tmp/openai-key.txt | tr -d '\n\r ')
        rm -f /tmp/openai-key.txt
        echo -e "${GREEN}✅ Chave lida do arquivo${NC}"
    fi
fi

# Se ainda não funcionou, método 3
if [[ -z "$api_key" ]]; then
    echo ""
    echo -e "${CYAN}Método 3 - Configuração manual:${NC}"
    echo "Vou criar o comando para você executar manualmente."
    echo ""
    echo -e "${YELLOW}Execute este comando substituindo SUA_CHAVE_AQUI:${NC}"
    echo ""
    echo -e "${BLUE}export OPENAI_API_KEY=\"SUA_CHAVE_AQUI\"${NC}"
    echo -e "${BLUE}echo 'export OPENAI_API_KEY=\"SUA_CHAVE_AQUI\"' >> ~/.zshrc${NC}"
    echo ""
    echo "Depois execute: source ~/.zshrc"
    echo ""
    exit 0
fi

# Validar formato básico
if [[ ! "$api_key" =~ ^sk-[A-Za-z0-9]{48,}$ ]]; then
    echo -e "${RED}❌ Formato de chave inválido${NC}"
    echo -e "${YELLOW}💡 A chave deve começar com 'sk-' e ter pelo menos 51 caracteres${NC}"
    echo -e "${YELLOW}Sua chave: ${api_key:0:20}...${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Formato da chave válido${NC}"

# Testar a chave
echo -e "${BLUE}🧪 Testando chave...${NC}"
test_response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $api_key" \
    -d '{
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "test"}],
        "max_tokens": 5
    }')

if echo "$test_response" | grep -q '"choices"'; then
    echo -e "${GREEN}✅ Chave funcionando!${NC}"
else
    echo -e "${RED}❌ Erro ao testar a chave${NC}"
    echo "Resposta da API:"
    echo "$test_response" | jq . 2>/dev/null || echo "$test_response"
    exit 1
fi

# Salvar configuração
shell_config="$HOME/.zshrc"
if [[ "$SHELL" == *"bash"* ]]; then
    shell_config="$HOME/.bashrc"
fi

echo -e "${BLUE}💾 Salvando configuração...${NC}"

# Remover configuração anterior
sed -i.bak '/export OPENAI_API_KEY=/d' "$shell_config" 2>/dev/null || true

# Adicionar nova configuração
echo "export OPENAI_API_KEY=\"$api_key\"" >> "$shell_config"

# Aplicar no shell atual
export OPENAI_API_KEY="$api_key"

echo -e "${GREEN}✅ Configuração salva em: $shell_config${NC}"
echo ""

# Testar AI commit se disponível
if [[ -f "scripts/ai-commit.sh" ]]; then
    echo -e "${BLUE}🧪 Testando AI commit...${NC}"
    chmod +x scripts/ai-commit.sh
    
    # Criar teste simples
    echo "# Teste OpenAI configuração" > test-openai.txt
    git add test-openai.txt 2>/dev/null || true
    
    if bash scripts/ai-commit.sh --auto 2>/dev/null; then
        echo -e "${GREEN}✅ AI commit funcionando!${NC}"
        # Limpar teste
        git reset HEAD~1 --soft 2>/dev/null || true
        rm -f test-openai.txt
    else
        echo -e "${YELLOW}⚠️  AI commit com problemas, mas chave está configurada${NC}"
        git reset HEAD --hard 2>/dev/null || true
        rm -f test-openai.txt
    fi
fi

echo ""
echo -e "${GREEN}🎉 Configuração concluída!${NC}"
echo ""
echo -e "${CYAN}🚀 Próximos passos:${NC}"
echo "1. Reinicie seu terminal ou execute: source $shell_config"
echo "2. Teste com: ./scripts/ai-commit.sh"
echo "3. Use nos deploys: ./scripts/deploy.sh"
echo ""
echo -e "${YELLOW}💡 Dica: A IA funciona melhor com mudanças pequenas e focadas${NC}" 