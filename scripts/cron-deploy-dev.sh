#!/bin/bash

# Cron Deploy Dev - Clini.One
# Deploy automático diário para branch de desenvolvimento

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/cron-deploy-dev-$(date +%Y%m%d).log"
DEV_BRANCH="dev"
LOCK_FILE="/tmp/clinione-deploy-dev.lock"

# Cores para logs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Função de log
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() {
    log "INFO" "$*"
}

log_success() {
    log "SUCCESS" "$*"
}

log_warning() {
    log "WARNING" "$*"
}

log_error() {
    log "ERROR" "$*"
}

# Verificar se já está rodando
check_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            log_warning "Deploy já está rodando (PID: $pid)"
            exit 0
        else
            log_info "Removendo lock file órfão"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    # Criar lock file
    echo $$ > "$LOCK_FILE"
}

# Limpeza ao sair
cleanup() {
    rm -f "$LOCK_FILE"
    log_info "Deploy dev finalizado"
}

# Configurar trap para limpeza
trap cleanup EXIT

# Verificar se é dia útil (opcional)
is_weekday() {
    local day=$(date +%u)  # 1=Monday, 7=Sunday
    [[ $day -le 5 ]]  # Monday to Friday
}

# Verificar se há mudanças
has_changes() {
    cd "$PROJECT_DIR"
    
    # Fetch latest changes
    git fetch origin "$DEV_BRANCH" 2>/dev/null || true
    
    # Check if local branch is behind remote
    local local_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
    local remote_commit=$(git rev-parse "origin/$DEV_BRANCH" 2>/dev/null || echo "")
    
    [[ "$local_commit" != "$remote_commit" ]]
}

# Executar testes básicos
run_basic_tests() {
    cd "$PROJECT_DIR"
    
    log_info "Executando testes básicos..."
    
    # Verificar se package.json existe
    if [[ ! -f "package.json" ]]; then
        log_warning "package.json não encontrado, pulando testes npm"
        return 0
    fi
    
    # Instalar dependências se necessário
    if [[ ! -d "node_modules" ]] || [[ "package.json" -nt "node_modules" ]]; then
        log_info "Instalando dependências..."
        if npm install >> "$LOG_FILE" 2>&1; then
            log_success "Dependências instaladas"
        else
            log_error "Falha ao instalar dependências"
            return 1
        fi
    fi
    
    # Executar linting se disponível
    if npm run lint --silent >> "$LOG_FILE" 2>&1; then
        log_success "Linting passou"
    else
        log_warning "Linting falhou ou não disponível"
    fi
    
    # Executar build test
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_success "Build passou"
        return 0
    else
        log_error "Build falhou"
        return 1
    fi
}

# Executar deploy
run_deploy() {
    cd "$PROJECT_DIR"
    
    log_info "Iniciando deploy para $DEV_BRANCH..."
    
    # Verificar se script de deploy existe
    if [[ ! -f "scripts/deploy-dev.sh" ]]; then
        log_error "Script de deploy não encontrado"
        return 1
    fi
    
    # Executar deploy
    if bash scripts/deploy-dev.sh "$DEV_BRANCH" "Deploy automático diário - $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1; then
        log_success "Deploy realizado com sucesso"
        return 0
    else
        log_error "Deploy falhou"
        return 1
    fi
}

# Enviar notificação (opcional)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Webhook para Slack/Discord (opcional)
    if [[ -n "$WEBHOOK_URL" ]]; then
        local payload="{\"text\":\"🤖 Deploy Dev - $status: $message\"}"
        curl -s -X POST -H 'Content-type: application/json' \
             --data "$payload" "$WEBHOOK_URL" >> "$LOG_FILE" 2>&1 || true
    fi
    
    # Log local sempre
    log_info "Notificação: $status - $message"
}

