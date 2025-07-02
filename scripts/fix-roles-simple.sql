-- Correção simples do sistema de roles
-- Execute este SQL no Supabase Dashboard

-- 1. Limpar dados inconsistentes
DELETE FROM public.user_roles WHERE role NOT IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient');

-- 2. Atualizar usuário leonhatori para ter role 'owner' em vez de 'admin'
UPDATE public.user_roles 
SET role = 'owner' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'leonhatori@gmail.com')
AND role = 'admin';

-- 3. Verificar e inserir role 'owner' para leonhatori se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN auth.users u ON ur.user_id = u.id
        WHERE u.email = 'leonhatori@gmail.com' AND ur.role = 'owner'
    ) THEN
        INSERT INTO public.user_roles (user_id, role, clinic_id)
        VALUES (
            (SELECT id FROM auth.users WHERE email = 'leonhatori@gmail.com'),
            'owner',
            NULL
        );
    END IF;
END $$;

-- 4. Verificar e inserir role 'owner' para valojos367 se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN auth.users u ON ur.user_id = u.id
        WHERE u.email = 'valojos367@ofacer.com' AND ur.role = 'owner'
    ) THEN
        INSERT INTO public.user_roles (user_id, role, clinic_id)
        VALUES (
            (SELECT id FROM auth.users WHERE email = 'valojos367@ofacer.com'),
            'owner',
            (SELECT clinic_id FROM public.user_roles ur2
             JOIN auth.users u2 ON ur2.user_id = u2.id
             WHERE u2.email = 'valojos367@ofacer.com' 
             AND ur2.clinic_id IS NOT NULL
             LIMIT 1)
        );
    END IF;
END $$;

-- 5. Atualizar metadata dos usuários para role 'owner'
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"owner"'
)
WHERE email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com');

-- 6. Verificar resultado
SELECT 
    u.email,
    u.raw_user_meta_data->>'role' as metadata_role,
    ur.role as db_role,
    ur.clinic_id
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com')
ORDER BY u.email, ur.role;