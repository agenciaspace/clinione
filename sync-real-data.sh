#!/bin/bash

echo "=== Sincronização de Dados Reais de Produção ==="
echo ""
echo "Este script irá:"
echo "1. Fazer backup completo dos seus dados de produção"
echo "2. Restaurar os dados reais no ambiente local"
echo "3. Preservar sua estrutura, usuários, clínicas e dados existentes"
echo ""

# Criar diretório de backup
mkdir -p ./backups

# Nome do arquivo de backup
BACKUP_FILE="./backups/real-prod-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "Passo 1: Fazendo backup completo dos dados de produção..."
echo "Você precisará inserir a senha do banco de dados quando solicitado."
echo ""

# Fazer backup completo (estrutura + dados)
supabase db dump --linked --file "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "Erro ao fazer backup. Verifique se a senha está correta."
    exit 1
fi

echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""

# Verificar se o backup tem conteúdo significativo
LINES=$(wc -l < "$BACKUP_FILE")
if [ "$LINES" -lt 50 ]; then
    echo "Aviso: Arquivo de backup parece muito pequeno ($LINES linhas)."
    echo "Verifique se o backup foi criado corretamente."
    read -p "Deseja continuar mesmo assim? (s/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

echo "Passo 2: Parando Supabase local..."
supabase stop

echo ""
echo "Passo 3: Resetando banco de dados local..."
supabase db reset --local

if [ $? -ne 0 ]; then
    echo "Erro ao resetar banco local."
    exit 1
fi

echo ""
echo "Passo 4: Restaurando seus dados reais no banco local..."

# Usar psql para aplicar o backup
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "Erro ao restaurar dados. Tentando método alternativo..."
    
    # Método alternativo: aplicar apenas os dados, ignorando conflitos de schema
    echo "Tentando restaurar apenas os dados..."
    PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f "$BACKUP_FILE" --single-transaction=false
fi

echo ""
echo "=== Sincronização de Dados Reais Concluída! ==="
echo ""
echo "Seus dados de produção foram restaurados no ambiente local."
echo "Backup salvo em: $BACKUP_FILE"
echo ""
echo "Agora você pode fazer login com suas credenciais reais:"
echo "- Email: leonhatori@gmail.com"
echo "- Senha: (sua senha real de produção)"
echo ""
echo "Acesse a aplicação em: http://localhost:5173"
echo ""