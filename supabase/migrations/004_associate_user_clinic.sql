-- =====================================================
-- ASSOCIAR USUÁRIO À CLÍNICA
-- =====================================================
-- Execute este script APÓS criar o usuário no Dashboard
-- Substitua 'SEU_USER_ID' pelo ID real do usuário criado
-- =====================================================

-- 1. Verificar usuários existentes
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar perfis criados automaticamente
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
ORDER BY p.created_at DESC;

-- 3. Verificar clínicas disponíveis
SELECT 
    id,
    name,
    email,
    created_at
FROM clinics
ORDER BY created_at DESC;

-- 4. SUBSTITUA 'SEU_USER_ID' pelo ID real do usuário
-- Você pode encontrar o ID na query acima ou no Dashboard
DO $$
DECLARE
    v_user_id UUID;
    v_clinic_id UUID;
    v_user_email TEXT;
    v_clinic_name TEXT;
BEGIN
    -- ⚠️ SUBSTITUA ESTE ID PELO ID REAL DO SEU USUÁRIO
    -- Encontre o ID executando: SELECT id, email FROM auth.users;
    v_user_id := NULL; -- ← COLOQUE AQUI O ID DO USUÁRIO
    
    -- ID da clínica de teste (já criada no script anterior)
    v_clinic_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    -- Verificar se foi fornecido um user_id válido
    IF v_user_id IS NULL THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  VOCÊ PRECISA DEFINIR O USER_ID!';
        RAISE NOTICE '';
        RAISE NOTICE '1. Execute: SELECT id, email FROM auth.users;';
        RAISE NOTICE '2. Copie o ID do usuário';
        RAISE NOTICE '3. Substitua na linha 34 deste script';
        RAISE NOTICE '4. Execute novamente';
        RAISE NOTICE '';
        RETURN;
    END IF;
    
    -- Verificar se o usuário existe
    SELECT email INTO v_user_email
    FROM auth.users 
    WHERE id = v_user_id;
    
    IF v_user_email IS NULL THEN
        RAISE NOTICE 'ERRO: Usuário com ID % não encontrado', v_user_id;
        RETURN;
    END IF;
    
    -- Verificar se a clínica existe
    SELECT name INTO v_clinic_name
    FROM clinics 
    WHERE id = v_clinic_id;
    
    IF v_clinic_name IS NULL THEN
        RAISE NOTICE 'ERRO: Clínica não encontrada. Execute primeiro o script de seed.';
        RETURN;
    END IF;
    
    -- Associar usuário à clínica
    INSERT INTO user_clinics (user_id, clinic_id, role)
    VALUES (v_user_id, v_clinic_id, 'admin')
    ON CONFLICT (user_id, clinic_id) 
    DO UPDATE SET role = 'admin';
    
    RAISE NOTICE '✅ SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE 'Usuário associado à clínica:';
    RAISE NOTICE 'Email: %', v_user_email;
    RAISE NOTICE 'Clínica: %', v_clinic_name;
    RAISE NOTICE 'Role: admin';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Agora você pode fazer login no sistema!';
    RAISE NOTICE '';
END $$;

-- 5. Verificar associações criadas
SELECT 
    uc.id,
    u.email as user_email,
    c.name as clinic_name,
    uc.role,
    uc.created_at
FROM user_clinics uc
JOIN auth.users u ON u.id = uc.user_id
JOIN clinics c ON c.id = uc.clinic_id
ORDER BY uc.created_at DESC;

-- =====================================================
-- SCRIPT ALTERNATIVO: Associação Manual
-- =====================================================
-- Se preferir fazer manualmente, descomente e edite:

/*
-- SUBSTITUA OS VALORES ABAIXO:
INSERT INTO user_clinics (user_id, clinic_id, role)
VALUES (
    'COLE_AQUI_O_ID_DO_USUARIO',        -- ID do auth.users
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- ID da clínica de teste
    'admin'                              -- Role do usuário
)
ON CONFLICT (user_id, clinic_id) 
DO UPDATE SET role = 'admin';
*/

-- =====================================================
-- TESTE DE LOGIN
-- =====================================================
-- Para testar se tudo funcionou:
-- 1. Acesse: http://localhost:5174
-- 2. Faça login com as credenciais criadas
-- 3. Você deve ser redirecionado para o dashboard
-- 4. Navegue para Dashboard → Appointments
-- 5. Você deve ver os agendamentos de teste

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- Se o login falhar, verifique:

-- 1. Usuário foi criado e confirmado?
SELECT id, email, email_confirmed_at FROM auth.users;

-- 2. Perfil foi criado automaticamente?
SELECT id, email, role FROM profiles;

-- 3. Associação usuário-clínica existe?
SELECT uc.*, u.email, c.name 
FROM user_clinics uc
JOIN auth.users u ON u.id = uc.user_id
JOIN clinics c ON c.id = uc.clinic_id;

-- 4. Clínica tem dados?
SELECT id, name FROM clinics;

-- Se alguma dessas queries retornar vazio, 
-- execute novamente os scripts anteriores.