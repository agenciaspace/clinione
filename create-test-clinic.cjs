const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://jgktfqucfmkjnagfhpzr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impna3RmcXVjZm1ram5hZ2ZocHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk3MzU0NCwiZXhwIjoyMDUwNTQ5NTQ0fQ.xYOPMYZuFEWQdBv6Kaw3CjXTn-rHEYGaC6YnJA1JZXM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestClinic() {
  try {
    console.log('🏥 Criando clínica de teste "Dermatologia Paraíso"...\n');
    
    // Primeiro, verificar se já existe
    const { data: existingClinic } = await supabase
      .from('clinics')
      .select('*')
      .eq('slug', 'dermatologiaparaiso')
      .single();
    
    if (existingClinic) {
      console.log('✅ Clínica já existe!');
      console.log(`   Nome: ${existingClinic.name}`);
      console.log(`   Slug: ${existingClinic.slug}`);
      console.log(`   Publicada: ${existingClinic.is_published ? 'Sim' : 'Não'}`);
      
      if (!existingClinic.is_published) {
        console.log('\n📢 Publicando clínica...');
        const { error: updateError } = await supabase
          .from('clinics')
          .update({ is_published: true })
          .eq('id', existingClinic.id);
        
        if (updateError) {
          console.error('❌ Erro ao publicar:', updateError);
        } else {
          console.log('✅ Clínica publicada com sucesso!');
        }
      }
      
      return;
    }
    
    // Criar nova clínica
    const clinicData = {
      name: 'Dermatologia Paraíso',
      slug: 'dermatologiaparaiso',
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo - SP',
      phone: '(11) 99999-9999',
      email: 'contato@dermatologiaparaiso.com.br',
      website: 'https://dermatologiaparaiso.com.br',
      description: 'Clínica especializada em dermatologia estética e clínica, oferecendo os melhores tratamentos para a saúde e beleza da sua pele.',
      is_published: true,
      owner_id: '00000000-0000-0000-0000-000000000000', // ID temporário
      working_hours: {
        monday: [{ start: '08:00', end: '18:00' }],
        tuesday: [{ start: '08:00', end: '18:00' }],
        wednesday: [{ start: '08:00', end: '18:00' }],
        thursday: [{ start: '08:00', end: '18:00' }],
        friday: [{ start: '08:00', end: '18:00' }],
        saturday: [{ start: '08:00', end: '13:00' }],
        sunday: []
      }
    };
    
    const { data: newClinic, error } = await supabase
      .from('clinics')
      .insert(clinicData)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar clínica:', error);
      return;
    }
    
    console.log('✅ Clínica criada com sucesso!');
    console.log(`   ID: ${newClinic.id}`);
    console.log(`   Nome: ${newClinic.name}`);
    console.log(`   Slug: ${newClinic.slug}`);
    console.log(`   URL: https://clini.one/c/${newClinic.slug}`);
    
    // Criar alguns médicos de exemplo
    console.log('\n👨‍⚕️ Criando médicos de exemplo...');
    
    const doctors = [
      {
        name: 'Dr. João Silva',
        speciality: 'Dermatologia Clínica',
        bio: 'Especialista em dermatologia clínica com mais de 15 anos de experiência.',
        clinic_id: newClinic.id,
        phone: '(11) 99999-1111',
        email: 'joao@dermatologiaparaiso.com.br'
      },
      {
        name: 'Dra. Maria Santos',
        speciality: 'Dermatologia Estética',
        bio: 'Especialista em procedimentos estéticos e rejuvenescimento facial.',
        clinic_id: newClinic.id,
        phone: '(11) 99999-2222',
        email: 'maria@dermatologiaparaiso.com.br'
      }
    ];
    
    const { data: createdDoctors, error: doctorsError } = await supabase
      .from('doctors')
      .insert(doctors)
      .select();
    
    if (doctorsError) {
      console.error('❌ Erro ao criar médicos:', doctorsError);
    } else {
      console.log(`✅ ${createdDoctors.length} médicos criados com sucesso!`);
    }
    
    console.log('\n🎉 Tudo pronto! A clínica está disponível em:');
    console.log(`   https://clini.one/c/dermatologiaparaiso`);
    
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
  }
}

createTestClinic(); 