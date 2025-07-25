// Script de teste de autenticação
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('Testing login with leonhatori@gmail.com...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'leonhatori@gmail.com',
    password: '123456'
  });
  
  if (error) {
    console.error('Login failed:', error);
  } else {
    console.log('Login successful!', data);
  }
}

testLogin();