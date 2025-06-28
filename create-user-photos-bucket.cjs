const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabasePublicKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabasePublicKey);

async function checkStorageBuckets() {
  try {
    console.log('🧪 Testando acesso aos buckets de storage...\n');
    
    const buckets = ['user-photos', 'clinic-photos', 'doctor-photos'];
    const testFileContent = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    for (const bucketName of buckets) {
      console.log(`📦 Testando bucket "${bucketName}"...`);
      
      const testFilePath = `test-${Date.now()}/test-upload.png`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testFilePath, testFileContent, {
          contentType: 'image/png'
        });
      
      if (uploadError) {
        console.log(`   ❌ ${bucketName}: ${uploadError.message}`);
      } else {
        console.log(`   ✅ ${bucketName}: Funcionando!`);
        
        // Limpar arquivo de teste
        await supabase.storage
          .from(bucketName)
          .remove([testFilePath]);
      }
    }
    
    console.log('\n💡 Soluções possíveis:');
    console.log('1. Criar o bucket "user-photos" manualmente no dashboard do Supabase');
    console.log('2. Usar temporariamente o bucket "clinic-photos" se estiver funcionando');
    console.log('3. Executar a migração SQL para criar o bucket automaticamente');
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

checkStorageBuckets(); 