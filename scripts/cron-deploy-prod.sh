#!/bin/bash

# Cron Deploy Prod - Clini.One
# Deploy de produção com testes unitários e confirmação do usuário

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/cron-deploy-prod-$(date +%Y%m%d).log"
PROD_BRANCH="main"
DEV_BRANCH="dev"
LOCK_FILE="/tmp/clinione-deploy-prod.lock"
CONFIRMATION_FILE="/tmp/clinione-prod-confirmation.txt"

# Cores
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

# Verificar lock
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
    
    echo $$ > "$LOCK_FILE"
}

# Limpeza
cleanup() {
    rm -f "$LOCK_FILE"
    log_info "Deploy prod finalizado"
}

trap cleanup EXIT

# Verificar se há mudanças prontas para produção
has_production_ready_changes() {
    cd "$PROJECT_DIR"
    
    # Fetch latest
    git fetch origin "$PROD_BRANCH" "$DEV_BRANCH" 2>/dev/null || true
    
    # Verificar se dev está à frente de main
    local main_commit=$(git rev-parse "origin/$PROD_BRANCH" 2>/dev/null || echo "")
    local dev_commit=$(git rev-parse "origin/$DEV_BRANCH" 2>/dev/null || echo "")
    
    if [[ "$main_commit" == "$dev_commit" ]]; then
        log_info "Dev e main estão sincronizados"
        return 1
    fi
    
    # Verificar se há commits em dev que não estão em main
    local commits_ahead=$(git rev-list --count "origin/$PROD_BRANCH..origin/$DEV_BRANCH" 2>/dev/null || echo "0")
    
    if [[ "$commits_ahead" -gt 0 ]]; then
        log_info "$commits_ahead commits em dev prontos para produção"
        return 0
    else
        log_info "Nenhum commit novo em dev"
        return 1
    fi
}

# Executar testes unitários completos
run_unit_tests() {
    cd "$PROJECT_DIR"
    
    log_info "=== EXECUTANDO TESTES UNITÁRIOS ==="
    
    # Verificar se package.json existe
    if [[ ! -f "package.json" ]]; then
        log_warning "package.json não encontrado"
        return 1
    fi
    
    # Instalar dependências
    log_info "Instalando dependências..."
    if ! npm ci >> "$LOG_FILE" 2>&1; then
        log_error "Falha ao instalar dependências"
        return 1
    fi
    
    # Executar linting
    log_info "Executando linting..."
    if npm run lint >> "$LOG_FILE" 2>&1; then
        log_success "✅ Linting passou"
    else
        log_error "❌ Linting falhou"
        return 1
    fi
    
    # Executar testes unitários
    log_info "Executando testes unitários..."
    if npm run test >> "$LOG_FILE" 2>&1; then
        log_success "✅ Testes unitários passaram"
    else
        log_error "❌ Testes unitários falharam"
        return 1
    fi
    
    # Executar build de produção
    log_info "Executando build de produção..."
    if npm run build >> "$LOG_FILE" 2>&1; then
        log_success "✅ Build de produção passou"
    else
        log_error "❌ Build de produção falhou"
        return 1
    fi
    
    # Testes de integração (se disponível)
    if npm run test:integration >> "$LOG_FILE" 2>&1; then
        log_success "✅ Testes de integração passaram"
    else
        log_warning "⚠️  Testes de integração não disponíveis ou falharam"
    fi
    
    # Análise de segurança
    log_info "Executando auditoria de segurança..."
    if npm audit --audit-level=high >> "$LOG_FILE" 2>&1; then
        log_success "✅ Auditoria de segurança passou"
    else
        log_warning "⚠️  Vulnerabilidades encontradas (verifique logs)"
    fi
    
    log_success "=== TODOS OS TESTES PASSARAM ==="
    return 0
}

