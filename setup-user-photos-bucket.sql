-- Criar bucket para fotos de usuários se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-photos', 'user-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Criar política para permitir que usuários autenticados façam upload de suas próprias fotos
CREATE POLICY "Users can upload their own photos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Criar política para permitir que usuários autenticados vejam suas próprias fotos
CREATE POLICY "Users can view their own photos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Criar política para permitir que usuários autenticados atualizem suas próprias fotos
CREATE POLICY "Users can update their own photos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Criar política para permitir que usuários autenticados deletem suas próprias fotos
CREATE POLICY "Users can delete their own photos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Permitir acesso público para leitura das fotos (para exibição)
CREATE POLICY "Public can view user photos" ON storage.objects
FOR SELECT USING (bucket_id = 'user-photos'); 