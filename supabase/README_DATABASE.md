# 🗄️ Configuração do Banco de Dados - Clini.One

## 📋 Visão Geral

Este diretório contém todos os scripts SQL necessários para criar a estrutura completa do banco de dados do Clini.One no Supabase.

## 📁 Arquivos

### 1. `001_create_tables.sql`
- **Descrição**: Script principal que cria toda a estrutura do banco
- **Conteúdo**:
  - 8 tabelas principais
  - Índices otimizados
  - Triggers para `updated_at`
  - Políticas RLS (Row Level Security)
  - Funções auxiliares

### 2. `002_seed_test_data.sql`
- **Descrição**: Script para inserir dados de teste
- **Conteúdo**:
  - 1 clínica exemplo
  - 9 serviços médicos
  - 5 profissionais
  - 10 pacientes
  - ~100 agendamentos de exemplo

## 🚀 Como Executar

### Passo 1: Acessar o Supabase Dashboard

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Faça login em sua conta
3. Selecione seu projeto ou crie um novo

### Passo 2: Executar Script de Criação

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo de `001_create_tables.sql`
4. Cole no editor SQL
5. Clique em **Run** (ou pressione `Ctrl+Enter`)

⚠️ **ATENÇÃO**: Este script irá DROPAR tabelas existentes! Use com cuidado em produção.

### Passo 3: Executar Script de Dados de Teste (Opcional)

1. Ainda no SQL Editor, clique em **New Query**
2. Copie todo o conteúdo de `002_seed_test_data.sql`
3. Cole no editor SQL
4. Clique em **Run**

✅ Este script criará dados de exemplo para teste.

### Passo 4: Criar Usuário de Teste

1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - Email: `admin@clinica.com`
   - Password: `Clinica123!`
   - Auto Confirm User: ✅

### Passo 5: Associar Usuário à Clínica

No SQL Editor, execute:

```sql
-- Substitua 'ID_DO_USUARIO' pelo ID real do usuário criado
INSERT INTO user_clinics (user_id, clinic_id, role)
VALUES (
    'ID_DO_USUARIO', -- Ver na aba Authentication → Users
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- ID da clínica de teste
    'admin'
);
```

## 📊 Estrutura das Tabelas

### Tabelas Principais

| Tabela | Descrição | Campos Principais |
|--------|-----------|-------------------|
| `clinics` | Clínicas médicas | name, cnpj, address, phone, email |
| `profiles` | Perfis de usuários | email, full_name, role, phone |
| `patients` | Pacientes | name, email, phone, cpf, birth_date |
| `professionals` | Médicos/Profissionais | name, crm, specialty, email |
| `services` | Serviços oferecidos | name, duration, price, category |
| `appointments` | Agendamentos | date, time, patient_id, professional_id |
| `user_clinics` | Associação usuário-clínica | user_id, clinic_id, role |
| `onboarding_progress` | Progresso do onboarding | clinic_id, current_step, data |

### Políticas RLS

Todas as tabelas têm Row Level Security habilitado:
- Usuários só veem dados de suas próprias clínicas
- Admins podem gerenciar todos os dados de sua clínica
- Pacientes podem ver apenas seus próprios dados

## 🔐 Segurança

### RLS (Row Level Security)
- ✅ Habilitado em todas as tabelas
- ✅ Políticas baseadas em `clinic_id`
- ✅ Isolamento completo entre clínicas

### Triggers
- `update_updated_at()`: Atualiza campo `updated_at` automaticamente
- `handle_new_user()`: Cria perfil ao registrar usuário
- `set_appointment_clinic_id()`: Define clinic_id automaticamente

## 🧪 Testando a Configuração

### Via SQL Editor

Execute para verificar se tudo foi criado:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Contar registros
SELECT 
    'clinics' as tabela, COUNT(*) as total FROM clinics
UNION ALL SELECT 
    'patients', COUNT(*) FROM patients
UNION ALL SELECT 
    'professionals', COUNT(*) FROM professionals
UNION ALL SELECT 
    'services', COUNT(*) FROM services
UNION ALL SELECT 
    'appointments', COUNT(*) FROM appointments;
```

### Via Aplicação

1. Acesse http://localhost:5174
2. Faça login com `admin@clinica.com` / `Clinica123!`
3. Navegue até **Dashboard → Agenda**
4. Você deve ver os agendamentos de teste

## 🐛 Troubleshooting

### Erro: "permission denied for schema public"
```sql
GRANT ALL ON SCHEMA public TO anon, authenticated;
```

### Erro: "relation does not exist"
- Verifique se executou o script `001_create_tables.sql` primeiro

### Erro: "duplicate key value violates unique constraint"
- O script de seed já foi executado
- Execute `TRUNCATE` nas tabelas antes de re-executar

### Erro ao fazer login
- Verifique se criou o usuário no Authentication
- Verifique se associou o usuário à clínica via `user_clinics`

## 📝 Notas Importantes

1. **IDs Fixos**: O script de teste usa IDs fixos para facilitar desenvolvimento
2. **Timezone**: Configurado para `America/Sao_Paulo`
3. **Status**: Agendamentos podem ter 5 status diferentes
4. **Validações**: Índice único previne duplos agendamentos

## 🔄 Reset do Banco

Para resetar completamente o banco:

```sql
-- CUIDADO: Isso apagará TODOS os dados!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO anon, authenticated;

-- Depois execute novamente o script 001_create_tables.sql
```

## 📧 Suporte

Em caso de dúvidas ou problemas:
1. Verifique os logs no Supabase Dashboard
2. Consulte a documentação do Supabase
3. Abra uma issue no repositório

---

**⚡ Dica**: Após configurar o banco, teste a funcionalidade de agendamento no sistema!