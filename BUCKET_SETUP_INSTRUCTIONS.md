# Setup do Bucket user-photos no Supabase

## Problema
O bucket `user-photos` não existe no Supabase Storage, causando erro 404 ao tentar fazer upload de fotos de perfil.

## Solução Manual

### 1. Acessar o Dashboard do Supabase
- Acesse: https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk/storage/buckets

### 2. Criar o Bucket
1. Clique em **"New bucket"**
2. **Nome**: `user-photos`
3. **Marque** a opção **"Public bucket"**
4. Clique em **"Save"**

### 3. Configurar Políticas (Opcional)
Se desejar configurar políticas mais específicas, execute a migração SQL:

```sql
-- Executar no SQL Editor do Supabase
-- https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk/sql/new

-- Criar bucket para fotos de usuários
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Políticas de segurança
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view user photos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-photos');
```

## Verificação
Após criar o bucket, você pode testar executando:
```bash
node create-user-photos-bucket.cjs
```

## Estrutura de Arquivos
Os arquivos serão organizados como:
```
user-photos/
├── {user-id-1}/
│   ├── profile-1234567890.png
│   └── profile-1234567891.jpg
├── {user-id-2}/
│   └── profile-1234567892.png
└── ...
```

## Status
- ❌ Bucket não existe
- ⏳ Aguardando criação manual
- ✅ Funcionará após criação 