#!/bin/bash

# Demo AI Commit - Clini.One
# Demonstração interativa do sistema de commits com IA

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
    clear
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                🤖 DEMO AI COMMIT                            ║"
    echo "║         Demonstração de Commits Inteligentes                ║"
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

wait_for_user() {
    echo ""
    read -p "$(echo -e ${CYAN}Pressione Enter para continuar...${NC})"
    echo ""
}

demo_setup() {
    print_step "Configurando demonstração..."
    
    # Verificar se está em um repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Não está em um repositório Git"
        exit 1
    fi
    
    # Verificar se o script AI commit existe
    if [[ ! -f "scripts/ai-commit.sh" ]]; then
        print_error "Script ai-commit.sh não encontrado"
        exit 1
    fi
    
    # Tornar executável
    chmod +x scripts/ai-commit.sh
    
    print_success "Configuração concluída"
    wait_for_user
}

demo_check_dependencies() {
    print_step "Verificando dependências..."
    
    # Verificar jq
    if ! command -v jq &> /dev/null; then
        print_error "jq não está instalado"
        echo -e "${YELLOW}💡 Instale com: brew install jq${NC}"
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_error "curl não está instalado"
        exit 1
    fi
    
    print_success "Todas as dependências estão instaladas"
    wait_for_user
}

demo_openai_config() {
    print_step "Verificando configuração da OpenAI..."
    
    if [[ -z "$OPENAI_API_KEY" ]]; then
        print_warning "OpenAI API Key não configurada"
        echo ""
        echo -e "${YELLOW}📝 Para usar AI commits, você precisa:${NC}"
        echo -e "   1. Criar conta na OpenAI (https://platform.openai.com)"
        echo -e "   2. Gerar uma API key"
        echo -e "   3. Executar: ${BLUE}./scripts/setup-openai.sh${NC}"
        echo ""
        echo -e "${CYAN}💡 Por enquanto, vamos simular o funcionamento...${NC}"
        DEMO_MODE="simulation"
    else
        print_success "OpenAI API Key configurada"
        echo -e "${GREEN}🔑 Chave: ${OPENAI_API_KEY:0:20}...${NC}"
        DEMO_MODE="real"
    fi
    
    wait_for_user
}

create_demo_changes() {
    print_step "Criando mudanças de exemplo..."
    
    # Criar arquivo de exemplo
    cat > demo-feature.js << 'EOF'
// Nova funcionalidade: Sistema de notificações
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.observers = [];
    }
    
    // Adicionar nova notificação
    addNotification(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: new Date().toISOString()
        };
        
        this.notifications.push(notification);
        this.notifyObservers(notification);
        
        return notification;
    }
    
    // Remover notificação
    removeNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index > -1) {
            const removed = this.notifications.splice(index, 1)[0];
            this.notifyObservers({ type: 'removed', notification: removed });
            return removed;
        }
        return null;
    }
    
    // Adicionar observador
    addObserver(callback) {
        this.observers.push(callback);
    }
    
    // Notificar observadores
    notifyObservers(data) {
        this.observers.forEach(callback => callback(data));
    }
    
    // Limpar todas as notificações
    clearAll() {
        this.notifications = [];
        this.notifyObservers({ type: 'cleared' });
    }
}

export default NotificationSystem;
EOF

    # Criar arquivo de teste
    cat > demo-feature.test.js << 'EOF'
import NotificationSystem from './demo-feature.js';

describe('NotificationSystem', () => {
    let notificationSystem;
    
    beforeEach(() => {
        notificationSystem = new NotificationSystem();
    });
    
    test('should add notification', () => {
        const notification = notificationSystem.addNotification('Test message');
        expect(notification.message).toBe('Test message');
        expect(notification.type).toBe('info');
    });
    
    test('should remove notification', () => {
        const notification = notificationSystem.addNotification('Test');
        const removed = notificationSystem.removeNotification(notification.id);
        expect(removed).toEqual(notification);
    });
    
    test('should clear all notifications', () => {
        notificationSystem.addNotification('Test 1');
        notificationSystem.addNotification('Test 2');
        notificationSystem.clearAll();
        expect(notificationSystem.notifications).toHaveLength(0);
    });
});
EOF

    # Atualizar README
    cat >> README.md << 'EOF'

## 🔔 Sistema de Notificações

Nova funcionalidade implementada para gerenciar notificações da aplicação.

### Recursos
- Adicionar/remover notificações
- Sistema de observadores
- Timestamps automáticos
- Diferentes tipos de notificação

### Uso
```javascript
import NotificationSystem from './demo-feature.js';

const notifications = new NotificationSystem();
notifications.addNotification('Bem-vindo!', 'success');
```
EOF

    print_success "Mudanças criadas:"
    echo -e "   📄 ${BLUE}demo-feature.js${NC} - Nova funcionalidade"
    echo -e "   🧪 ${BLUE}demo-feature.test.js${NC} - Testes unitários"
    echo -e "   📖 ${BLUE}README.md${NC} - Documentação atualizada"
    
    wait_for_user
}

demo_git_status() {
    print_step "Visualizando mudanças no Git..."
    
    echo -e "${YELLOW}📊 Status do repositório:${NC}"
    git status --short
    
    echo ""
    echo -e "${YELLOW}📝 Resumo das mudanças:${NC}"
    git diff --stat
    
    wait_for_user
}

