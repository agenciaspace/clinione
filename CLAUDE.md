# CLAUDE.md - Instruções para Claude

## REGRAS FUNDAMENTAIS

### ❌ NÃO FAZER
- **NUNCA** criar soluções alternativas ou fallbacks quando um problema precisa ser corrigido
- **NUNCA** implementar workarounds quando o usuário pede para resolver um problema específico
- **NUNCA** sugerir "abordagens diferentes" quando há um erro específico a ser corrigido

### ✅ FAZER
- Identificar a causa raiz do problema
- Corrigir diretamente o problema identificado
- Focar na solução específica solicitada pelo usuário

## CONTEXTO DO PROJETO

Este é um sistema de gestão de clínicas médicas (Clinio) usando:
- React + TypeScript
- Supabase para autenticação e banco de dados
- Vercel para deploy (branch: clarissa)

## PROBLEMAS CONHECIDOS E SOLUÇÕES

### Reset de Senha
**Problema**: Tokens de reset aparecem como 6 dígitos em vez de JWT
**Causa**: Template do Supabase usando `{{ .Token }}` em vez de `{{ .TokenHash }}`
**Solução**: ✅ Modificar template para usar `{{ .TokenHash }}`

**Problema**: Rate limit 429 e erro 403 no reset
**Causa**: Muitas tentativas de reset de senha + redirect automático do Supabase
**Solução**: ✅ Interceptar token imediatamente na página e limpar URL para evitar redirect automático

**Problema**: AuthSessionMissingError ao tentar alterar senha
**Causa**: Token hash não estabelece sessão automaticamente
**Solução**: ✅ Usar verifyOtp + setSession no useEffect antes de qualquer interação do usuário

### Comandos Úteis
```bash
# Verificar status do Supabase local
npx supabase status

# Build e typecheck
npm run build
npm run typecheck

# Deploy
git push origin clarissa
```

## FLUXO DE TRABALHO
1. Identificar problema específico
2. Corrigir diretamente sem alternativas
3. Testar a correção
4. Fazer commit e push para clarissa