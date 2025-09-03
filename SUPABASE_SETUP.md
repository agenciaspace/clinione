# 🔧 Configuração do Supabase - Clini.One

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase Dashboard

## 🚀 Passo a Passo

### 1. Obter Credenciais

1. **Acesse seu projeto** no [Supabase Dashboard](https://app.supabase.com)
2. Vá em **Settings → API**
3. Copie as seguintes informações:
   - **Project URL**: `https://seu-projeto-id.supabase.co`
   - **anon public key**: Token JWT longo que começa com `eyJ...`

### 2. Configurar .env

Edite o arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE:**
- Use apenas a chave **ANON** (pública) no frontend
- **NUNCA** use a **secret key** em aplicações frontend
- A secret key deve ser usada apenas em ambientes server-side

### 3. Criar Tabelas (Opcional)

Se você quiser testar com dados reais, crie as tabelas no SQL Editor do Supabase:

```sql
-- Tabela de clínicas
CREATE TABLE clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    cnpj VARCHAR,
    cpf VARCHAR,
    address TEXT,
    phone VARCHAR,
    email VARCHAR,
    timezone VARCHAR DEFAULT 'America/Sao_Paulo',
    logo_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR NOT NULL,
    name VARCHAR,
    phone VARCHAR,
    role VARCHAR CHECK (role IN ('admin', 'doctor', 'receptionist')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Associação usuário-clínica
CREATE TABLE user_clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    clinic_id UUID REFERENCES clinics(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Progresso do onboarding
CREATE TABLE onboarding_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id),
    current_step INTEGER DEFAULT 0,
    completed_steps INTEGER[] DEFAULT '{}',
    data JSONB DEFAULT '{}',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. Configurar RLS (Row Level Security)

Para segurança, configure políticas RLS:

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Política básica: usuários só veem dados da própria clínica
CREATE POLICY "Users can only see own clinic data" ON clinics
    FOR ALL USING (id IN (
        SELECT clinic_id FROM user_clinics 
        WHERE user_id = auth.uid()
    ));

-- Adicionar mais políticas conforme necessário...
```

### 5. Testar Conexão

1. **Salve o arquivo .env**
2. **Recarregue a aplicação** (Ctrl+R)
3. **Verifique o console** - não deve haver erros de URL
4. **A tela de onboarding** deve aparecer em vez do aviso de configuração

## 🔍 Troubleshooting

### Erro: "Failed to construct URL"
- ✅ Verifique se a `VITE_SUPABASE_URL` está correta
- ✅ Deve seguir o padrão: `https://projeto-id.supabase.co`

### Erro: "Invalid JWT"
- ✅ Verifique se a `VITE_SUPABASE_ANON_KEY` é a chave **anon** (não secret)
- ✅ A chave deve ser um JWT longo (>100 caracteres)

### Aplicação não detecta as credenciais
- ✅ Reinicie o servidor de desenvolvimento (`npm run dev`)
- ✅ Verifique se não há espaços extras nas variáveis
- ✅ Confirme que o arquivo se chama exatamente `.env`

### Console mostra "Supabase not configured"
- ✅ As credenciais ainda são placeholders
- ✅ Verifique se salvou o arquivo .env
- ✅ Recarregue a página

## 📞 Suporte

Se tiver problemas:
1. Verifique as credenciais no Supabase Dashboard
2. Confirme que o projeto Supabase está ativo
3. Teste a URL no navegador (deve mostrar uma página Supabase)

## 🎯 Próximos Passos

Após configurar:
1. **Complete o onboarding** - Cadastre sua clínica
2. **Teste as funcionalidades** - Crie profissionais e serviços
3. **Explore o sistema** - Navegue pelas 6 etapas do wizard

---

**🔒 Segurança:** Mantenha suas credenciais seguras e nunca as compartilhe publicamente.