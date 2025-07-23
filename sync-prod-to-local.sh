#!/bin/bash

# Script para sincronizar dados de produção com ambiente local
# ATENÇÃO: Este script irá substituir todos os dados locais!

echo "=== Sincronização de Dados Produção -> Local ==="
echo ""
echo "AVISO: Este processo irá:"
echo "1. Fazer backup dos dados de produção"
echo "2. SUBSTITUIR todos os dados locais pelos dados de produção"
echo ""
read -p "Deseja continuar? (s/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

# Projeto remoto
PROJECT_REF="tfkchwuphjaauyfqptbk"

echo ""
echo "Passo 1: Fazendo backup dos dados de produção..."
echo "Por favor, faça login no Supabase se solicitado:"
echo ""

# Criar diretório de backup se não existir
mkdir -p ./backups

# Nome do arquivo de backup com timestamp
BACKUP_FILE="./backups/prod-backup-$(date +%Y%m%d-%H%M%S).sql"

# Fazer backup dos dados de produção
echo "Executando: npx supabase db dump --project-ref $PROJECT_REF --data-only > $BACKUP_FILE"
npx supabase db dump --project-ref $PROJECT_REF --data-only > "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo "Erro ao fazer backup. Abortando."
    exit 1
fi

echo "Backup salvo em: $BACKUP_FILE"
echo ""

# Verificar se o backup tem conteúdo
if [ ! -s "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo de backup está vazio. Abortando."
    exit 1
fi

echo "Passo 2: Parando o Supabase local..."
npx supabase stop

echo ""
echo "Passo 3: Resetando banco de dados local..."
npx supabase db reset --local

if [ $? -ne 0 ]; then
    echo "Erro ao resetar banco local. Abortando."
    exit 1
fi

echo ""
echo "Passo 4: Restaurando dados de produção no ambiente local..."

# Conectar ao banco local e executar o backup
npx supabase db push "$BACKUP_FILE" --local

if [ $? -ne 0 ]; then
    echo "Erro ao restaurar dados. Tentando método alternativo..."
    
    # Método alternativo usando psql diretamente
    echo "Usando conexão direta com PostgreSQL..."
    psql "postgresql://postgres:postgres@localhost:54322/postgres" < "$BACKUP_FILE"
    
    if [ $? -ne 0 ]; then
        echo "Erro ao restaurar dados. Abortando."
        exit 1
    fi
fi

echo ""
echo "Passo 5: Iniciando Supabase local novamente..."
npx supabase start

echo ""
echo "=== Sincronização Concluída! ==="
echo ""
echo "Os dados de produção foram sincronizados com sucesso."
echo "Backup salvo em: $BACKUP_FILE"
echo ""
echo "Você pode agora fazer login com suas credenciais de produção:"
echo "- Email: leonhatori@gmail.com"
echo "- Senha: (sua senha de produção)"
echo ""