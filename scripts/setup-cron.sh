#!/bin/bash

# Setup Cron - Clini.One
# Configura cron jobs para deploy automático

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🕐 SETUP CRON JOBS                           ║"
    echo "║            Deploy Automático - Clini.One                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se cron está disponível
check_cron() {
    print_step "Verificando disponibilidade do cron..."
    
    if ! command -v crontab >/dev/null 2>&1; then
        print_error "crontab não está disponível"
        echo -e "${YELLOW}💡 No macOS, instale com:${NC}"
        echo -e "   ${BLUE}sudo launchctl load -w /System/Library/LaunchDaemons/com.vix.cron.plist${NC}"
        exit 1
    fi
    
    print_success "Cron disponível"
}

# Criar wrapper scripts com ambiente completo
create_wrapper_scripts() {
    print_step "Criando scripts wrapper..."
    
    # Wrapper para deploy dev
    cat > "$SCRIPT_DIR/cron-wrapper-dev.sh" << EOF
#!/bin/bash

# Wrapper para cron deploy dev
# Configura ambiente completo antes de executar

# Configurar PATH completo
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:\$PATH"

# Configurar Node.js (se usando nvm)
if [[ -f "\$HOME/.nvm/nvm.sh" ]]; then
    source "\$HOME/.nvm/nvm.sh"
    nvm use node 2>/dev/null || true
fi

# Configurar variáveis de ambiente
if [[ -f "\$HOME/.zshrc" ]]; then
    source "\$HOME/.zshrc" 2>/dev/null || true
fi

if [[ -f "\$HOME/.bashrc" ]]; then
    source "\$HOME/.bashrc" 2>/dev/null || true
fi

# Executar o script real
cd "$PROJECT_DIR"
exec bash "$SCRIPT_DIR/cron-deploy-dev.sh" "\$@"
EOF

    # Wrapper para deploy prod
    cat > "$SCRIPT_DIR/cron-wrapper-prod.sh" << EOF
#!/bin/bash

# Wrapper para cron deploy prod
# Configura ambiente completo antes de executar

# Configurar PATH completo
export PATH="/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:\$PATH"

# Configurar Node.js (se usando nvm)
if [[ -f "\$HOME/.nvm/nvm.sh" ]]; then
    source "\$HOME/.nvm/nvm.sh"
    nvm use node 2>/dev/null || true
fi

# Configurar variáveis de ambiente
if [[ -f "\$HOME/.zshrc" ]]; then
    source "\$HOME/.zshrc" 2>/dev/null || true
fi

if [[ -f "\$HOME/.bashrc" ]]; then
    source "\$HOME/.bashrc" 2>/dev/null || true
fi

# Executar o script real
cd "$PROJECT_DIR"
exec bash "$SCRIPT_DIR/cron-deploy-prod.sh" "\$@"
EOF

    # Tornar executáveis
    chmod +x "$SCRIPT_DIR/cron-wrapper-dev.sh"
    chmod +x "$SCRIPT_DIR/cron-wrapper-prod.sh"
    
    print_success "Scripts wrapper criados"
}

# Configurar cron jobs
setup_cron_jobs() {
    print_step "Configurando cron jobs..."
    
    # Backup do crontab atual
    local backup_file="/tmp/crontab-backup-$(date +%Y%m%d-%H%M%S)"
    crontab -l > "$backup_file" 2>/dev/null || echo "# Crontab vazio" > "$backup_file"
    print_success "Backup do crontab: $backup_file"
    
    # Criar novo crontab
    local temp_cron="/tmp/clinione-crontab"
    
    # Copiar crontab existente (removendo linhas do Clini.One)
    crontab -l 2>/dev/null | grep -v "# Clini.One Deploy" > "$temp_cron" || echo "# Crontab" > "$temp_cron"
    
    # Adicionar novos jobs
    cat >> "$temp_cron" << EOF

# Clini.One Deploy - Deploy automático
# Deploy dev diário às 09:00 (dias úteis)
0 9 * * 1-5 $SCRIPT_DIR/cron-wrapper-dev.sh >/dev/null 2>&1

# Deploy prod verificação diária às 18:00 (dias úteis)
0 18 * * 1-5 $SCRIPT_DIR/cron-wrapper-prod.sh >/dev/null 2>&1

# Limpeza de logs semanalmente (domingo às 02:00)
0 2 * * 0 find $PROJECT_DIR/logs -name "*.log" -mtime +7 -delete >/dev/null 2>&1
EOF
    
    # Aplicar novo crontab
    crontab "$temp_cron"
    rm "$temp_cron"
    
    print_success "Cron jobs configurados"
}

