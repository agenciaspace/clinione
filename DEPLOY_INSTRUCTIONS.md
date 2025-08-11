# Instruções para Deploy na Vercel

## Problema Identificado
O erro `ReferenceError: require is not defined` ocorre porque o código antigo ainda está no GitHub.

## Correções Aplicadas Localmente

### 1. Correção do erro require no AppointmentFormSimple.tsx
- **Arquivo:** `src/components/appointments/AppointmentFormSimple.tsx`
- **Problema:** Uso de `require()` dentro do schema Zod (linha 41)
- **Solução:** Importar `validateCPF` diretamente no topo do arquivo

**Antes (linha 33):**
```typescript
import { cpfValidationRules, maskCPF } from '@/utils/cpf-validation';
```

**Depois (linha 33):**
```typescript
import { cpfValidationRules, maskCPF, validateCPF } from '@/utils/cpf-validation';
```

**Antes (linhas 39-45):**
```typescript
patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
  (cpf) => {
    const { validateCPF } = require('@/utils/cpf-validation');
    return validateCPF(cpf) === null;
  },
  { message: 'CPF inválido' }
),
```

**Depois (linhas 39-42):**
```typescript
patient_cpf: z.string().min(1, { message: 'CPF é obrigatório' }).refine(
  (cpf) => validateCPF(cpf) === null,
  { message: 'CPF inválido' }
),
```

### 2. Outras melhorias aplicadas
- Otimização do React Query para evitar refetches desnecessários
- Prevenção de fechamento acidental de modais
- Melhorias no PWAUpdatePrompt

## Commits Prontos para Push

```bash
2111f8a fix: corrigir erro ReferenceError require no AppointmentFormSimple
8b04df3 fix: corrigir problemas de recarregamento automático das páginas
```

## Como Fazer o Deploy

### Opção 1: Via Terminal (se tiver acesso ao GitHub)
```bash
# Verificar status
git status

# Ver commits pendentes
git log --oneline -n 3

# Fazer push para o branch clarissa
git push origin clarissa
```

### Opção 2: Aplicar Mudanças Manualmente
Se não conseguir fazer push, aplique manualmente a correção no arquivo:
`src/components/appointments/AppointmentFormSimple.tsx`

1. Adicione `validateCPF` ao import na linha 33
2. Remova o `require()` das linhas 40-42
3. Simplifique o refine para chamar `validateCPF(cpf)` diretamente

### Opção 3: Via GitHub Web
1. Acesse: https://github.com/agenciaspace/clinione
2. Vá para o branch `clarissa`
3. Edite o arquivo `src/components/appointments/AppointmentFormSimple.tsx`
4. Aplique as correções mencionadas acima
5. Faça commit diretamente no GitHub

## Verificação Após Deploy

1. Aguarde o deploy automático da Vercel
2. Limpe o cache do navegador (Cmd+Shift+R ou Ctrl+Shift+R)
3. Teste o formulário de agendamento
4. Verifique no console se o erro desapareceu

## Status Atual
- ✅ Correção aplicada localmente
- ✅ Build local funcionando
- ❌ Push pendente para GitHub
- ❌ Deploy pendente na Vercel

## Importante
O erro APENAS desaparecerá na Vercel após o push dos commits para o GitHub e o redeploy automático.