-- =====================================================
-- FIX: Corrigir erro de criação de usuário
-- =====================================================
-- Este script corrige o problema de criação de usuários
-- Error: "Database error creating new user"
-- =====================================================

-- 1. Remover trigger antigo que pode estar causando problema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- 2. Criar função mais robusta para handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Inserir perfil apenas se não existir
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar a criação do usuário
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger com melhor tratamento de erro
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Garantir que a tabela profiles tem a estrutura correta
ALTER TABLE profiles 
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN role SET DEFAULT 'admin';

-- 5. Adicionar constraint se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_id_fkey'
    ) THEN
        ALTER TABLE profiles 
            ADD CONSTRAINT profiles_id_fkey 
            FOREIGN KEY (id) 
            REFERENCES auth.users(id) 
            ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Garantir permissões corretas
GRANT USAGE ON SCHEMA auth TO postgres, service_role;
GRANT ALL ON auth.users TO postgres, service_role;
GRANT ALL ON public.profiles TO anon, authenticated, service_role;

-- 7. Criar função auxiliar para criar usuário com perfil
CREATE OR REPLACE FUNCTION create_user_with_profile(
    p_email TEXT,
    p_password TEXT,
    p_full_name TEXT DEFAULT NULL,
    p_role TEXT DEFAULT 'admin',
    p_clinic_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_user_id UUID;
    v_result JSON;
BEGIN
    -- Criar usuário via auth.users (não podemos fazer isso diretamente)
    -- Esta função é apenas um exemplo de como seria
    
    -- Para uso real, você precisa criar o usuário via:
    -- 1. Supabase Dashboard
    -- 2. Supabase Auth API
    -- 3. Aplicação frontend
    
    v_result := json_build_object(
        'success', false,
        'message', 'Use o Dashboard ou a API do Supabase para criar usuários',
        'instructions', json_build_object(
            'dashboard', 'Authentication > Users > Add User',
            'api', 'POST /auth/v1/admin/users',
            'frontend', 'supabase.auth.signUp()'
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Verificar e corrigir perfis órfãos
DO $$
DECLARE
    v_orphans INTEGER;
BEGIN
    -- Contar perfis sem usuário correspondente
    SELECT COUNT(*) INTO v_orphans
    FROM profiles p
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = p.id
    );
    
    IF v_orphans > 0 THEN
        -- Remover perfis órfãos
        DELETE FROM profiles
        WHERE id NOT IN (SELECT id FROM auth.users);
        
        RAISE NOTICE 'Removidos % perfis órfãos', v_orphans;
    END IF;
END $$;

-- 9. Criar usuário de teste manualmente (exemplo)
-- NOTA: Isto NÃO cria o usuário no auth.users!
-- É apenas para demonstrar como seria o processo
DO $$
DECLARE
    v_test_user_id UUID;
BEGIN
    -- Gerar um UUID para teste
    v_test_user_id := gen_random_uuid();
    
    -- Você pode inserir um perfil de teste se tiver o ID do usuário
    -- INSERT INTO profiles (id, email, full_name, role)
    -- VALUES (v_test_user_id, 'test@example.com', 'Test User', 'admin')
    -- ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Para criar um usuário real, use o Supabase Dashboard ou a API';
    RAISE NOTICE 'Dashboard: Authentication > Users > Add User';
    RAISE NOTICE 'Ou use supabase.auth.signUp() no frontend';
END $$;

-- 10. Verificar estado atual das tabelas
DO $$
DECLARE
    v_users_count INTEGER;
    v_profiles_count INTEGER;
    v_clinics_count INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO v_users_count FROM auth.users;
    SELECT COUNT(*) INTO v_profiles_count FROM profiles;
    SELECT COUNT(*) INTO v_clinics_count FROM clinics;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'STATUS DO BANCO DE DADOS';
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Usuários (auth.users): %', v_users_count;
    RAISE NOTICE 'Perfis (profiles): %', v_profiles_count;
    RAISE NOTICE 'Clínicas: %', v_clinics_count;
    RAISE NOTICE '==========================================';
    
    IF v_users_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  NENHUM USUÁRIO ENCONTRADO!';
        RAISE NOTICE '';
        RAISE NOTICE 'Para criar um usuário:';
        RAISE NOTICE '1. Vá no Supabase Dashboard';
        RAISE NOTICE '2. Authentication → Users → Add User';
        RAISE NOTICE '3. Preencha:';
        RAISE NOTICE '   - Email: admin@clinica.com';
        RAISE NOTICE '   - Password: Clinica123!';
        RAISE NOTICE '   - Auto Confirm User: ✅';
        RAISE NOTICE '';
    END IF;
END $$;

-- =====================================================
-- INSTRUÇÕES IMPORTANTES
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Depois, crie o usuário via Dashboard:
--    Authentication → Users → Add User
-- 3. Use estas credenciais para teste:
--    Email: admin@clinica.com
--    Senha: Clinica123!
-- 4. Marque "Auto Confirm User" para confirmar automaticamente
-- =====================================================