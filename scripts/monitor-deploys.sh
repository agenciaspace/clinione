#!/bin/bash

# Monitor Deploys - Clini.One
# Monitor em tempo real dos deploys automáticos

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_DIR/logs"

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

print_header() {
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                📊 MONITOR DE DEPLOYS                        ║"
    echo "║                   Clini.One                                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Mostrar status atual
show_status() {
    echo -e "${BLUE}📊 Status Atual - $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo ""
    
    # Status dos cron jobs
    echo -e "${YELLOW}🕐 Cron Jobs:${NC}"
    if crontab -l 2>/dev/null | grep -q "Clini.One Deploy"; then
        echo -e "   ✅ Configurados"
        crontab -l | grep -A 3 "Clini.One Deploy" | sed 's/^/   /'
    else
        echo -e "   ❌ Não configurados"
    fi
    echo ""
    
    # Status do repositório
    echo -e "${YELLOW}📂 Repositório:${NC}"
    cd "$PROJECT_DIR"
    
    local current_branch=$(git branch --show-current 2>/dev/null || echo "unknown")
    echo -e "   🌿 Branch atual: $current_branch"
    
    if git status --porcelain | grep -q .; then
        echo -e "   ⚠️  Mudanças não commitadas: $(git status --porcelain | wc -l) arquivos"
    else
        echo -e "   ✅ Working tree limpo"
    fi
    
    # Verificar se há mudanças para deploy
    git fetch origin main dev 2>/dev/null || true
    local main_commit=$(git rev-parse origin/main 2>/dev/null || echo "")
    local dev_commit=$(git rev-parse origin/dev 2>/dev/null || echo "")
    
    if [[ "$main_commit" != "$dev_commit" ]]; then
        local commits_ahead=$(git rev-list --count origin/main..origin/dev 2>/dev/null || echo "0")
        echo -e "   🚀 Commits prontos para prod: $commits_ahead"
    else
        echo -e "   ✅ Dev e main sincronizados"
    fi
    echo ""
    
    # Último deploy
    echo -e "${YELLOW}📋 Últimos Deploys:${NC}"
    if [[ -d "$LOG_DIR" ]]; then
        # Deploy dev
        local last_dev_log=$(find "$LOG_DIR" -name "cron-deploy-dev-*.log" -type f -exec ls -t {} + | head -1 2>/dev/null)
        if [[ -n "$last_dev_log" ]]; then
            local dev_date=$(basename "$last_dev_log" | grep -o '[0-9]\{8\}' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1/')
            echo -e "   📅 Dev: $dev_date"
            if grep -q "SUCCESS.*Deploy concluído com sucesso" "$last_dev_log" 2>/dev/null; then
                echo -e "   ✅ Status: Sucesso"
            elif grep -q "ERROR" "$last_dev_log" 2>/dev/null; then
                echo -e "   ❌ Status: Erro"
            else
                echo -e "   ⏳ Status: Em andamento"
            fi
        else
            echo -e "   📅 Dev: Nenhum deploy encontrado"
        fi
        
        # Deploy prod
        local last_prod_log=$(find "$LOG_DIR" -name "cron-deploy-prod-*.log" -type f -exec ls -t {} + | head -1 2>/dev/null)
        if [[ -n "$last_prod_log" ]]; then
            local prod_date=$(basename "$last_prod_log" | grep -o '[0-9]\{8\}' | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1/')
            echo -e "   🚀 Prod: $prod_date"
            if grep -q "SUCCESS.*Deploy de produção realizado com sucesso" "$last_prod_log" 2>/dev/null; then
                echo -e "   ✅ Status: Sucesso"
            elif grep -q "ERROR" "$last_prod_log" 2>/dev/null; then
                echo -e "   ❌ Status: Erro"
            elif grep -q "aguardando confirmação" "$last_prod_log" 2>/dev/null; then
                echo -e "   ⏳ Status: Aguardando confirmação"
            else
                echo -e "   ⏳ Status: Em andamento"
            fi
        else
            echo -e "   🚀 Prod: Nenhum deploy encontrado"
        fi
    else
        echo -e "   ❌ Diretório de logs não encontrado"
    fi
    echo ""
    
    # URLs importantes
    echo -e "${YELLOW}🌐 URLs:${NC}"
    echo -e "   🏥 Produção: https://clini.one"
    echo -e "   🔗 GitHub: https://github.com/agenciaspace/clinione"
    echo -e "   ▲ Vercel: https://vercel.com/dashboard"
    echo ""
}

# Monitorar logs em tempo real
tail_logs() {
    local log_type="$1"
    
    if [[ ! -d "$LOG_DIR" ]]; then
        echo -e "${RED}❌ Diretório de logs não encontrado${NC}"
        return 1
    fi
    
    case "$log_type" in
        "dev")
            local pattern="cron-deploy-dev-*.log"
            echo -e "${BLUE}📅 Monitorando logs de deploy dev...${NC}"
            ;;
        "prod")
            local pattern="cron-deploy-prod-*.log"
            echo -e "${BLUE}🚀 Monitorando logs de deploy prod...${NC}"
            ;;
        "all")
            local pattern="cron-deploy-*.log"
            echo -e "${BLUE}📋 Monitorando todos os logs...${NC}"
            ;;
        *)
            echo -e "${RED}❌ Tipo de log inválido: $log_type${NC}"
            return 1
            ;;
    esac
    
    echo -e "${YELLOW}Pressione Ctrl+C para sair${NC}"
    echo ""
    
    # Encontrar arquivos de log mais recentes
    local log_files=$(find "$LOG_DIR" -name "$pattern" -type f -exec ls -t {} + | head -5 2>/dev/null)
    
    if [[ -z "$log_files" ]]; then
        echo -e "${YELLOW}⏳ Aguardando logs...${NC}"
        # Aguardar novos arquivos
        while true; do
            log_files=$(find "$LOG_DIR" -name "$pattern" -type f -exec ls -t {} + | head -1 2>/dev/null)
            if [[ -n "$log_files" ]]; then
                break
            fi
            sleep 5
        done
    fi
    
    # Fazer tail dos logs
    tail -f $log_files
}

