#!/bin/bash

# Script para aplicar correções de login do Supabase
# Execute este script após aplicar as correções no código

set -e

echo "🔧 Aplicando correções de login do Supabase..."
echo ""

# Verificar se estamos no diretório correto
if [[ ! -f "package.json" ]]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o script SQL existe
if [[ ! -f "scripts/fix-login-errors.sql" ]]; then
    echo "❌ Erro: Arquivo scripts/fix-login-errors.sql não encontrado"
    exit 1
fi

echo "📋 Checklist de Correções:"
echo "✅ Políticas RLS corrigidas"
echo "✅ Conversão de ENUM para TEXT"
echo "✅ Tratamento de erros melhorado"
echo "✅ AuthContext atualizado"
echo ""

echo "🎯 Próximas etapas:"
echo ""
echo "1. 📝 Abra o Supabase Dashboard"
echo "   - Acesse: https://app.supabase.com"
echo "   - Vá para seu projeto"
echo ""
echo "2. 🔧 Execute o script SQL"
echo "   - Clique em 'SQL Editor'"
echo "   - Abra o arquivo: scripts/fix-login-errors.sql"
echo "   - Cole o conteúdo e execute"
echo ""
echo "3. ✅ Verifique os resultados"
echo "   - Deve aparecer: 'Script aplicado com sucesso'"
echo "   - Deve mostrar as políticas criadas"
echo ""
echo "4. 🧪 Teste as funcionalidades"
echo "   - Registro de novos usuários"
echo "   - Login de usuários existentes"
echo "   - Criação de clínicas"
echo ""

echo "📁 Arquivos criados/modificados:"
echo "   - scripts/fix-login-errors.sql"
echo "   - supabase/migrations/20250110000001_fix_login_rls_policies.sql"
echo "   - src/contexts/AuthContext.tsx (melhorado)"
echo "   - CORREÇÃO_ERROS_LOGIN.md (documentação)"
echo ""

echo "📞 Se houver problemas:"
echo "   - Verifique o console do browser (F12)"
echo "   - Consulte o arquivo CORREÇÃO_ERROS_LOGIN.md"
echo "   - Execute as queries de verificação da documentação"
echo ""

echo "🚀 Após aplicar as correções, teste:"
echo "   npm run dev"
echo "   # Acesse http://localhost:5173"
echo "   # Teste login e registro"
echo ""

echo "✨ Correções aplicadas com sucesso!"
echo "   Execute o script SQL no Supabase para finalizar." 