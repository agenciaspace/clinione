const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jgktfqucfmkjnagfhpzr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna3RmcXVjZm1ram5hZ2ZocHpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzM1NDQsImV4cCI6MjA1MDU0OTU0NH0.9pMdtV-jrpXlYGcRuQbKJOhGOgdNGpJ9YhvXKNjzKNQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClinics() {
  try {
    console.log('🔍 Verificando clínicas no banco de dados...\n');
    
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('id, name, slug, is_published, owner_id, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar clínicas:', error);
      return;
    }
    
    if (!clinics || clinics.length === 0) {
      console.log('❌ Nenhuma clínica encontrada no banco de dados');
      return;
    }
    
    console.log(`✅ Encontradas ${clinics.length} clínica(s):\n`);
    
    clinics.forEach((clinic, index) => {
      console.log(`${index + 1}. ${clinic.name}`);
      console.log(`   ID: ${clinic.id}`);
      console.log(`   Slug: ${clinic.slug || 'Não definido'}`);
      console.log(`   Publicada: ${clinic.is_published ? 'Sim' : 'Não'}`);
      console.log(`   Owner ID: ${clinic.owner_id}`);
      console.log(`   Criada em: ${new Date(clinic.created_at).toLocaleString('pt-BR')}`);
      
      if (clinic.slug) {
        console.log(`   URL Pública: https://clini.one/c/${clinic.slug}`);
      }
      
      console.log('');
    });
    
    // Verificar especificamente o slug "dermatologiaparaiso"
    const dermatologia = clinics.find(c => c.slug === 'dermatologiaparaiso');
    if (dermatologia) {
      console.log('🎯 Clínica "dermatologiaparaiso" encontrada!');
      console.log(`   Status: ${dermatologia.is_published ? 'Publicada' : 'Não publicada'}`);
    } else {
      console.log('❌ Clínica com slug "dermatologiaparaiso" NÃO encontrada');
      console.log('📝 Slugs disponíveis:', clinics.map(c => c.slug).filter(Boolean));
    }
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

checkClinics(); 