# Mostrar configuração atual
show_cron_config() {
    print_step "Configuração atual do cron:"
    echo ""
    
    echo -e "${YELLOW}📋 Jobs configurados:${NC}"
    crontab -l | grep -A 10 "# Clini.One Deploy" || echo "Nenhum job encontrado"
    
    echo ""
    echo -e "${YELLOW}🕐 Horários:${NC}"
    echo -e "   📅 Deploy Dev: Dias úteis às 09:00"
    echo -e "   🚀 Deploy Prod: Dias úteis às 18:00 (com confirmação)"
    echo -e "   🧹 Limpeza: Domingos às 02:00"
    
    echo ""
    echo -e "${YELLOW}📁 Arquivos:${NC}"
    echo -e "   🔧 Dev: $SCRIPT_DIR/cron-deploy-dev.sh"
    echo -e "   🚀 Prod: $SCRIPT_DIR/cron-deploy-prod.sh"
    echo -e "   📦 Wrapper Dev: $SCRIPT_DIR/cron-wrapper-dev.sh"
    echo -e "   📦 Wrapper Prod: $SCRIPT_DIR/cron-wrapper-prod.sh"
    echo -e "   📋 Logs: $PROJECT_DIR/logs/"
}

# Configurar notificações
setup_notifications() {
    print_step "Configurando notificações..."
    
    echo -e "${YELLOW}💬 Tipos de notificação disponíveis:${NC}"
    echo -e "   1. Webhook (Slack/Discord/Teams)"
    echo -e "   2. Email"
    echo -e "   3. Arquivo local"
    echo ""
    
    read -p "$(echo -e ${CYAN}Configurar webhook? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "$(echo -e ${YELLOW}URL do webhook: ${NC})" webhook_url
        
        if [[ -n "$webhook_url" ]]; then
            # Adicionar ao shell config
            local shell_config
            if [[ "$SHELL" == *"zsh"* ]]; then
                shell_config="$HOME/.zshrc"
            else
                shell_config="$HOME/.bashrc"
            fi
            
            # Remover configuração anterior
            sed -i.bak '/export WEBHOOK_URL=/d' "$shell_config" 2>/dev/null || true
            
            # Adicionar nova configuração
            echo "export WEBHOOK_URL=\"$webhook_url\"" >> "$shell_config"
            
            print_success "Webhook configurado"
        fi
    fi
    
    read -p "$(echo -e ${CYAN}Configurar email? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "$(echo -e ${YELLOW}Email para notificações: ${NC})" email_to
        
        if [[ -n "$email_to" ]]; then
            local shell_config
            if [[ "$SHELL" == *"zsh"* ]]; then
                shell_config="$HOME/.zshrc"
            else
                shell_config="$HOME/.bashrc"
            fi
            
            sed -i.bak '/export EMAIL_TO=/d' "$shell_config" 2>/dev/null || true
            echo "export EMAIL_TO=\"$email_to\"" >> "$shell_config"
            
            print_success "Email configurado"
        fi
    fi
}

# Testar configuração
test_cron_setup() {
    print_step "Testando configuração..."
    
    # Testar script de dev
    echo -e "${BLUE}🧪 Testando deploy dev...${NC}"
    if bash "$SCRIPT_DIR/cron-deploy-dev.sh" --test; then
        print_success "Deploy dev OK"
    else
        print_warning "Deploy dev com problemas"
    fi
    
    # Testar script de prod
    echo -e "${BLUE}🧪 Testando deploy prod...${NC}"
    if bash "$SCRIPT_DIR/cron-deploy-prod.sh" --test; then
        print_success "Deploy prod OK"
    else
        print_warning "Deploy prod com problemas"
    fi
    
    # Verificar logs
    mkdir -p "$PROJECT_DIR/logs"
    touch "$PROJECT_DIR/logs/test-$(date +%Y%m%d).log"
    print_success "Diretório de logs OK"
}

# Remover cron jobs
remove_cron_jobs() {
    print_step "Removendo cron jobs do Clini.One..."
    
    local temp_cron="/tmp/clinione-crontab-remove"
    crontab -l 2>/dev/null | grep -v "# Clini.One Deploy" | grep -v "cron-wrapper-dev.sh" | grep -v "cron-wrapper-prod.sh" > "$temp_cron" || echo "# Crontab limpo" > "$temp_cron"
    
    crontab "$temp_cron"
    rm "$temp_cron" 2>/dev/null || true
    
    # Remover scripts wrapper
    rm -f "$SCRIPT_DIR/cron-wrapper-dev.sh"
    rm -f "$SCRIPT_DIR/cron-wrapper-prod.sh"
    
    print_success "Cron jobs removidos"
}

