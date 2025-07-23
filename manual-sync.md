# Manual de Sincronização de Dados

## Opção 1: Backup Manual via Interface do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk)
2. Vá em "Settings" > "Database"
3. Na seção "Database backups", clique em "Create backup"
4. Depois de criado, faça o download do backup

## Opção 2: Comando Manual

Execute o seguinte comando e insira sua senha quando solicitado:

```bash
npx supabase db dump --linked --file ./backups/manual-backup.sql
```

## Opção 3: Restaurar Dados Manualmente

Se você já tem acesso aos dados de produção, você pode:

1. Fazer login no Supabase Studio local: http://localhost:54323
2. Copiar os dados manualmente das tabelas importantes:
   - auth.users (seus usuários)
   - public.clinics (suas clínicas)
   - public.user_roles (roles dos usuários)
   - public.doctors (médicos)
   - public.patients (pacientes)
   - public.appointments (agendamentos)

## Para Testar com Dados Existentes

Por enquanto, você pode usar os dados de teste que já estão no banco local:

- Email: `admin@clinio.com`
- Senha: `123456`

ou

- Email: `doctor@clinio.com`  
- Senha: `123456`

Estes usuários já têm acesso à clínica de teste "Dermatologia Paraíso".