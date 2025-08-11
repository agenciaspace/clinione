# CORREÇÃO MANUAL URGENTE - Build 7K4FN6EVd

## 🚨 PROBLEMA
O erro `ReferenceError: require is not defined` persiste na Vercel porque o código no GitHub ainda tem a versão antiga.

## 💡 SOLUÇÃO IMEDIATA

### No GitHub Web Interface:

1. **Acesse:** https://github.com/agenciaspace/clinione/blob/clarissa/src/components/appointments/AppointmentFormSimple.tsx

2. **Clique no ícone de lápis para editar**

3. **MUDANÇA 1 - Linha 33:**
   Procure por:
   ```typescript
   import { cpfValidationRules, maskCPF } from '@/utils/cpf-validation';
   ```
   
   Substitua por:
   ```typescript
   import { cpfValidationRules, maskCPF, validateCPF } from '@/utils/cpf-validation';
   ```

4. **MUDANÇA 2 - Linhas 39-45:**
   Procure por:
   ```typescript
   patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
     (cpf) => {
       const { validateCPF } = require('@/utils/cpf-validation');
       return validateCPF(cpf) === null;
     },
     { message: 'CPF inválido' }
   ),
   ```
   
   Substitua por:
   ```typescript
   patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
     (cpf) => validateCPF(cpf) === null,
     { message: 'CPF inválido' }
   ),
   ```

5. **COMMIT:**
   - Message: `fix: corrigir erro ReferenceError require no AppointmentFormSimple`
   - Clique em "Commit changes"

## ⏱️ RESULTADO ESPERADO
- A Vercel detectará a mudança automaticamente
- Novo build será iniciado em 1-2 minutos
- O erro desaparecerá após o deploy

## 🔍 VERIFICAÇÃO
Após o deploy:
1. Limpe o cache (Cmd+Shift+R ou Ctrl+Shift+R)
2. Teste o formulário de agendamento
3. Console não deve mais mostrar `ReferenceError: require is not defined`

## 📋 STATUS DOS COMMITS LOCAIS
```
2111f8a ✅ fix: corrigir erro ReferenceError require no AppointmentFormSimple
8b04df3 ✅ fix: corrigir problemas de recarregamento automático das páginas
```

**Estes commits contêm as correções mas não conseguiram ser enviados por problema de autenticação.**