# Mostrar logs
show_logs() {
    print_step "Logs recentes:"
    echo ""
    
    local log_dir="$PROJECT_DIR/logs"
    
    if [[ -d "$log_dir" ]]; then
        echo -e "${YELLOW}📋 Arquivos de log:${NC}"
        ls -la "$log_dir"/*.log 2>/dev/null | tail -10 || echo "Nenhum log encontrado"
        
        echo ""
        echo -e "${YELLOW}📄 Último log de dev:${NC}"
        find "$log_dir" -name "cron-deploy-dev-*.log" -type f -exec ls -t {} + | head -1 | xargs tail -20 2>/dev/null || echo "Nenhum log de dev"
        
        echo ""
        echo -e "${YELLOW}📄 Último log de prod:${NC}"
        find "$log_dir" -name "cron-deploy-prod-*.log" -type f -exec ls -t {} + | head -1 | xargs tail -20 2>/dev/null || echo "Nenhum log de prod"
    else
        echo "Diretório de logs não existe"
    fi
}

# Ajuda
show_help() {
    echo -e "${CYAN}🕐 Setup Cron - Clini.One${NC}"
    echo ""
    echo -e "${YELLOW}Uso:${NC}"
    echo -e "   ${BLUE}$0${NC}                    - Configurar cron jobs"
    echo -e "   ${BLUE}$0 --help${NC}           - Esta ajuda"
    echo -e "   ${BLUE}$0 --remove${NC}         - Remover cron jobs"
    echo -e "   ${BLUE}$0 --show${NC}           - Mostrar configuração"
    echo -e "   ${BLUE}$0 --test${NC}           - Testar configuração"
    echo -e "   ${BLUE}$0 --logs${NC}           - Mostrar logs"
    echo ""
    echo -e "${YELLOW}Horários padrão:${NC}"
    echo -e "   📅 Deploy Dev: Dias úteis às 09:00"
    echo -e "   🚀 Deploy Prod: Dias úteis às 18:00"
    echo -e "   🧹 Limpeza: Domingos às 02:00"
    echo ""
    echo -e "${YELLOW}Comandos manuais:${NC}"
    echo -e "   ${BLUE}./scripts/cron-deploy-dev.sh${NC}     - Deploy dev manual"
    echo -e "   ${BLUE}./scripts/cron-deploy-prod.sh${NC}    - Deploy prod manual"
    echo -e "   ${BLUE}./scripts/cron-deploy-prod.sh --confirm${NC} - Confirmar deploy"
    echo -e "   ${BLUE}./scripts/cron-deploy-prod.sh --cancel${NC}  - Cancelar deploy"
}

# Função principal
main() {
    case "${1:-}" in
        --help|-h)
            show_help
            exit 0
            ;;
        --remove)
            print_header
            remove_cron_jobs
            print_success "Cron jobs removidos com sucesso"
            exit 0
            ;;
        --show)
            print_header
            show_cron_config
            exit 0
            ;;
        --test)
            print_header
            test_cron_setup
            exit 0
            ;;
        --logs)
            print_header
            show_logs
            exit 0
            ;;
        "")
            # Modo padrão - configurar
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    print_header
    
    echo -e "${YELLOW}🤖 Este script vai configurar:${NC}"
    echo -e "   📅 Deploy automático diário em dev (09:00)"
    echo -e "   🚀 Verificação de deploy prod (18:00)"
    echo -e "   🧹 Limpeza automática de logs"
    echo -e "   💬 Notificações (opcional)"
    echo ""
    
    read -p "$(echo -e ${CYAN}Continuar com a configuração? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}👋 Configuração cancelada${NC}"
        exit 0
    fi
    
    check_cron
    create_wrapper_scripts
    setup_cron_jobs
    setup_notifications
    test_cron_setup
    
    echo ""
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🎉 CRON CONFIGURADO!                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    show_cron_config
    
    echo ""
    echo -e "${CYAN}🚀 Próximos passos:${NC}"
    echo -e "   1. Configure OpenAI (opcional): ${BLUE}./scripts/setup-openai.sh${NC}"
    echo -e "   2. Teste manualmente: ${BLUE}./scripts/cron-deploy-dev.sh --test${NC}"
    echo -e "   3. Monitore logs: ${BLUE}./scripts/setup-cron.sh --logs${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas:${NC}"
    echo -e "   • Logs são salvos em: ${BLUE}$PROJECT_DIR/logs/${NC}"
    echo -e "   • Deploy prod requer confirmação manual"
    echo -e "   • Use webhooks para notificações em tempo real"
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 