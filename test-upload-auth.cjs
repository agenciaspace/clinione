const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabasePublicKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabasePublicKey);

async function testAuthenticatedUpload() {
  try {
    console.log('🔐 Testando upload com autenticação...\n');
    
    // Primeiro, vamos tentar fazer login
    console.log('📝 Você precisa fazer login para testar o upload.');
    console.log('💡 Vamos simular um teste sem autenticação primeiro...\n');
    
    // Criar um arquivo de teste
    const testFileContent = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Testar upload no bucket clinic-photos
    const testFilePath = `user-profiles/test-user-${Date.now()}/test-upload.png`;
    
    console.log(`📦 Testando upload em: ${testFilePath}`);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('clinic-photos')
      .upload(testFilePath, testFileContent, {
        contentType: 'image/png'
      });
    
    if (uploadError) {
      console.log('❌ Erro no upload:', uploadError);
      
      if (uploadError.message.includes('row-level security')) {
        console.log('\n🔒 Problema de RLS (Row Level Security)');
        console.log('📋 As políticas do bucket clinic-photos exigem autenticação.');
        console.log('💡 Soluções:');
        console.log('   1. Criar o bucket user-photos (recomendado)');
        console.log('   2. Modificar as políticas RLS do clinic-photos');
        console.log('   3. Testar com usuário autenticado');
      }
    } else {
      console.log('✅ Upload bem-sucedido!');
      console.log(`   Arquivo: ${uploadData.path}`);
      
      // Limpar arquivo de teste
      await supabase.storage
        .from('clinic-photos')
        .remove([testFilePath]);
      
      console.log('🧹 Arquivo de teste removido');
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('1. Acesse o dashboard do Supabase');
    console.log('2. Vá para Storage > Buckets');
    console.log('3. Crie um novo bucket chamado "user-photos"');
    console.log('4. Configure como público');
    console.log('5. Defina limite de 5MB e tipos MIME: image/png, image/jpeg');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

testAuthenticatedUpload(); 