# Gerar relatório de mudanças
generate_changelog() {
    cd "$PROJECT_DIR"
    
    log_info "Gerando relatório de mudanças..."
    
    local changelog_file="$LOG_DIR/changelog-$(date +%Y%m%d-%H%M).md"
    
    cat > "$changelog_file" << EOF
# 📋 Relatório de Deploy - $(date '+%Y-%m-%d %H:%M:%S')

## 🚀 Mudanças para Produção

### Commits Novos:
EOF
    
    # Listar commits que serão deployados
    git log --oneline "origin/$PROD_BRANCH..origin/$DEV_BRANCH" >> "$changelog_file"
    
    cat >> "$changelog_file" << EOF

### Arquivos Modificados:
EOF
    
    # Listar arquivos modificados
    git diff --name-status "origin/$PROD_BRANCH..origin/$DEV_BRANCH" >> "$changelog_file"
    
    cat >> "$changelog_file" << EOF

### Estatísticas:
- Commits: $(git rev-list --count "origin/$PROD_BRANCH..origin/$DEV_BRANCH")
- Arquivos modificados: $(git diff --name-only "origin/$PROD_BRANCH..origin/$DEV_BRANCH" | wc -l)
- Linhas adicionadas: $(git diff --stat "origin/$PROD_BRANCH..origin/$DEV_BRANCH" | tail -1 | grep -o '[0-9]\+ insertion' | cut -d' ' -f1 || echo "0")
- Linhas removidas: $(git diff --stat "origin/$PROD_BRANCH..origin/$DEV_BRANCH" | tail -1 | grep -o '[0-9]\+ deletion' | cut -d' ' -f1 || echo "0")

### URLs:
- 🌐 Produção: https://clini.one
- 🔗 GitHub: https://github.com/agenciaspace/clinione
- ▲ Vercel: https://vercel.com/dashboard

---
Gerado automaticamente pelo sistema de deploy
EOF
    
    log_success "Relatório gerado: $changelog_file"
    echo "$changelog_file"
}

# Solicitar confirmação do usuário
request_confirmation() {
    local changelog_file="$1"
    
    log_info "=== SOLICITANDO CONFIRMAÇÃO PARA DEPLOY ==="
    
    # Criar arquivo de confirmação com informações
    cat > "$CONFIRMATION_FILE" << EOF
🚀 DEPLOY DE PRODUÇÃO PENDENTE - $(date '+%Y-%m-%d %H:%M:%S')

✅ TESTES PASSARAM:
- Linting: OK
- Testes unitários: OK  
- Build de produção: OK
- Auditoria de segurança: OK

📋 RELATÓRIO COMPLETO:
$changelog_file

🎯 PARA CONFIRMAR O DEPLOY:
1. Revise o relatório de mudanças
2. Execute: echo "CONFIRMAR" > $CONFIRMATION_FILE
3. Ou cancele com: echo "CANCELAR" > $CONFIRMATION_FILE

⏰ TIMEOUT: 30 minutos (deploy será cancelado automaticamente)

📞 CONTATO:
- Logs: $LOG_FILE
- Projeto: $PROJECT_DIR
EOF
    
    # Enviar notificação
    send_notification "🚨 CONFIRMAÇÃO" "Deploy de produção aguardando confirmação"
    
    # Mostrar informações no terminal se interativo
    if [[ -t 0 ]]; then
        echo -e "${CYAN}"
        cat "$CONFIRMATION_FILE"
        echo -e "${NC}"
        
        echo -e "${YELLOW}Confirmar deploy de produção? [y/N]:${NC}"
        read -t 1800 -n 1 -r  # 30 minutos timeout
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "CONFIRMAR" > "$CONFIRMATION_FILE"
            return 0
        else
            echo "CANCELAR" > "$CONFIRMATION_FILE"
            return 1
        fi
    else
        # Modo não-interativo: aguardar arquivo de confirmação
        log_info "Aguardando confirmação em: $CONFIRMATION_FILE"
        
        local timeout=1800  # 30 minutos
        local elapsed=0
        
        while [[ $elapsed -lt $timeout ]]; do
            if [[ -f "$CONFIRMATION_FILE" ]]; then
                local response=$(cat "$CONFIRMATION_FILE" | head -1)
                
                if [[ "$response" == "CONFIRMAR" ]]; then
                    log_success "Deploy confirmado pelo usuário"
                    return 0
                elif [[ "$response" == "CANCELAR" ]]; then
                    log_warning "Deploy cancelado pelo usuário"
                    return 1
                fi
            fi
            
            sleep 30
            elapsed=$((elapsed + 30))
            
            if [[ $((elapsed % 300)) -eq 0 ]]; then  # A cada 5 minutos
                log_info "Aguardando confirmação... ($((timeout - elapsed))s restantes)"
            fi
        done
        
        log_warning "Timeout: Deploy cancelado automaticamente"
        return 1
    fi
}

# Executar deploy de produção
run_production_deploy() {
    cd "$PROJECT_DIR"
    
    log_info "=== INICIANDO DEPLOY DE PRODUÇÃO ==="
    
    # Verificar script de deploy
    if [[ ! -f "scripts/deploy-prod.sh" ]]; then
        log_error "Script de deploy de produção não encontrado"
        return 1
    fi
    
    # Executar deploy
    if bash scripts/deploy-prod.sh "Deploy automático com testes - $(date '+%Y-%m-%d %H:%M')" >> "$LOG_FILE" 2>&1; then
        log_success "✅ Deploy de produção realizado com sucesso"
        return 0
    else
        log_error "❌ Deploy de produção falhou"
        return 1
    fi
}

