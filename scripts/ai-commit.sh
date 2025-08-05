#!/bin/bash

# AI Commit Generator - Clini.One
# Gera mensagens de commit automáticas usando IA baseadas nas mudanças do código

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Configurações
MAX_DIFF_LINES=500
OPENAI_MODEL="gpt-3.5-turbo"
FALLBACK_MESSAGE="feat: Atualização automática do código"

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🤖 AI COMMIT GENERATOR                       ║"
    echo "║              Commits inteligentes com IA                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_openai_key() {
    if [[ -z "$OPENAI_API_KEY" ]]; then
        echo -e "${RED}❌ OPENAI_API_KEY não configurada${NC}"
        echo -e "${YELLOW}💡 Configure com:${NC}"
        echo -e "   ${BLUE}export OPENAI_API_KEY=\"sua-chave-aqui\"${NC}"
        echo -e "   ${BLUE}# Adicione ao ~/.zshrc ou ~/.bashrc para persistir${NC}"
        echo ""
        echo -e "${YELLOW}🔑 Obtenha sua chave em: https://platform.openai.com/api-keys${NC}"
        return 1
    fi
    return 0
}

get_git_diff() {
    echo -e "${BLUE}📊 Analisando mudanças no código...${NC}"
    
    # Verificar se há mudanças
    if git diff-index --quiet HEAD --; then
        echo -e "${YELLOW}⚠️  Nenhuma mudança detectada${NC}"
        return 1
    fi
    
    # Obter diff das mudanças staged e unstaged
    local staged_diff=$(git diff --cached --name-status 2>/dev/null || echo "")
    local unstaged_diff=$(git diff --name-status 2>/dev/null || echo "")
    local detailed_diff=$(git diff HEAD --unified=2 2>/dev/null | head -n $MAX_DIFF_LINES || echo "")
    
    # Combinar informações
    echo "=== STAGED FILES ==="
    echo "$staged_diff"
    echo ""
    echo "=== UNSTAGED FILES ==="
    echo "$unstaged_diff"
    echo ""
    echo "=== DETAILED CHANGES ==="
    echo "$detailed_diff"
}

generate_commit_message() {
    local git_diff="$1"
    
    echo -e "${PURPLE}🤖 Gerando mensagem de commit com IA...${NC}"
    
    # Prompt para a IA
    local prompt="Analise as seguintes mudanças de código Git e gere uma mensagem de commit seguindo o padrão Conventional Commits.

Regras:
1. Use o formato: tipo(escopo): descrição
2. Tipos válidos: feat, fix, docs, style, refactor, test, chore
3. Descrição em português, concisa e clara
4. Máximo 72 caracteres
5. Foque nas mudanças mais importantes
6. Se houver breaking changes, adicione '!' após o tipo

Mudanças do Git:
$git_diff

Responda APENAS com a mensagem de commit, sem explicações adicionais."

    # Fazer requisição para OpenAI
    local response=$(curl -s -X POST "https://api.openai.com/v1/chat/completions" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $OPENAI_API_KEY" \
        -d "{
            \"model\": \"$OPENAI_MODEL\",
            \"messages\": [
                {
                    \"role\": \"system\",
                    \"content\": \"Você é um especialista em Git e Conventional Commits. Gere mensagens de commit concisas e precisas em português.\"
                },
                {
                    \"role\": \"user\",
                    \"content\": $(echo "$prompt" | jq -R -s .)
                }
            ],
            \"max_tokens\": 100,
            \"temperature\": 0.3
        }")
    
    # Extrair mensagem da resposta
    local commit_message=$(echo "$response" | jq -r '.choices[0].message.content' 2>/dev/null || echo "")
    
    # Verificar se a resposta é válida
    if [[ -z "$commit_message" || "$commit_message" == "null" ]]; then
        echo -e "${RED}❌ Erro na resposta da IA${NC}"
        echo -e "${YELLOW}📋 Resposta recebida:${NC}"
        echo "$response" | jq . 2>/dev/null || echo "$response"
        echo ""
        echo -e "${YELLOW}🔄 Usando mensagem padrão...${NC}"
        echo "$FALLBACK_MESSAGE"
        return 1
    fi
    
    # Limpar e validar mensagem
    commit_message=$(echo "$commit_message" | tr -d '\n\r' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    
    # Verificar se a mensagem segue o padrão básico
    if [[ ! "$commit_message" =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?!?:\ .+ ]]; then
        echo -e "${YELLOW}⚠️  Mensagem não segue padrão Conventional Commits${NC}"
        echo -e "${YELLOW}📝 Mensagem gerada: $commit_message${NC}"
        echo -e "${YELLOW}🔄 Usando mensagem padrão...${NC}"
        echo "$FALLBACK_MESSAGE"
        return 1
    fi
    
    echo "$commit_message"
    return 0
}

preview_commit() {
    local message="$1"
    
    echo -e "${CYAN}📋 Preview do commit:${NC}"
    echo ""
    echo -e "${YELLOW}📝 Mensagem:${NC} ${GREEN}$message${NC}"
    echo ""
    echo -e "${YELLOW}📁 Arquivos que serão commitados:${NC}"
    
    # Mostrar arquivos staged
    if git diff --cached --quiet; then
        # Se não há arquivos staged, mostrar todos os modificados
        git status --short | grep -E "^(M|A|D|R|C)" | head -10
    else
        # Mostrar apenas arquivos staged
        git diff --cached --name-status | head -10
    fi
    
    echo ""
}

interactive_commit() {
    local ai_message="$1"
    
    echo -e "${CYAN}🤖 Mensagem gerada pela IA:${NC}"
    echo -e "${GREEN}\"$ai_message\"${NC}"
    echo ""
    
    echo -e "${YELLOW}Escolha uma opção:${NC}"
    echo -e "   ${BLUE}1.${NC} Usar mensagem da IA"
    echo -e "   ${BLUE}2.${NC} Editar mensagem"
    echo -e "   ${BLUE}3.${NC} Escrever mensagem personalizada"
    echo -e "   ${BLUE}4.${NC} Cancelar"
    echo ""
    
    read -p "$(echo -e ${CYAN}Sua escolha [1-4]: ${NC})" -n 1 -r
    echo
    echo ""
    
    case $REPLY in
        1)
            return 0  # Usar mensagem da IA
            ;;
        2)
            echo -e "${BLUE}✏️  Editando mensagem...${NC}"
            read -p "$(echo -e ${YELLOW}Nova mensagem: ${NC})" -e -i "$ai_message" ai_message
            ;;
        3)
            echo -e "${BLUE}✏️  Mensagem personalizada...${NC}"
            read -p "$(echo -e ${YELLOW}Sua mensagem: ${NC})" ai_message
            ;;
        4)
            echo -e "${YELLOW}❌ Commit cancelado${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida${NC}"
            exit 1
            ;;
    esac
    
    # Atualizar a variável global
    echo "$ai_message"
}

