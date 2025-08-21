-- Script para criar políticas RLS simples
-- Remove verificação de email das políticas RLS e deixa a UI controlar
-- Execute este SQL no Supabase SQL Editor

-- 1. Remove TODAS as políticas existentes da tabela clinics
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'clinics'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON clinics';
        RAISE NOTICE 'Removed policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- 2. Remove permissões excessivas
REVOKE ALL ON clinics FROM anon;

-- 3. Garante permissões básicas para authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;

-- 4. Cria políticas simples baseadas apenas em owner_id
-- A verificação de email será feita na aplicação/UI

-- Política para SELECT: Ver suas próprias clínicas
CREATE POLICY "users_see_own_clinics" ON clinics
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = owner_id);

-- Política para INSERT: Criar clínicas próprias
CREATE POLICY "users_can_create_clinics" ON clinics
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = owner_id);

-- Política para UPDATE: Atualizar apenas suas próprias clínicas
CREATE POLICY "users_update_own_clinics" ON clinics
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Política para DELETE: Deletar apenas suas próprias clínicas
CREATE POLICY "users_delete_own_clinics" ON clinics
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = owner_id);

-- 5. Verificar se as políticas foram criadas corretamente
SELECT 
    'Políticas criadas com sucesso:' as status,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'clinics'
ORDER BY cmd;