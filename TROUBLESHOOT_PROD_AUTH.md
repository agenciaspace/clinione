# 🚨 Troubleshooting - Problemas de Autenticação em Produção

## Problemas Identificados

### 1. **Login Falhando (400 Bad Request)**
```
AuthApiError: Invalid login credentials
```

### 2. **Rate Limit Excedido (429)**
```
email rate limit exceeded
```

### 3. **403 Forbidden**
```
Failed to load resource: 403 (Forbidden)
```

## 🔍 Diagnóstico Passo a Passo

### Etapa 1: Verificar Dashboard do Supabase
1. Acesse: https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk
2. Vá em **Authentication > Users**
3. Verifique se `leonhatori@gmail.com` existe
4. Confirme se o email está verificado (campo `email_confirmed_at`)

### Etapa 2: Verificar Configurações de Rate Limit
1. No dashboard, vá em **Authentication > Settings**
2. Verifique as configurações de rate limit:
   - **Sign up rate limit**: Quantos por hora
   - **Password reset rate limit**: Quantos por hora
3. Se necessário, aumente temporariamente ou aguarde reset

### Etapa 3: Verificar Row Level Security (RLS)
1. Vá em **Database > Tables**
2. Verifique as tabelas `user_roles` e `clinics`
3. Confirme se as políticas RLS não estão muito restritivas

### Etapa 4: Verificar Site URL
1. Em **Authentication > Settings**
2. Confirme se o **Site URL** está como: `https://clini.one`
3. Verifique **Redirect URLs** incluem: `https://clini.one/**`

## 🛠️ Soluções Rápidas

### Solução 1: Reset Manual do Usuário
```sql
-- Execute no SQL Editor do Supabase
UPDATE auth.users 
SET 
  encrypted_password = crypt('nova_senha_temporaria', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'leonhatori@gmail.com';
```

### Solução 2: Criar Usuário se Não Existir
```sql
-- Verificar se usuário existe
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'leonhatori@gmail.com';

-- Se não existir, você precisará criar via dashboard ou API
```

### Solução 3: Aguardar Rate Limit Reset
- Rate limits geralmente resetam a cada hora
- Aguarde 60 minutos antes de tentar novamente
- Ou entre em contato com suporte do Supabase para reset manual

### Solução 4: Verificar Configurações de Segurança
```sql
-- Verificar políticas RLS muito restritivas
SELECT schemaname, tablename, policyname, cmd, roles, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'user_roles', 'clinics')
ORDER BY tablename, cmd;
```

## 🚀 Ações Imediatas Recomendadas

1. **PRIMEIRO**: Acesse o dashboard do Supabase e verifique se o usuário existe
2. **SE NÃO EXISTIR**: Crie o usuário manualmente pelo dashboard
3. **SE EXISTIR**: Resete a senha pelo dashboard
4. **AGUARDE**: Rate limit resetar (se aplicável)
5. **TESTE**: Faça login com as novas credenciais

## 📞 Suporte Adicional

Se os problemas persistirem:
1. Verifique os logs do Supabase no dashboard
2. Entre em contato com o suporte do Supabase
3. Considere migrar dados do ambiente local para produção

## 🔧 Scripts de Diagnóstico

Execute estes arquivos para diagnóstico:
- `debug-prod-auth.html` - Teste no navegador
- `scripts/sync-user-to-prod.js` - Verificação via Node.js