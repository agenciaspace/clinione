#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase de produção
const SUPABASE_URL = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY não encontrada!');
  console.log('Por favor, defina a variável de ambiente SUPABASE_SERVICE_KEY com a service key do seu projeto Supabase.');
  console.log('\nPara obter a service key:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Selecione seu projeto');
  console.log('3. Vá para Settings > API');
  console.log('4. Copie a "service_role key" (não a anon key)');
  console.log('\nDepois execute:');
  console.log('export SUPABASE_SERVICE_KEY="sua-service-key-aqui"');
  console.log('node scripts/create-doctor-photos-bucket.js');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDoctorPhotosBucket() {
  console.log('🚀 Criando bucket doctor-photos...');

  try {
    // Verificar se o bucket já existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.id === 'doctor-photos');

    if (bucketExists) {
      console.log('✅ Bucket doctor-photos já existe!');
      
      // Atualizar configurações do bucket
      const { error: updateError } = await supabase.storage.updateBucket('doctor-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (updateError) {
        console.error('❌ Erro ao atualizar bucket:', updateError);
      } else {
        console.log('✅ Configurações do bucket atualizadas!');
      }
    } else {
      // Criar novo bucket
      const { data, error: createError } = await supabase.storage.createBucket('doctor-photos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError);
      } else {
        console.log('✅ Bucket doctor-photos criado com sucesso!');
      }
    }

    console.log('\n📋 Configurações do bucket:');
    console.log('- Nome: doctor-photos');
    console.log('- Público: Sim');
    console.log('- Tamanho máximo: 5MB');
    console.log('- Tipos permitidos: JPEG, PNG, GIF, WebP');
    
    console.log('\n✨ Tudo pronto! Os médicos agora podem fazer upload de suas fotos de perfil.');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

createDoctorPhotosBucket();
