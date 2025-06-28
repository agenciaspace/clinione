// Debug script to check clinic data
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugClinic() {
  const slug = 'dermatologiaparaiso';
  
  console.log('🔍 Verificando clínica com slug:', slug);
  
  try {
    // Check all clinics with this slug
    const { data: allClinics, error: allError } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug);
      
    console.log('📋 Todas as clínicas com esse slug:', allClinics);
    console.log('❌ Erro na busca:', allError);
    
    // Check published clinics
    const { data: publishedClinics, error: pubError } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true);
      
    console.log('📋 Clínicas publicadas com esse slug:', publishedClinics);
    console.log('❌ Erro na busca de publicadas:', pubError);
    
    // Check all clinics to see what slugs exist
    const { data: allSlugs, error: slugsError } = await supabase
      .from('clinics')
      .select('id, name, slug, is_published')
      .not('slug', 'is', null);
      
    console.log('📋 Todos os slugs existentes:', allSlugs);
    console.log('❌ Erro na busca de slugs:', slugsError);
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

debugClinic(); 