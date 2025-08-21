-- Script para resetar a senha do usuário leonhatori@gmail.com
-- Este script define a senha como '123456' para teste

-- Atualizar senha para leonhatori@gmail.com
UPDATE auth.users 
SET encrypted_password = crypt('123456', gen_salt('bf'))
WHERE email = 'leonhatori@gmail.com';

-- Verificar que a senha foi atualizada
SELECT id, email, updated_at 
FROM auth.users 
WHERE email = 'leonhatori@gmail.com';