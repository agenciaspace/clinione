-- Correção das políticas RLS para serem específicas e seguras
-- Execute este SQL no Supabase SQL Editor

-- 1. Remove a política ultra-permissiva que criamos
DROP POLICY IF EXISTS "allow_all_inserts_to_clinics" ON clinics;

-- 2. Remove permissões excessivas que concedemos
REVOKE ALL ON clinics FROM anon;

-- 3. Garante que apenas authenticated tem permissões básicas
GRANT SELECT, INSERT, UPDATE, DELETE ON clinics TO authenticated;

-- 4. Cria políticas RLS específicas e seguras

-- Política para INSERT: Apenas usuários com email confirmado
CREATE POLICY "verified_users_can_create_clinics" ON clinics
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        -- Verifica se o usuário existe e tem email confirmado
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
        -- E garante que está definindo a si mesmo como owner
        AND auth.uid() = owner_id
    );

-- Política para SELECT: Usuários veem apenas suas próprias clínicas
CREATE POLICY "users_see_own_clinics" ON clinics
    FOR SELECT 
    TO authenticated 
    USING (
        auth.uid() = owner_id 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
    );

-- Política para UPDATE: Usuários atualizam apenas suas próprias clínicas
CREATE POLICY "users_update_own_clinics" ON clinics
    FOR UPDATE 
    TO authenticated 
    USING (
        auth.uid() = owner_id 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
    )
    WITH CHECK (
        auth.uid() = owner_id
    );

-- Política para DELETE: Usuários deletam apenas suas próprias clínicas
CREATE POLICY "users_delete_own_clinics" ON clinics
    FOR DELETE 
    TO authenticated 
    USING (
        auth.uid() = owner_id 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
    );

-- 5. Aplicar políticas similares para user_roles
DROP POLICY IF EXISTS "Allow authenticated users to manage roles" ON user_roles;

-- Política para user_roles - apenas usuários verificados
CREATE POLICY "verified_users_manage_own_roles" ON user_roles
    FOR ALL 
    TO authenticated 
    USING (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email_confirmed_at IS NOT NULL
        )
    )
    WITH CHECK (
        auth.uid() = user_id
    );

-- 6. Verificar as novas políticas
SELECT 
    'Políticas seguras criadas:' as status,
    tablename,
    policyname,
    cmd,
    with_check
FROM pg_policies 
WHERE tablename IN ('clinics', 'user_roles')
ORDER BY tablename, cmd;