# Mostrar estatísticas
show_stats() {
    echo -e "${BLUE}📊 Estatísticas de Deploy${NC}"
    echo ""
    
    if [[ ! -d "$LOG_DIR" ]]; then
        echo -e "${RED}❌ Diretório de logs não encontrado${NC}"
        return 1
    fi
    
    # Contar logs
    local dev_logs=$(find "$LOG_DIR" -name "cron-deploy-dev-*.log" -type f | wc -l)
    local prod_logs=$(find "$LOG_DIR" -name "cron-deploy-prod-*.log" -type f | wc -l)
    
    echo -e "${YELLOW}📈 Totais:${NC}"
    echo -e "   📅 Deploys dev: $dev_logs"
    echo -e "   🚀 Deploys prod: $prod_logs"
    echo ""
    
    # Sucessos e falhas (últimos 30 dias)
    local dev_success=0
    local dev_errors=0
    local prod_success=0
    local prod_errors=0
    
    # Contar sucessos/erros em logs recentes
    for log_file in $(find "$LOG_DIR" -name "cron-deploy-dev-*.log" -type f -mtime -30 2>/dev/null); do
        if grep -q "SUCCESS.*Deploy concluído com sucesso" "$log_file" 2>/dev/null; then
            ((dev_success++))
        elif grep -q "ERROR" "$log_file" 2>/dev/null; then
            ((dev_errors++))
        fi
    done
    
    for log_file in $(find "$LOG_DIR" -name "cron-deploy-prod-*.log" -type f -mtime -30 2>/dev/null); do
        if grep -q "SUCCESS.*Deploy de produção realizado com sucesso" "$log_file" 2>/dev/null; then
            ((prod_success++))
        elif grep -q "ERROR" "$log_file" 2>/dev/null; then
            ((prod_errors++))
        fi
    done
    
    echo -e "${YELLOW}📊 Últimos 30 dias:${NC}"
    echo -e "   📅 Dev - Sucessos: $dev_success, Erros: $dev_errors"
    echo -e "   🚀 Prod - Sucessos: $prod_success, Erros: $prod_errors"
    echo ""
    
    # Taxa de sucesso
    if [[ $((dev_success + dev_errors)) -gt 0 ]]; then
        local dev_rate=$((dev_success * 100 / (dev_success + dev_errors)))
        echo -e "   📈 Taxa de sucesso dev: $dev_rate%"
    fi
    
    if [[ $((prod_success + prod_errors)) -gt 0 ]]; then
        local prod_rate=$((prod_success * 100 / (prod_success + prod_errors)))
        echo -e "   📈 Taxa de sucesso prod: $prod_rate%"
    fi
    echo ""
}

