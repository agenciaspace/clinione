#!/bin/bash

echo "🔧 Corrigindo erro de require no AppointmentFormSimple.tsx"

# Arquivo a ser corrigido
FILE="src/components/appointments/AppointmentFormSimple.tsx"

echo "📁 Verificando arquivo: $FILE"

# Backup do arquivo original
cp "$FILE" "$FILE.backup" 2>/dev/null

# Verificar se validateCPF já está no import
if grep -q "validateCPF" "$FILE"; then
    echo "✅ validateCPF já está importado"
else
    echo "➕ Adicionando validateCPF ao import..."
    # Adicionar validateCPF ao import existente
    sed -i '' 's/import { cpfValidationRules, maskCPF }/import { cpfValidationRules, maskCPF, validateCPF }/' "$FILE"
fi

# Verificar se ainda há require no arquivo
if grep -q "require" "$FILE"; then
    echo "🔍 Encontrado require no arquivo. Removendo..."
    
    # Criar arquivo temporário com a correção
    cat > /tmp/fix_cpf_validation.tmp << 'EOF'
  patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
    (cpf) => validateCPF(cpf) === null,
    { message: 'CPF inválido' }
  ),
EOF
    
    # Aplicar a correção (remover linhas com require e substituir)
    sed -i '' '/patient_cpf.*refine/,/},$/c\
  patient_cpf: z.string().min(1, { message: '\''CPF é obrigatório'\'' }).refine(\
    (cpf) => validateCPF(cpf) === null,\
    { message: '\''CPF inválido'\'' }\
  ),' "$FILE"
    
    echo "✅ Require removido e substituído por import direto"
else
    echo "✅ Nenhum require encontrado no arquivo"
fi

# Verificar o resultado
echo ""
echo "📋 Verificação final:"
echo "-------------------"

if grep -q "validateCPF.*from.*cpf-validation" "$FILE"; then
    echo "✅ Import de validateCPF está correto"
fi

if grep -q "require" "$FILE"; then
    echo "❌ AVISO: Ainda há require no arquivo!"
else
    echo "✅ Nenhum require encontrado"
fi

echo ""
echo "🎉 Correção concluída!"
echo ""
echo "Próximos passos:"
echo "1. Execute: npm run build"
echo "2. Execute: git add $FILE"
echo "3. Execute: git commit -m 'fix: corrigir erro ReferenceError require no AppointmentFormSimple'"
echo "4. Execute: git push origin clarissa"