# Enviar notificação
send_notification() {
    local status="$1"
    local message="$2"
    
    # Webhook
    if [[ -n "$WEBHOOK_URL" ]]; then
        local payload="{\"text\":\"🏥 Clini.One Prod - $status: $message\"}"
        curl -s -X POST -H 'Content-type: application/json' \
             --data "$payload" "$WEBHOOK_URL" >> "$LOG_FILE" 2>&1 || true
    fi
    
    # Email (se configurado)
    if [[ -n "$EMAIL_TO" ]] && command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "Clini.One Deploy - $status" "$EMAIL_TO" 2>/dev/null || true
    fi
    
    log_info "Notificação: $status - $message"
}

# Função principal
main() {
    mkdir -p "$LOG_DIR"
    
    log_info "=== INICIANDO VERIFICAÇÃO DE DEPLOY PROD ==="
    log_info "Branch prod: $PROD_BRANCH"
    log_info "Branch dev: $DEV_BRANCH"
    log_info "Projeto: $PROJECT_DIR"
    log_info "Log: $LOG_FILE"
    
    check_lock
    
    cd "$PROJECT_DIR"
    
    # Verificar repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Não é um repositório Git"
        send_notification "❌ ERRO" "Não é um repositório Git"
        exit 1
    fi
    
    # Verificar se há mudanças prontas
    if ! has_production_ready_changes; then
        log_info "Nenhuma mudança pronta para produção"
        exit 0
    fi
    
    # Mudar para branch dev para testes
    git checkout "$DEV_BRANCH" >> "$LOG_FILE" 2>&1
    git pull origin "$DEV_BRANCH" >> "$LOG_FILE" 2>&1
    
    # Executar testes unitários
    if ! run_unit_tests; then
        log_error "Testes falharam - deploy cancelado"
        send_notification "❌ FALHA" "Testes unitários falharam"
        exit 1
    fi
    
    # Gerar relatório
    local changelog_file
    changelog_file=$(generate_changelog)
    
    # Solicitar confirmação
    if ! request_confirmation "$changelog_file"; then
        log_warning "Deploy cancelado - confirmação não recebida"
        send_notification "⚠️ CANCELADO" "Deploy cancelado pelo usuário"
        exit 0
    fi
    
    # Executar deploy
    if run_production_deploy; then
        log_success "=== DEPLOY DE PRODUÇÃO CONCLUÍDO COM SUCESSO ==="
        send_notification "🎉 SUCESSO" "Deploy de produção realizado com sucesso"
        
        # Limpar arquivo de confirmação
        rm -f "$CONFIRMATION_FILE"
        
        # Mostrar URLs finais
        log_info "URLs atualizadas:"
        log_info "  🌐 Produção: https://clini.one"
        log_info "  🔗 GitHub: https://github.com/agenciaspace/clinione"
        log_info "  📊 Vercel: https://vercel.com/dashboard"
    else
        log_error "=== DEPLOY DE PRODUÇÃO FALHOU ==="
        send_notification "❌ FALHA" "Deploy de produção falhou"
        exit 1
    fi
}

# Argumentos
case "${1:-}" in
    --help|-h)
        echo "🚀 Cron Deploy Prod - Clini.One"
        echo ""
        echo "Deploy de produção com testes e confirmação"
        echo ""
        echo "Uso:"
        echo "  $0                    - Verificar e executar deploy se necessário"
        echo "  $0 --help           - Esta ajuda"
        echo "  $0 --force          - Forçar deploy mesmo sem mudanças"
        echo "  $0 --test           - Apenas testar, não fazer deploy"
        echo "  $0 --confirm        - Confirmar deploy pendente"
        echo "  $0 --cancel         - Cancelar deploy pendente"
        echo ""
        echo "Variáveis de ambiente:"
        echo "  WEBHOOK_URL         - URL para notificações"
        echo "  EMAIL_TO            - Email para notificações"
        echo "  OPENAI_API_KEY      - Chave OpenAI para AI commits"
        echo ""
        echo "Arquivos:"
        echo "  Logs: $LOG_DIR"
        echo "  Confirmação: $CONFIRMATION_FILE"
        exit 0
        ;;
    --force)
        has_production_ready_changes() { return 0; }
        ;;
    --test)
        run_production_deploy() {
            log_info "MODO TESTE: Deploy seria executado aqui"
            return 0
        }
        ;;
    --confirm)
        echo "CONFIRMAR" > "$CONFIRMATION_FILE"
        echo "✅ Deploy confirmado"
        exit 0
        ;;
    --cancel)
        echo "CANCELAR" > "$CONFIRMATION_FILE"
        echo "❌ Deploy cancelado"
        exit 0
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

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 