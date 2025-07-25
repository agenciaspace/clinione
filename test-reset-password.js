// Teste do processo de reset de senha
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testResetPassword() {
  console.log('Testando reset de senha...');
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(
    'leonhatori@gmail.com',
    {
      redirectTo: 'https://www.clini.one/reset-password'
    }
  );
  
  if (error) {
    console.error('Erro ao solicitar reset:', error);
  } else {
    console.log('Reset solicitado com sucesso:', data);
  }
}

testResetPassword();