stage_files() {
    echo -e "${BLUE}📦 Preparando arquivos para commit...${NC}"
    
    # Verificar se há arquivos staged
    if git diff --cached --quiet; then
        echo -e "${YELLOW}⚠️  Nenhum arquivo staged. Adicionando todos os modificados...${NC}"
        git add .
    fi
    
    # Mostrar o que será commitado
    echo -e "${GREEN}✅ Arquivos preparados:${NC}"
    git diff --cached --name-status | head -10
    
    if [[ $(git diff --cached --name-status | wc -l) -gt 10 ]]; then
        echo -e "${YELLOW}... e mais $(( $(git diff --cached --name-status | wc -l) - 10 )) arquivos${NC}"
    fi
    
    echo ""
}

execute_commit() {
    local message="$1"
    local auto_mode="$2"
    
    if [[ "$auto_mode" != "true" ]]; then
        preview_commit "$message"
        
        read -p "$(echo -e ${CYAN}Confirmar commit? [y/N]: ${NC})" -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}❌ Commit cancelado${NC}"
            exit 0
        fi
    fi
    
    echo -e "${BLUE}💾 Executando commit...${NC}"
    
    if git commit -m "$message"; then
        echo -e "${GREEN}✅ Commit realizado com sucesso!${NC}"
        echo -e "${GREEN}📝 Mensagem: $message${NC}"
        
        # Mostrar hash do commit
        local commit_hash=$(git rev-parse --short HEAD)
        echo -e "${GREEN}🔗 Hash: $commit_hash${NC}"
        
        return 0
    else
        echo -e "${RED}❌ Erro ao fazer commit${NC}"
        return 1
    fi
}

show_help() {
    echo -e "${CYAN}🤖 AI Commit Generator - Ajuda${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "   ${BLUE}./scripts/ai-commit.sh${NC}                 - Modo interativo"
    echo -e "   ${BLUE}./scripts/ai-commit.sh --auto${NC}          - Modo automático"
    echo -e "   ${BLUE}./scripts/ai-commit.sh --help${NC}          - Esta ajuda"
    echo ""
    echo -e "${YELLOW}Configuração:${NC}"
    echo -e "   ${BLUE}export OPENAI_API_KEY=\"sua-chave\"${NC}    - Configurar chave da OpenAI"
    echo ""
    echo -e "${YELLOW}Exemplos:${NC}"
    echo -e "   ${BLUE}# Commit interativo com IA${NC}"
    echo -e "   ${BLUE}./scripts/ai-commit.sh${NC}"
    echo ""
    echo -e "   ${BLUE}# Commit automático (para CI/CD)${NC}"
    echo -e "   ${BLUE}./scripts/ai-commit.sh --auto${NC}"
}

main() {
    local auto_mode="false"
    
    # Processar argumentos
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --auto|-a)
            auto_mode="true"
            ;;
        "")
            # Modo padrão (interativo)
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    if [[ "$auto_mode" != "true" ]]; then
        print_header
    fi
    
    # Verificar dependências
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq não está instalado${NC}"
        echo -e "${YELLOW}💡 Instale com: brew install jq${NC}"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl não está instalado${NC}"
        exit 1
    fi
    
    # Verificar se está em um repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}❌ Não está em um repositório Git${NC}"
        exit 1
    fi
    
    # Verificar chave da OpenAI
    if ! check_openai_key; then
        if [[ "$auto_mode" == "true" ]]; then
            echo -e "${YELLOW}🔄 Modo automático: usando mensagem padrão${NC}"
            stage_files
            execute_commit "$FALLBACK_MESSAGE" "true"
            exit 0
        else
            exit 1
        fi
    fi
    
    # Preparar arquivos
    stage_files
    
    # Obter diferenças do Git
    local git_diff
    if ! git_diff=$(get_git_diff); then
        echo -e "${YELLOW}❌ Nenhuma mudança para commit${NC}"
        exit 0
    fi
    
    # Gerar mensagem com IA
    local ai_message
    if ai_message=$(generate_commit_message "$git_diff"); then
        echo -e "${GREEN}✅ Mensagem gerada: $ai_message${NC}"
    else
        ai_message="$FALLBACK_MESSAGE"
        echo -e "${YELLOW}🔄 Usando mensagem padrão: $ai_message${NC}"
    fi
    
    # Processar commit baseado no modo
    if [[ "$auto_mode" == "true" ]]; then
        execute_commit "$ai_message" "true"
    else
        local final_message
        final_message=$(interactive_commit "$ai_message")
        execute_commit "$final_message" "false"
    fi
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 