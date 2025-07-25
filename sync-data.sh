#!/bin/bash

echo "=== Sincronização de Dados Produção -> Local ==="
echo ""
echo "Este script irá:"
echo "1. Fazer backup dos dados de produção (você precisará inserir a senha do banco)"
echo "2. Resetar o banco local" 
echo "3. Restaurar os dados de produção no banco local"
echo ""

# Criar diretório de backup
mkdir -p ./backups

# Nome do arquivo de backup
BACKUP_FILE="./backups/prod-backup-$(date +%Y%m%d-%H%M%S).sql"

echo "Passo 1: Fazendo backup dos dados de produção..."
echo "Você precisará inserir a senha do banco de dados quando solicitado."
echo ""

# Fazer backup
npx supabase db dump --linked --data-only --file "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "Erro ao fazer backup. Verifique se a senha está correta."
    exit 1
fi

echo ""
echo "Backup criado: $BACKUP_FILE"
echo ""

# Verificar se o backup tem conteúdo
if [ ! -s "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo de backup está vazio."
    exit 1
fi

echo "Passo 2: Resetando banco de dados local..."
npx supabase db reset --local

if [ $? -ne 0 ]; then
    echo "Erro ao resetar banco local."
    exit 1
fi

echo ""
echo "Passo 3: Restaurando dados no banco local..."

# Restaurar dados usando psql diretamente
PGPASSWORD=postgres psql -h localhost -p 54322 -U postgres -d postgres -f "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "Erro ao restaurar dados."
    exit 1
fi

echo ""
echo "=== Sincronização Concluída! ==="
echo ""
echo "Os dados de produção foram sincronizados com sucesso."
echo "Agora você pode fazer login com suas credenciais de produção."
echo ""