# Função principal
main() {
    # Criar diretório de logs
    mkdir -p "$LOG_DIR"
    
    log_info "=== INICIANDO DEPLOY DEV AUTOMÁTICO ==="
    log_info "Branch: $DEV_BRANCH"
    log_info "Projeto: $PROJECT_DIR"
    log_info "Log: $LOG_FILE"
    
    # Verificar lock
    check_lock
    
    # Mudar para diretório do projeto
    cd "$PROJECT_DIR"
    
    # Verificar se é repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Não é um repositório Git"
        send_notification "❌ ERRO" "Não é um repositório Git"
        exit 1
    fi
    
    # Verificar se branch existe
    if ! git show-ref --verify --quiet "refs/heads/$DEV_BRANCH"; then
        log_error "Branch $DEV_BRANCH não existe"
        send_notification "❌ ERRO" "Branch $DEV_BRANCH não existe"
        exit 1
    fi
    
    # Mudar para branch dev
    if git checkout "$DEV_BRANCH" >> "$LOG_FILE" 2>&1; then
        log_info "Mudou para branch $DEV_BRANCH"
    else
        log_error "Falha ao mudar para branch $DEV_BRANCH"
        send_notification "❌ ERRO" "Falha ao mudar para branch $DEV_BRANCH"
        exit 1
    fi
    
    # Verificar se há mudanças
    if ! has_changes; then
        log_info "Nenhuma mudança detectada, pulando deploy"
        send_notification "ℹ️ INFO" "Nenhuma mudança detectada"
        exit 0
    fi
    
    log_info "Mudanças detectadas, prosseguindo com deploy"
    
    # Pull latest changes
    if git pull origin "$DEV_BRANCH" >> "$LOG_FILE" 2>&1; then
        log_success "Código atualizado"
    else
        log_error "Falha ao atualizar código"
        send_notification "❌ ERRO" "Falha ao atualizar código"
        exit 1
    fi
    
    # Executar testes básicos
    if run_basic_tests; then
        log_success "Testes básicos passaram"
    else
        log_error "Testes básicos falharam"
        send_notification "❌ ERRO" "Testes básicos falharam"
        exit 1
    fi
    
    # Executar deploy
    if run_deploy; then
        log_success "Deploy concluído com sucesso"
        send_notification "✅ SUCESSO" "Deploy dev realizado com sucesso"
        
        # Mostrar URLs
        log_info "URLs:"
        log_info "  Preview: https://clinione-git-dev-agenciaspace.vercel.app"
        log_info "  GitHub: https://github.com/agenciaspace/clinione/tree/$DEV_BRANCH"
    else
        log_error "Deploy falhou"
        send_notification "❌ ERRO" "Deploy falhou"
        exit 1
    fi
    
    log_success "=== DEPLOY DEV AUTOMÁTICO CONCLUÍDO ==="
}

# Verificar argumentos
case "${1:-}" in
    --help|-h)
        echo "🤖 Cron Deploy Dev - Clini.One"
        echo ""
        echo "Deploy automático diário para desenvolvimento"
        echo ""
        echo "Uso:"
        echo "  $0                    - Executar deploy automático"
        echo "  $0 --help           - Esta ajuda"
        echo "  $0 --force          - Forçar deploy mesmo sem mudanças"
        echo "  $0 --test           - Apenas testar, não fazer deploy"
        echo ""
        echo "Variáveis de ambiente:"
        echo "  WEBHOOK_URL         - URL para notificações (opcional)"
        echo "  OPENAI_API_KEY      - Chave OpenAI para AI commits (opcional)"
        echo ""
        echo "Logs em: $LOG_DIR"
        exit 0
        ;;
    --force)
        # Sobrescrever função has_changes para sempre retornar true
        has_changes() { return 0; }
        ;;
    --test)
        # Modo teste - apenas verificar sem fazer deploy
        run_deploy() {
            log_info "MODO TESTE: Deploy seria executado aqui"
            return 0
        }
        ;;
    "")
        # Modo padrão
        ;;
    *)
        echo "Argumento inválido: $1"
        echo "Use --help para ajuda"
        exit 1
        ;;
esac

# Executar apenas se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 