#!/bin/bash

echo "🔧 Script para corrigir problemas de Git Push"
echo "=============================================="
echo ""

# Verificar status
echo "📋 Status atual do repositório:"
git status --short
echo ""

echo "📈 Commits a serem enviados:"
git log --oneline origin/clarissa..HEAD
echo ""

echo "🔍 Diagnóstico de conectividade:"
echo "Testando conectividade com GitHub..."

# Testar conectividade
if curl -s --connect-timeout 5 https://github.com >/dev/null; then
    echo "✅ Conectividade com GitHub OK"
else
    echo "❌ Problema de conectividade com GitHub"
    exit 1
fi

echo ""
echo "🔑 Soluções para problemas de autenticação:"
echo ""

echo "OPÇÃO 1: Atualizar token no remote"
echo "-----------------------------------"
echo "Execute o comando abaixo com seu token válido:"
echo "git remote set-url origin https://SEU_TOKEN@github.com/agenciaspace/clinione.git"
echo ""

echo "OPÇÃO 2: Usar GitHub CLI (se instalado)"
echo "---------------------------------------"
echo "gh auth login"
echo "git push origin clarissa"
echo ""

echo "OPÇÃO 3: Push manual via SSH"
echo "----------------------------"
echo "1. Configure sua chave SSH no GitHub"
echo "2. git remote set-url origin git@github.com:agenciaspace/clinione.git"
echo "3. git push origin clarissa"
echo ""

echo "OPÇÃO 4: Aplicar mudanças direto no GitHub (RECOMENDADO)"
echo "--------------------------------------------------------"
echo "Como o push está falhando, aplique as correções manualmente:"
echo ""
echo "1. Acesse: https://github.com/agenciaspace/clinione/edit/clarissa/src/components/appointments/AppointmentFormSimple.tsx"
echo ""
echo "2. MUDANÇA 1 - Linha 33:"
echo "   DE: import { cpfValidationRules, maskCPF } from '@/utils/cpf-validation';"
echo "   PARA: import { cpfValidationRules, maskCPF, validateCPF } from '@/utils/cpf-validation';"
echo ""
echo "3. MUDANÇA 2 - Linhas ~39-45:"
echo "   REMOVA o bloco com require() e substitua por:"
echo "   patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine("
echo "     (cpf) => validateCPF(cpf) === null,"
echo "     { message: 'CPF inválido' }"
echo "   ),"
echo ""
echo "4. Commit: 'fix: corrigir erro ReferenceError require no AppointmentFormSimple'"
echo ""
echo "✅ Após aplicar, a Vercel fará deploy automático!"
echo ""

echo "📊 Commits que precisam ser enviados:"
echo "======================================"
git log --oneline --decorate origin/clarissa..HEAD

echo ""
echo "🎯 Commits importantes:"
echo "2111f8a - Correção do erro require (CRÍTICO)"
echo "8b04df3 - Otimizações de recarregamento"
echo ""