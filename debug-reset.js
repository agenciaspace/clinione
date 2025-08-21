// Debug script para testar reset de senha
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugReset() {
  console.log('🔍 Testando reset sem redirectTo...');
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    'teste123@gmail.com'  // Use um e-mail de teste
  );
  
  if (error) {
    console.error('❌ Erro:', error);
  } else {
    console.log('✅ Sucesso:', data);
    console.log('📧 Verifique o e-mail enviado');
  }
}

debugReset();