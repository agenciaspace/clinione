#!/bin/bash

# Setup OpenAI API Key - Clini.One
# Configura a chave da OpenAI para commits inteligentes com IA

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🔑 SETUP OPENAI API KEY                      ║"
    echo "║              Configure IA para commits                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_current_config() {
    echo -e "${BLUE}🔍 Verificando configuração atual...${NC}"
    
    if [[ -n "$OPENAI_API_KEY" ]]; then
        echo -e "${GREEN}✅ OPENAI_API_KEY já está configurada${NC}"
        echo -e "${YELLOW}🔑 Chave atual: ${OPENAI_API_KEY:0:20}...${NC}"
        echo ""
        
        read -p "$(echo -e ${CYAN}Deseja reconfigurar? [y/N]: ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}✋ Configuração mantida${NC}"
            exit 0
        fi
    else
        echo -e "${YELLOW}⚠️  OPENAI_API_KEY não configurada${NC}"
    fi
    
    echo ""
}

get_shell_config_file() {
    if [[ "$SHELL" == *"zsh"* ]]; then
        echo "$HOME/.zshrc"
    elif [[ "$SHELL" == *"bash"* ]]; then
        echo "$HOME/.bashrc"
    else
        echo "$HOME/.profile"
    fi
}

setup_api_key() {
    echo -e "${BLUE}🔑 Configurando OpenAI API Key...${NC}"
    echo ""
    
    echo -e "${YELLOW}📝 Como obter sua chave:${NC}"
    echo -e "   1. Acesse: ${BLUE}https://platform.openai.com/api-keys${NC}"
    echo -e "   2. Faça login na sua conta OpenAI"
    echo -e "   3. Clique em 'Create new secret key'"
    echo -e "   4. Copie a chave gerada"
    echo ""
    
    echo -e "${YELLOW}💰 Preços aproximados (GPT-3.5-turbo):${NC}"
    echo -e "   • Commit simples: ~$0.001 USD"
    echo -e "   • 1000 commits: ~$1 USD"
    echo ""
    
    # Solicitar a chave
    echo -e "${CYAN}🔐 Cole sua OpenAI API Key:${NC}"
    read -s -p "Key: " api_key
    echo
    echo ""
    
    # Validar formato básico
    if [[ ! "$api_key" =~ ^sk-[A-Za-z0-9]{48,}$ ]]; then
        echo -e "${RED}❌ Formato de chave inválido${NC}"
        echo -e "${YELLOW}💡 A chave deve começar com 'sk-' e ter pelo menos 51 caracteres${NC}"
        exit 1
    fi
    
    # Testar a chave
    echo -e "${BLUE}🧪 Testando chave...${NC}"
    local test_response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $api_key" \
        -d '{
            "model": "gpt-3.5-turbo",
            "messages": [{"role": "user", "content": "test"}],
            "max_tokens": 5
        }')
    
    if echo "$test_response" | grep -q '"choices"'; then
        echo -e "${GREEN}✅ Chave válida e funcionando!${NC}"
    else
        echo -e "${RED}❌ Erro ao testar a chave${NC}"
        echo -e "${YELLOW}📋 Resposta da API:${NC}"
        echo "$test_response" | jq . 2>/dev/null || echo "$test_response"
        exit 1
    fi
    
    # Salvar no arquivo de configuração do shell
    local shell_config=$(get_shell_config_file)
    
    echo -e "${BLUE}💾 Salvando configuração...${NC}"
    
    # Remover configuração anterior se existir
    if [[ -f "$shell_config" ]]; then
        sed -i.bak '/export OPENAI_API_KEY=/d' "$shell_config"
    fi
    
    # Adicionar nova configuração
    echo "export OPENAI_API_KEY=\"$api_key\"" >> "$shell_config"
    
    # Aplicar no shell atual
    export OPENAI_API_KEY="$api_key"
    
    echo -e "${GREEN}✅ Configuração salva em: $shell_config${NC}"
    echo ""
    
    # Testar o script de AI commit
    if [[ -f "scripts/ai-commit.sh" ]]; then
        echo -e "${BLUE}🧪 Testando AI commit...${NC}"
        chmod +x scripts/ai-commit.sh
        
        # Criar um pequeno teste se não houver mudanças
        if git diff-index --quiet HEAD --; then
            echo "# Teste AI Commit" > test-ai-commit.txt
            git add test-ai-commit.txt
            
            if bash scripts/ai-commit.sh --auto; then
                echo -e "${GREEN}✅ AI commit funcionando perfeitamente!${NC}"
                # Remover arquivo de teste
                git reset HEAD~1 --soft
                rm -f test-ai-commit.txt
            else
                echo -e "${YELLOW}⚠️  AI commit com problemas, mas chave está configurada${NC}"
                git reset HEAD --hard
                rm -f test-ai-commit.txt
            fi
        else
            echo -e "${YELLOW}💡 Há mudanças pendentes. Teste o AI commit com:${NC}"
            echo -e "   ${BLUE}./scripts/ai-commit.sh${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Configuração concluída!${NC}"
    echo ""
    echo -e "${CYAN}🚀 Próximos passos:${NC}"
    echo -e "   1. Reinicie seu terminal ou execute: ${BLUE}source $shell_config${NC}"
    echo -e "   2. Teste com: ${BLUE}./scripts/ai-commit.sh${NC}"
    echo -e "   3. Use nos deploys: ${BLUE}./scripts/deploy.sh${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dica: A IA funciona melhor com mudanças pequenas e focadas${NC}"
}

show_help() {
    echo -e "${CYAN}🔑 Setup OpenAI API Key - Ajuda${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "   ${BLUE}./scripts/setup-openai.sh${NC}        - Configurar chave interativamente"
    echo -e "   ${BLUE}./scripts/setup-openai.sh --help${NC} - Esta ajuda"
    echo ""
    echo -e "${YELLOW}O que faz:${NC}"
    echo -e "   • Configura OPENAI_API_KEY no seu shell"
    echo -e "   • Testa a chave com a API da OpenAI"
    echo -e "   • Habilita commits inteligentes com IA"
    echo ""
    echo -e "${YELLOW}Requisitos:${NC}"
    echo -e "   • Conta OpenAI (gratuita ou paga)"
    echo -e "   • Chave de API da OpenAI"
    echo -e "   • curl e jq instalados"
}

main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        "")
            # Modo padrão
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    print_header
    
    # Verificar dependências
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl não está instalado${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq não está instalado${NC}"
        echo -e "${YELLOW}💡 Instale com: brew install jq${NC}"
        exit 1
    fi
    
    check_current_config
    setup_api_key
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 