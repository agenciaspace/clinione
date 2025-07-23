// Script para sincronizar usuário específico para produção
import { createClient } from '@supabase/supabase-js';

// Configuração local
const localSupabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
);

// Configuração produção (apenas para service role - NÃO commitar)
const prodSupabase = createClient(
  'https://tfkchwuphjaauyfqptbk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac'
);

async function checkUserInProduction() {
  const email = 'leonhatori@gmail.com';
  
  console.log('🔍 Verificando usuário em produção...');
  
  try {
    // Tentar fazer login para verificar se o usuário existe
    const { data, error } = await prodSupabase.auth.signInWithPassword({
      email: email,
      password: '123456' // senha padrão de teste
    });
    
    if (error) {
      console.log('❌ Erro ao fazer login:', error.message);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('📧 Usuário pode não existir ou senha pode estar incorreta');
        console.log('💡 Sugestões:');
        console.log('1. Verifique se o usuário existe no dashboard do Supabase');
        console.log('2. Tente resetar a senha do usuário');
        console.log('3. Verifique se o email está confirmado');
      }
      
      if (error.message.includes('rate limit')) {
        console.log('⏰ Rate limit atingido - aguarde alguns minutos');
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.user?.email);
      
      // Logout imediatamente
      await prodSupabase.auth.signOut();
    }
    
  } catch (err) {
    console.error('🚨 Erro geral:', err);
  }
}

async function checkLocalUser() {
  const email = 'leonhatori@gmail.com';
  
  console.log('🏠 Verificando usuário local...');
  
  try {
    const { data, error } = await localSupabase.auth.signInWithPassword({
      email: email,
      password: '123456'
    });
    
    if (error) {
      console.log('❌ Erro local:', error.message);
    } else {
      console.log('✅ Login local bem-sucedido!');
      console.log('👤 Usuário local:', data.user?.email);
      
      await localSupabase.auth.signOut();
    }
    
  } catch (err) {
    console.error('🚨 Erro local:', err);
  }
}

async function main() {
  console.log('=== DIAGNÓSTICO DE AUTENTICAÇÃO ===\n');
  
  await checkLocalUser();
  console.log('\n---\n');
  await checkUserInProduction();
  
  console.log('\n=== PRÓXIMOS PASSOS ===');
  console.log('1. Acesse o dashboard do Supabase em produção');
  console.log('2. Verifique a aba Authentication > Users');
  console.log('3. Confirme se leonhatori@gmail.com existe');
  console.log('4. Verifique se o email está confirmado');
  console.log('5. Resete a senha se necessário');
}

main();