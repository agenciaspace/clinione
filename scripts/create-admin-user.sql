-- Criar um usuário admin dedicado para gerenciamento
-- Execute após fix-roles-database.sql

-- 1. Criar role 'super_admin' para usuário leonhatori
INSERT INTO public.user_roles (user_id, role, clinic_id)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'leonhatori@gmail.com'),
    'super_admin',
    NULL
) ON CONFLICT DO NOTHING;

-- 2. Atualizar metadata para super_admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"super_admin"'
)
WHERE email = 'leonhatori@gmail.com';

-- 3. Atualizar constraint para incluir super_admin
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_role_check 
  CHECK (role IN ('super_admin', 'owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient'));

-- 4. Verificar resultado
SELECT 
    u.email,
    u.raw_user_meta_data->>'role' as metadata_role,
    ur.role as db_role,
    ur.clinic_id
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com')
ORDER BY u.email, ur.role;