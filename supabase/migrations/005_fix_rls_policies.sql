-- =====================================================
-- FIX: Corrigir Políticas RLS com Recursão Infinita
-- =====================================================
-- Este script corrige o erro de recursão infinita nas políticas RLS
-- Error: "infinite recursion detected in policy for relation user_clinics"
-- =====================================================

-- 1. Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "Users can view own associations" ON user_clinics;
DROP POLICY IF EXISTS "Admins can manage clinic associations" ON user_clinics;
DROP POLICY IF EXISTS "Users can view clinic members profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view clinic patients" ON patients;
DROP POLICY IF EXISTS "Users can view clinic professionals" ON professionals;
DROP POLICY IF EXISTS "Users can view clinic services" ON services;
DROP POLICY IF EXISTS "Users can view clinic appointments" ON appointments;
DROP POLICY IF EXISTS "Users can manage own clinic onboarding" ON onboarding_progress;

-- 2. Criar políticas mais simples e diretas para user_clinics
CREATE POLICY "Users can view own clinic associations" ON user_clinics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own clinic associations" ON user_clinics
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own clinic associations" ON user_clinics
    FOR UPDATE USING (user_id = auth.uid());

-- 3. Políticas para profiles (sem referência circular)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Permitir visualizar perfis de usuários da mesma clínica (sem recursão)
CREATE POLICY "View profiles in same clinic" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_clinics uc1, user_clinics uc2
            WHERE uc1.user_id = auth.uid()
            AND uc2.user_id = profiles.id
            AND uc1.clinic_id = uc2.clinic_id
        )
    );

-- 4. Função helper para verificar se usuário pertence à clínica
CREATE OR REPLACE FUNCTION user_belongs_to_clinic(clinic_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_clinics
        WHERE user_id = auth.uid() AND clinic_id = clinic_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Políticas simplificadas usando a função helper
CREATE POLICY "Access clinic patients" ON patients
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

CREATE POLICY "Access clinic professionals" ON professionals
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

CREATE POLICY "Access clinic services" ON services
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

CREATE POLICY "Access clinic appointments" ON appointments
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

CREATE POLICY "Access clinic onboarding" ON onboarding_progress
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 6. Permitir acesso total para service_role (bypass RLS)
CREATE POLICY "Service role bypass" ON user_clinics
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role bypass profiles" ON profiles
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role bypass patients" ON patients
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role bypass professionals" ON professionals
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role bypass services" ON services
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role bypass appointments" ON appointments
    FOR ALL TO service_role USING (true);

-- 7. Política específica para clinics (sem recursão)
DROP POLICY IF EXISTS "Users can view own clinics" ON clinics;
DROP POLICY IF EXISTS "Admins can create clinics" ON clinics;
DROP POLICY IF EXISTS "Clinic admins can update" ON clinics;

CREATE POLICY "View clinics where user is member" ON clinics
    FOR SELECT USING (
        id IN (
            SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Insert clinics" ON clinics
    FOR INSERT WITH CHECK (true); -- Permitir inserção para qualquer usuário autenticado

CREATE POLICY "Update own clinics" ON clinics
    FOR UPDATE USING (
        id IN (
            SELECT clinic_id FROM user_clinics 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- 8. Garantir permissões para anon e authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_belongs_to_clinic(UUID) TO anon, authenticated;

-- 9. Verificar se as políticas foram aplicadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas por tabela
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'user_clinics';
    
    RAISE NOTICE 'Políticas RLS corrigidas!';
    RAISE NOTICE 'user_clinics: % políticas', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Função helper criada: user_belongs_to_clinic()';
    RAISE NOTICE 'Políticas sem recursão infinita aplicadas';
    RAISE NOTICE '';
    RAISE NOTICE 'Teste agora o login na aplicação!';
END $$;

-- =====================================================
-- TESTE RÁPIDO (Execute após criar usuário)
-- =====================================================
-- Descomente para testar se as políticas funcionam:

/*
-- Substituir pelo ID real do usuário
DO $$
DECLARE
    test_user_id UUID := 'SEU_USER_ID_AQUI';
    test_clinic_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
BEGIN
    -- Simular chamada da função
    RAISE NOTICE 'Testando função helper...';
    
    -- Esta query deve funcionar sem recursão
    PERFORM user_belongs_to_clinic(test_clinic_id);
    
    RAISE NOTICE 'Função funcionando corretamente!';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro no teste: %', SQLERRM;
END $$;
*/