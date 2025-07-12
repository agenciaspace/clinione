# 🔧 Correção de Erros de Login do Supabase

## ⚠️ Problemas Identificados

1. **Políticas RLS muito restritivas** - Causando erros 401 Unauthorized
2. **Tipo ENUM user_role conflitante** - Impedindo inserção de novos roles
3. **Políticas de verificação de email obrigatória** - Bloqueando usuários
4. **Tratamento inadequado de erros** - Mensagens genéricas

## 🛠️ Correções Implementadas

### 1. **Políticas RLS Simplificadas**
- Removidas políticas ultra-restritivas
- Criadas políticas permissivas para usuários autenticados
- Mantida segurança básica com `auth.uid()`

### 2. **Conversão de ENUM para TEXT**
- Convertido `user_role` de ENUM para TEXT
- Adicionado CHECK constraint com todos os roles
- Tornado `clinic_id` nullable

### 3. **Melhor Tratamento de Erros**
- Mensagens específicas para cada tipo de erro
- Tratamento de rate limiting
- Validação de credenciais

## 📋 Instruções de Aplicação

### Passo 1: Executar Script SQL no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá para **SQL Editor**
3. Execute o script: `scripts/fix-login-errors.sql`

### Passo 2: Verificar Aplicação

O script deve retornar:
```sql
-- Resultado esperado
Script aplicado com sucesso | 8 (políticas criadas)
```

### Passo 3: Testar Funcionalidades

#### Teste de Registro:
```
1. Acesse /register
2. Preencha os dados
3. Deve funcionar sem erro 401
4. Deve criar entrada na tabela user_roles
```

#### Teste de Login:
```
1. Acesse /login
2. Use credenciais existentes
3. Deve fazer login com sucesso
4. Deve carregar roles do usuário
```

## 🔍 Verificação de Problemas

### Verificar Políticas RLS:
```sql
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
```

### Verificar Estrutura user_roles:
```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles'
ORDER BY ordinal_position;
```

### Verificar Permissões:
```sql
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND grantee = 'authenticated';
```

## 🚨 Resolução de Problemas

### Erro: "relation user_role does not exist"
**Solução**: Execute novamente a conversão de ENUM para TEXT:
```sql
ALTER TABLE public.user_roles ALTER COLUMN role TYPE TEXT;
DROP TYPE IF EXISTS user_role CASCADE;
```

### Erro: "insufficient privilege"
**Solução**: Verifique se você tem permissões de admin no Supabase.

### Erro: "policy already exists"
**Solução**: Normal, o script usa `IF EXISTS` para evitar conflitos.

## 📊 Monitoramento

### Logs de Autenticação:
- Monitore no console do browser
- Procure por "Error fetching user roles"
- Verifique se roles são carregadas corretamente

### Logs do Supabase:
- Acesse Logs > Auth
- Monitore tentativas de login
- Verifique se não há erros de RLS

## 🔄 Rollback (se necessário)

Se algo der errado, execute:
```sql
-- Desabilitar RLS temporariamente
ALTER TABLE clinics DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Reabilitar após correção
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

## ✅ Checklist de Validação

- [ ] Script SQL executado com sucesso
- [ ] Políticas RLS criadas corretamente
- [ ] Registro de novos usuários funcionando
- [ ] Login de usuários existentes funcionando
- [ ] Roles carregadas corretamente
- [ ] Não há erros 401 no console
- [ ] Criação de clínicas funcionando
- [ ] Sidebar visível para todos os roles

## 📞 Suporte

Se os problemas persistirem:
1. Verifique logs do browser (F12 > Console)
2. Verifique logs do Supabase Dashboard
3. Execute queries de verificação acima
4. Documente o erro específico encontrado

---

**Importante**: Essas correções tornam o sistema mais permissivo. Após confirmar que tudo funciona, você pode implementar políticas RLS mais granulares baseadas em roles específicos se necessário. 