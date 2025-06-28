const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabasePublicKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabasePublicKey);

async function checkUserPhotosStorage() {
  try {
    console.log('🧪 Testando acesso ao bucket "user-photos"...\n');
    
    // Tentar fazer upload de um arquivo de teste
    const testFileContent = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    const testFilePath = 'test-user/test-upload.png';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(testFilePath, testFileContent, {
        contentType: 'image/png'
      });
    
    if (uploadError) {
      console.error('❌ Erro no teste de upload:', uploadError);
      
      if (uploadError.message === 'Bucket not found') {
        console.log('\n🔧 O bucket "user-photos" não existe!');
        console.log('📋 Você precisa criar o bucket manualmente no dashboard do Supabase:');
        console.log('   1. Acesse: https://supabase.com/dashboard/project/tfkchwuphjaauyfqptbk/storage/buckets');
        console.log('   2. Clique em "New bucket"');
        console.log('   3. Nome: user-photos');
        console.log('   4. Marque como "Public bucket"');
        console.log('   5. Clique em "Save"');
      }
    } else {
      console.log('✅ Teste de upload bem-sucedido!');
      console.log(`   Arquivo: ${uploadData.path}`);
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(testFilePath);
      
      console.log(`   URL pública: ${publicUrl}`);
      
      // Limpar arquivo de teste
      const { error: removeError } = await supabase.storage
        .from('user-photos')
        .remove([testFilePath]);
      
      if (removeError) {
        console.log('⚠️ Não foi possível remover o arquivo de teste:', removeError.message);
      } else {
        console.log('🧹 Arquivo de teste removido');
      }
      
      console.log('\n🎉 O bucket "user-photos" está funcionando corretamente!');
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

checkUserPhotosStorage(); 