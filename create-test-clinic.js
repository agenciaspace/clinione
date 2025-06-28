// Script to create a test clinic
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tfkchwuphjaauyfqptbk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczNDIwMywiZXhwIjoyMDYwMzEwMjAzfQ.5NaWPgxJxCxhEJxWODTiQBR4XXVF2ckxQnRWIgUYa-I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestClinic() {
  const slug = 'dermatologiaparaiso';
  
  console.log('🏥 Criando clínica de teste com slug:', slug);
  
  try {
    // First check if it already exists
    const { data: existing } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
      
    if (existing) {
      console.log('✅ Clínica já existe:', existing);
      
      // Update to make sure it's published
      const { error: updateError } = await supabase
        .from('clinics')
        .update({ 
          is_published: true,
          last_published_at: new Date().toISOString()
        })
        .eq('id', existing.id);
        
      if (updateError) {
        console.error('❌ Erro ao atualizar clínica:', updateError);
      } else {
        console.log('✅ Clínica atualizada para publicada');
      }
      
      return existing;
    }
    
    // Create new clinic
    const clinicData = {
      name: 'Dermatologia Paraíso',
      slug: slug,
      address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
      phone: '(11) 99999-9999',
      email: 'contato@dermatologiaparaiso.com.br',
      description: 'Clínica especializada em dermatologia com profissionais qualificados e equipamentos modernos.',
      is_published: true,
      last_published_at: new Date().toISOString(),
      owner_id: '00000000-0000-0000-0000-000000000000' // Placeholder owner
    };
    
    const { data: newClinic, error: createError } = await supabase
      .from('clinics')
      .insert(clinicData)
      .select()
      .single();
      
    if (createError) {
      console.error('❌ Erro ao criar clínica:', createError);
      return null;
    }
    
    console.log('✅ Clínica criada com sucesso:', newClinic);
    
    // Create a test doctor
    const doctorData = {
      name: 'Dr. João Silva',
      speciality: 'Dermatologia',
      bio: 'Especialista em dermatologia clínica e cirúrgica com mais de 10 anos de experiência.',
      clinic_id: newClinic.id
    };
    
    const { data: doctor, error: doctorError } = await supabase
      .from('doctors')
      .insert(doctorData)
      .select()
      .single();
      
    if (doctorError) {
      console.error('❌ Erro ao criar médico:', doctorError);
    } else {
      console.log('✅ Médico criado:', doctor);
    }
    
    return newClinic;
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    return null;
  }
}

createTestClinic(); 