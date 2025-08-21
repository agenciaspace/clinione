-- Script para configurar a senha do usuário leonhatori@gmail.com
-- IMPORTANTE: Substitua 'SUA_SENHA_AQUI' pela senha que você usa em produção

-- Atualizar senha para leonhatori@gmail.com
UPDATE auth.users 
SET encrypted_password = crypt('euteamo12!', gen_salt('bf'))
WHERE email = 'leonhatori@gmail.com';

-- Verificar que a senha foi atualizada
SELECT id, email, updated_at 
FROM auth.users 
WHERE email = 'leonhatori@gmail.com';