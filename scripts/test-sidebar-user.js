// Script de teste para debugar problema do sidebar com usuário específico
// Execute com: node scripts/test-sidebar-user.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://tfkchwuphjaauyfqptbk.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRma2Nod3VwaGphYXV5ZnFwdGJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MzQyMDMsImV4cCI6MjA2MDMxMDIwM30.5hwAMrI2l_1L-DNvgCP3sYyzvxfajzerORY8AnUIZac";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testUserSidebarIssue() {
  console.log('🔍 Testando problema do sidebar para usuário específico...\n');

  try {
    // 1. Verificar dados do usuário problemático
    console.log('1. Verificando usuário valojos367@ofacer.com:');
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('email', 'valojos367@ofacer.com')
      .single();

    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }

    console.log('✅ Usuário encontrado:', {
      id: userData.id,
      email: userData.email,
      metadata_role: userData.raw_user_meta_data?.role
    });

    // 2. Verificar roles do usuário
    console.log('\n2. Verificando roles:');
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('role, clinic_id')
      .eq('user_id', userData.id);

    if (rolesError) {
      console.error('❌ Erro ao buscar roles:', rolesError);
      return;
    }

    console.log('✅ Roles encontrados:', rolesData);

    // 3. Verificar se o role 'owner' está nos menus do sidebar
    const sidebarRoles = {
      'Dashboard': ['owner', 'admin', 'doctor', 'staff', 'receptionist'],
      'Calendário': ['owner', 'admin', 'doctor', 'staff', 'receptionist'],
      'Pacientes': ['owner', 'admin', 'doctor', 'staff', 'receptionist'],
      'Profissionais': ['owner', 'admin'],
      'Relatórios': ['owner', 'admin'],
      'Financeiro': ['owner', 'admin'],
      'Clínica': ['owner', 'admin'],
      'Página Pública': ['owner', 'admin'],
      'Configurações': ['owner', 'admin', 'doctor', 'staff', 'receptionist']
    };

    console.log('\n3. Verificando permissões do sidebar:');
    const userRoles = rolesData.map(r => r.role);
    
    Object.entries(sidebarRoles).forEach(([menu, allowedRoles]) => {
      const hasAccess = userRoles.some(role => allowedRoles.includes(role));
      console.log(`${hasAccess ? '✅' : '❌'} ${menu}: ${hasAccess ? 'ACESSO' : 'SEM ACESSO'}`);
    });

    // 4. Simular lógica do filtro do sidebar
    console.log('\n4. Simulando filtro do sidebar:');
    const filteredMenuItems = userRoles.length === 0 ? 
      Object.keys(sidebarRoles) : 
      Object.entries(sidebarRoles)
        .filter(([menu, allowedRoles]) => 
          userRoles.some(role => allowedRoles.includes(role))
        )
        .map(([menu]) => menu);

    console.log('Items do menu que devem aparecer:', filteredMenuItems);
    console.log('Total de items:', filteredMenuItems.length);

    // 5. Verificar clínica associada
    if (rolesData.some(r => r.clinic_id)) {
      console.log('\n5. Verificando clínica associada:');
      const clinicId = rolesData.find(r => r.clinic_id)?.clinic_id;
      
      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('id, name, owner_id')
        .eq('id', clinicId)
        .single();

      if (clinicError) {
        console.error('❌ Erro ao buscar clínica:', clinicError);
      } else {
        console.log('✅ Clínica encontrada:', {
          id: clinicData.id,
          name: clinicData.name,
          owner_id: clinicData.owner_id,
          isOwner: clinicData.owner_id === userData.id
        });
      }
    }

    // 6. Comparar com usuário que funciona
    console.log('\n6. Comparando com usuário leonhatori@gmail.com:');
    const { data: workingUserData } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data')
      .eq('email', 'leonhatori@gmail.com')
      .single();

    const { data: workingRolesData } = await supabase
      .from('user_roles')
      .select('role, clinic_id')
      .eq('user_id', workingUserData.id);

    console.log('Usuário que funciona:');
    console.log('- Metadata role:', workingUserData.raw_user_meta_data?.role);
    console.log('- DB roles:', workingRolesData.map(r => r.role));
    console.log('- Clinic associations:', workingRolesData.map(r => r.clinic_id));

    console.log('\nUsuário com problema:');
    console.log('- Metadata role:', userData.raw_user_meta_data?.role);
    console.log('- DB roles:', rolesData.map(r => r.role));
    console.log('- Clinic associations:', rolesData.map(r => r.clinic_id));

    // 7. Conclusão
    console.log('\n📊 RESUMO DO DIAGNÓSTICO:');
    console.log('='.repeat(50));
    
    if (filteredMenuItems.length > 0) {
      console.log('✅ O usuário DEVERIA ver o sidebar');
      console.log('❌ Mas não está vendo = BUG na interface');
      console.log('\n🔧 POSSÍVEIS CAUSAS:');
      console.log('- CSS/breakpoint responsivo');
      console.log('- Conditional rendering incorreto');
      console.log('- AuthContext não carregando roles corretamente');
      console.log('- Problema de timing no carregamento');
    } else {
      console.log('❌ O usuário NÃO deveria ver o sidebar');
      console.log('✅ Comportamento correto');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testUserSidebarIssue();