demo_ai_commit_simulation() {
    print_step "Simulando AI commit..."
    
    echo -e "${PURPLE}🤖 Analisando mudanças com IA...${NC}"
    sleep 2
    
    echo -e "${BLUE}📊 Mudanças detectadas:${NC}"
    echo -e "   • Novo arquivo: demo-feature.js"
    echo -e "   • Novo arquivo: demo-feature.test.js"
    echo -e "   • Modificado: README.md"
    echo ""
    
    sleep 1
    
    echo -e "${PURPLE}🧠 IA processando padrões de código...${NC}"
    sleep 2
    
    echo -e "${GREEN}✅ Mensagem gerada pela IA:${NC}"
    echo -e "${CYAN}\"feat(notifications): implementar sistema de notificações com observadores\"${NC}"
    echo ""
    
    echo -e "${YELLOW}📋 Justificativa da IA:${NC}"
    echo -e "   • Tipo: ${BLUE}feat${NC} (nova funcionalidade)"
    echo -e "   • Escopo: ${BLUE}notifications${NC} (sistema de notificações)"
    echo -e "   • Descrição: concisa e clara"
    echo -e "   • Padrão: Conventional Commits ✅"
    
    wait_for_user
}

demo_ai_commit_real() {
    print_step "Executando AI commit real..."
    
    echo -e "${PURPLE}🤖 Chamando OpenAI API...${NC}"
    
    # Executar o script real
    if bash scripts/ai-commit.sh --auto; then
        print_success "AI commit executado com sucesso!"
    else
        print_warning "AI commit falhou, mas isso é normal em demonstrações"
    fi
    
    wait_for_user
}

demo_manual_commit() {
    print_step "Fazendo commit manual para finalizar demo..."
    
    git add .
    git commit -m "feat(demo): adicionar sistema de notificações para demonstração"
    
    print_success "Commit realizado!"
    echo -e "${GREEN}📝 Mensagem: feat(demo): adicionar sistema de notificações para demonstração${NC}"
    
    # Mostrar último commit
    echo ""
    echo -e "${YELLOW}📋 Último commit:${NC}"
    git log -1 --pretty=format:"%h - %s (%an, %ar)" --color=always
    
    wait_for_user
}

demo_cleanup() {
    print_step "Limpando arquivos de demonstração..."
    
    # Remover arquivos criados
    rm -f demo-feature.js demo-feature.test.js
    
    # Reverter README
    git checkout HEAD~1 -- README.md 2>/dev/null || true
    
    # Fazer commit da limpeza
    git add .
    git commit -m "chore: limpar arquivos de demonstração do AI commit" 2>/dev/null || true
    
    print_success "Limpeza concluída"
    wait_for_user
}

show_summary() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   📊 RESUMO DA DEMO                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo -e "${CYAN}🎯 O que foi demonstrado:${NC}"
    echo -e "   ✅ Criação de mudanças de código"
    echo -e "   ✅ Análise automática com IA"
    echo -e "   ✅ Geração de mensagens inteligentes"
    echo -e "   ✅ Padrão Conventional Commits"
    echo -e "   ✅ Fallback para commits manuais"
    echo ""
    
    echo -e "${CYAN}🚀 Próximos passos:${NC}"
    echo -e "   1. Configure OpenAI: ${BLUE}./scripts/setup-openai.sh${NC}"
    echo -e "   2. Teste AI commits: ${BLUE}./scripts/ai-commit.sh${NC}"
    echo -e "   3. Use nos deploys: ${BLUE}./scripts/deploy.sh${NC}"
    echo ""
    
    echo -e "${CYAN}💡 Dicas:${NC}"
    echo -e "   • IA funciona melhor com mudanças pequenas e focadas"
    echo -e "   • Sempre revise as mensagens geradas"
    echo -e "   • Use modo interativo para editar mensagens"
    echo -e "   • Modo automático é ideal para CI/CD"
    echo ""
    
    echo -e "${GREEN}🎉 Demo concluída! Obrigado por testar! 🎉${NC}"
}

main() {
    case "${1:-}" in
        --help|-h)
            echo -e "${CYAN}🤖 Demo AI Commit - Ajuda${NC}"
            echo ""
            echo -e "${YELLOW}Uso:${NC}"
            echo -e "   ${BLUE}./scripts/demo-ai-commit.sh${NC}        - Executar demonstração"
            echo -e "   ${BLUE}./scripts/demo-ai-commit.sh --help${NC} - Esta ajuda"
            echo ""
            echo -e "${YELLOW}O que faz:${NC}"
            echo -e "   • Demonstra o sistema de AI commits"
            echo -e "   • Cria mudanças de exemplo"
            echo -e "   • Mostra como a IA analisa código"
            echo -e "   • Limpa automaticamente após demo"
            exit 0
            ;;
        "")
            # Modo padrão
            ;;
        *)
            echo -e "${RED}❌ Argumento inválido: $1${NC}"
            exit 1
            ;;
    esac
    
    print_header
    
    echo -e "${YELLOW}🎬 Esta demonstração vai:${NC}"
    echo -e "   1. Criar mudanças de código de exemplo"
    echo -e "   2. Mostrar como a IA analisa as mudanças"
    echo -e "   3. Gerar mensagens de commit inteligentes"
    echo -e "   4. Limpar tudo no final"
    echo ""
    
    read -p "$(echo -e ${CYAN}Continuar com a demonstração? [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}👋 Demo cancelada${NC}"
        exit 0
    fi
    
    demo_setup
    demo_check_dependencies
    demo_openai_config
    create_demo_changes
    demo_git_status
    
    if [[ "$DEMO_MODE" == "real" ]]; then
        demo_ai_commit_real
    else
        demo_ai_commit_simulation
    fi
    
    demo_manual_commit
    demo_cleanup
    show_summary
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 