-- Correção definitiva do sistema de roles
-- Execute este SQL no Supabase Dashboard

-- 1. Limpar dados inconsistentes
DELETE FROM public.user_roles WHERE role NOT IN ('owner', 'admin', 'doctor', 'staff', 'receptionist', 'patient');

-- 2. Atualizar usuário leonhatori para ter role 'owner' em vez de 'admin'
-- Isso garante consistência entre os dois usuários
UPDATE public.user_roles 
SET role = 'owner' 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'leonhatori@gmail.com')
AND role = 'admin';

-- 3. Garantir que ambos os usuários tenham role 'owner'
INSERT INTO public.user_roles (user_id, role, clinic_id)
SELECT 
    u.id,
    'owner',
    NULL
FROM auth.users u
WHERE u.email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com')
AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = u.id AND ur.role = 'owner'
)
ON CONFLICT (user_id, clinic_id) WHERE clinic_id IS NULL DO UPDATE SET role = 'owner';

-- 4. Atualizar metadata dos usuários para role 'owner'
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'),
    '{role}',
    '"owner"'
)
WHERE email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com');

-- 5. Criar uma função para garantir que novos usuários tenham role correto
CREATE OR REPLACE FUNCTION ensure_user_has_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir role 'patient' por padrão para novos usuários
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'patient')
    ON CONFLICT DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar trigger para novos usuários
DROP TRIGGER IF EXISTS trigger_ensure_user_role ON auth.users;
CREATE TRIGGER trigger_ensure_user_role
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION ensure_user_has_role();

-- 7. Verificar resultado final
SELECT 
    u.email,
    u.raw_user_meta_data->>'role' as metadata_role,
    array_agg(ur.role) as db_roles
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email IN ('leonhatori@gmail.com', 'valojos367@ofacer.com')
GROUP BY u.email, u.raw_user_meta_data->>'role'
ORDER BY u.email;