# Verificar confirmações pendentes
check_pending() {
    echo -e "${BLUE}⏳ Verificando confirmações pendentes...${NC}"
    echo ""
    
    local confirmation_file="/tmp/clinione-prod-confirmation.txt"
    
    if [[ -f "$confirmation_file" ]]; then
        echo -e "${YELLOW}🚨 CONFIRMAÇÃO PENDENTE:${NC}"
        echo ""
        cat "$confirmation_file"
        echo ""
        echo -e "${CYAN}Comandos:${NC}"
        echo -e "   ✅ Confirmar: ${BLUE}./scripts/cron-deploy-prod.sh --confirm${NC}"
        echo -e "   ❌ Cancelar: ${BLUE}./scripts/cron-deploy-prod.sh --cancel${NC}"
    else
        echo -e "${GREEN}✅ Nenhuma confirmação pendente${NC}"
    fi
    echo ""
}

# Dashboard interativo
interactive_dashboard() {
    while true; do
        print_header
        show_status
        check_pending
        
        echo -e "${CYAN}Opções:${NC}"
        echo -e "   ${BLUE}1.${NC} Atualizar status"
        echo -e "   ${BLUE}2.${NC} Ver logs dev"
        echo -e "   ${BLUE}3.${NC} Ver logs prod"
        echo -e "   ${BLUE}4.${NC} Ver todos os logs"
        echo -e "   ${BLUE}5.${NC} Estatísticas"
        echo -e "   ${BLUE}6.${NC} Deploy manual dev"
        echo -e "   ${BLUE}7.${NC} Deploy manual prod"
        echo -e "   ${BLUE}8.${NC} Confirmar deploy prod"
        echo -e "   ${BLUE}9.${NC} Cancelar deploy prod"
        echo -e "   ${BLUE}q.${NC} Sair"
        echo ""
        
        read -p "$(echo -e ${YELLOW}Escolha uma opção: ${NC})" -n 1 -r
        echo
        echo ""
        
        case $REPLY in
            1)
                continue  # Atualiza automaticamente
                ;;
            2)
                tail_logs "dev"
                ;;
            3)
                tail_logs "prod"
                ;;
            4)
                tail_logs "all"
                ;;
            5)
                show_stats
                read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
                ;;
            6)
                echo -e "${BLUE}🚀 Executando deploy dev...${NC}"
                bash "$SCRIPT_DIR/cron-deploy-dev.sh" --force
                read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
                ;;
            7)
                echo -e "${BLUE}🚀 Executando deploy prod...${NC}"
                bash "$SCRIPT_DIR/cron-deploy-prod.sh" --force
                read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
                ;;
            8)
                bash "$SCRIPT_DIR/cron-deploy-prod.sh" --confirm
                read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
                ;;
            9)
                bash "$SCRIPT_DIR/cron-deploy-prod.sh" --cancel
                read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
                ;;
            q|Q)
                echo -e "${YELLOW}👋 Saindo...${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Opção inválida${NC}"
                sleep 1
                ;;
        esac
    done
}

# Ajuda
show_help() {
    echo -e "${CYAN}📊 Monitor de Deploys - Clini.One${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "   ${BLUE}$0${NC}                    - Dashboard interativo"
    echo -e "   ${BLUE}$0 --status${NC}         - Mostrar status atual"
    echo -e "   ${BLUE}$0 --logs dev${NC}       - Monitorar logs dev"
    echo -e "   ${BLUE}$0 --logs prod${NC}      - Monitorar logs prod"
    echo -e "   ${BLUE}$0 --logs all${NC}       - Monitorar todos os logs"
    echo -e "   ${BLUE}$0 --stats${NC}          - Mostrar estatísticas"
    echo -e "   ${BLUE}$0 --pending${NC}        - Verificar confirmações pendentes"
    echo -e "   ${BLUE}$0 --help${NC}           - Esta ajuda"
    echo ""
    echo -e "${YELLOW}Recursos:${NC}"
    echo -e "   • Dashboard em tempo real"
    echo -e "   • Monitoramento de logs"
    echo -e "   • Estatísticas de deploy"
    echo -e "   • Controle de confirmações"
    echo -e "   • Deploy manual"
}

# Função principal
main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --status)
            print_header
            show_status
            exit 0
            ;;
        --logs)
            print_header
            tail_logs "${2:-all}"
            exit 0
            ;;
        --stats)
            print_header
            show_stats
            exit 0
            ;;
        --pending)
            print_header
            check_pending
            exit 0
            ;;
        "")
            # Dashboard interativo
            interactive_dashboard
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 