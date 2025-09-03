-- =====================================================
-- FIX: Limpar e Recriar Todas as Políticas RLS
-- =====================================================
-- Este script remove TODAS as políticas existentes e cria novas
-- sem recursão infinita
-- =====================================================

-- 1. REMOVER TODAS as políticas existentes de TODAS as tabelas
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Remover todas as políticas RLS existentes
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
    
    RAISE NOTICE 'Todas as políticas RLS removidas com sucesso!';
END $$;

-- 2. Criar função helper sem recursão
DROP FUNCTION IF EXISTS user_belongs_to_clinic(UUID);
CREATE OR REPLACE FUNCTION user_belongs_to_clinic(clinic_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_clinics
        WHERE user_id = auth.uid() AND clinic_id = clinic_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas para USER_CLINICS (base, sem recursão)
CREATE POLICY "user_clinics_select" ON user_clinics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_clinics_insert" ON user_clinics
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_clinics_update" ON user_clinics
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_clinics_delete" ON user_clinics
    FOR DELETE USING (user_id = auth.uid());

-- 4. Políticas para PROFILES
CREATE POLICY "profiles_own" ON profiles
    FOR ALL USING (id = auth.uid());

-- Ver perfis de usuários da mesma clínica (usando subquery direta)
CREATE POLICY "profiles_same_clinic" ON profiles
    FOR SELECT USING (
        id IN (
            SELECT uc2.user_id 
            FROM user_clinics uc1, user_clinics uc2
            WHERE uc1.user_id = auth.uid() 
            AND uc1.clinic_id = uc2.clinic_id
        )
    );

-- 5. Políticas para CLINICS
CREATE POLICY "clinics_member_access" ON clinics
    FOR SELECT USING (
        id IN (SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid())
    );

CREATE POLICY "clinics_insert" ON clinics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "clinics_admin_update" ON clinics
    FOR UPDATE USING (
        id IN (
            SELECT clinic_id FROM user_clinics 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- 6. Políticas para PATIENTS (usando função helper)
CREATE POLICY "patients_clinic_access" ON patients
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 7. Políticas para PROFESSIONALS (usando função helper)  
CREATE POLICY "professionals_clinic_access" ON professionals
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 8. Políticas para SERVICES (usando função helper)
CREATE POLICY "services_clinic_access" ON services
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 9. Políticas para APPOINTMENTS (usando função helper)
CREATE POLICY "appointments_clinic_access" ON appointments
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 10. Políticas para ONBOARDING_PROGRESS (usando função helper)
CREATE POLICY "onboarding_clinic_access" ON onboarding_progress
    FOR ALL USING (user_belongs_to_clinic(clinic_id));

-- 11. Políticas especiais para SERVICE_ROLE (bypass completo)
CREATE POLICY "service_role_all_user_clinics" ON user_clinics
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_profiles" ON profiles
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_clinics" ON clinics
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_patients" ON patients
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_professionals" ON professionals
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_services" ON services
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_appointments" ON appointments
    FOR ALL TO service_role USING (true);

CREATE POLICY "service_role_all_onboarding" ON onboarding_progress
    FOR ALL TO service_role USING (true);

-- 12. Garantir permissões
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION user_belongs_to_clinic(UUID) TO anon, authenticated, service_role;

-- 13. Verificar resultado
DO $$
DECLARE
    policy_count INTEGER;
    table_name TEXT;
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'POLÍTICAS RLS RECRIADAS COM SUCESSO!';
    RAISE NOTICE '==========================================';
    
    FOR table_name IN 
        VALUES ('user_clinics'), ('profiles'), ('clinics'), ('patients'), 
               ('professionals'), ('services'), ('appointments'), ('onboarding_progress')
    LOOP
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = table_name;
        
        RAISE NOTICE '% : % políticas', table_name, policy_count;
    END LOOP;
    
    RAISE NOTICE '==========================================';
    RAISE NOTICE 'Função helper: user_belongs_to_clinic()';
    RAISE NOTICE 'Sem recursão infinita!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TESTE AGORA O LOGIN NA APLICAÇÃO!';
    RAISE NOTICE '   URL: http://localhost:5174';
    RAISE NOTICE '   Login: admin@clinica.com';
    RAISE NOTICE '   Senha: Clinica123!';
    RAISE NOTICE '==========================================';
END $$;

-- =====================================================
-- TESTE DE FUNCIONALIDADE (Opcional)
-- =====================================================
-- Este teste verifica se a função helper funciona
DO $$
DECLARE
    test_clinic_id UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    func_result BOOLEAN;
BEGIN
    -- Testar a função helper (não deve dar erro de recursão)
    SELECT user_belongs_to_clinic(test_clinic_id) INTO func_result;
    
    RAISE NOTICE '';
    RAISE NOTICE '🧪 TESTE DA FUNÇÃO HELPER:';
    RAISE NOTICE 'user_belongs_to_clinic() executada sem erro!';
    RAISE NOTICE 'Resultado: % (depende do usuário logado)', func_result;
    RAISE NOTICE '';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ ERRO NO TESTE: %', SQLERRM;
END $$;