-- SQL para garantir que leonhatori@gmail.com seja owner em todas as clínicas
DO $$
DECLARE
    target_user_id UUID;
    clinic_record RECORD;
BEGIN
    -- Buscar o ID do usuário pelo email
    SELECT id INTO target_user_id
    FROM auth.users 
    WHERE email = 'leonhatori@gmail.com';
    
    -- Verificar se o usuário foi encontrado
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Usuário com email leonhatori@gmail.com não encontrado!';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuário encontrado com ID: %', target_user_id;
    
    -- Para cada clínica existente, garantir que o usuário seja owner
    FOR clinic_record IN SELECT id, name FROM public.clinics LOOP
        -- Verificar se já existe um role para este usuário nesta clínica
        IF EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = target_user_id AND clinic_id = clinic_record.id
        ) THEN
            -- Atualizar role existente para owner
            UPDATE public.user_roles 
            SET role = 'owner', updated_at = NOW()
            WHERE user_id = target_user_id AND clinic_id = clinic_record.id;
            
            RAISE NOTICE 'Role atualizado para owner na clínica: % (ID: %)', clinic_record.name, clinic_record.id;
        ELSE
            -- Inserir novo role como owner
            INSERT INTO public.user_roles (user_id, clinic_id, role, created_at, updated_at)
            VALUES (target_user_id, clinic_record.id, 'owner', NOW(), NOW());
            
            RAISE NOTICE 'Novo role owner criado na clínica: % (ID: %)', clinic_record.name, clinic_record.id;
        END IF;
    END LOOP;
    
    -- Também definir como owner das clínicas na tabela clinics
    UPDATE public.clinics 
    SET owner_id = target_user_id, updated_at = NOW()
    WHERE owner_id IS NULL OR owner_id != target_user_id;
    
    RAISE NOTICE 'Ownership das clínicas atualizado para o usuário';
    
    -- Mostrar resumo final
    RAISE NOTICE 'Operação concluída! Usuário leonhatori@gmail.com agora é owner de % clínicas', 
        (SELECT COUNT(*) FROM public.clinics);
        
END $$;