# CORREÇÃO MANUAL URGENTE NO GITHUB

## 🚨 SITUAÇÃO ATUAL
- SSH com problemas: `Permission denied (publickey)`
- GitHub CLI com problemas: `HTTP 503` 
- Build da Vercel falhando com erro `Z_DATA_ERROR`
- Correções commitadas localmente mas não enviadas

## 🎯 SOLUÇÃO IMEDIATA: Editar Direto no GitHub

### 1. CORRIGIR package.json
**URL:** https://github.com/agenciaspace/clinione/edit/clarissa/package.json

**Procure pela linha 85:**
```json
"supabase": "^2.26.9",
```

**REMOVA a linha inteira** (incluindo a vírgula)

### 2. CORRIGIR AppointmentFormSimple.tsx  
**URL:** https://github.com/agenciaspace/clinione/edit/clarissa/src/components/appointments/AppointmentFormSimple.tsx

**Procure pelas linhas 39-43:**
```typescript
patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
  (cpf) => validateCPF(cpf) === null,
  { message: 'CPF inválido' }
),
```

**Substitua por:**
```typescript
patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
  (cpf) => {
    // Validação direta sem require - corrigido para build 7CTD6TwpB
    return validateCPF(cpf) === null;
  },
  { message: 'CPF inválido' }
),
```

### 3. COMMIT
**Mensagem sugerida:**
```
fix: remove supabase CLI and fix require error

- Remove supabase CLI package causing Vercel build Z_DATA_ERROR
- Fix CPF validation without require() statement
- Ensure build passes on Vercel
```

## ✅ RESULTADO ESPERADO
1. **Build da Vercel passa** sem erro Z_DATA_ERROR
2. **Erro require desaparece** do console
3. **Formulário funciona** corretamente

## 📋 COMMITS LOCAIS QUE SERÃO REPLICADOS
```
40d726e - fix: remove supabase CLI from dependencies to fix Vercel build
4ef492f - fix: force rebuild - explicit CPF validation without require
```

**⚡ URGENTE: Aplique essas mudanças no GitHub agora para resolver o problema!**