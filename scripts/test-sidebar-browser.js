// Teste de sidebar para executar no console do browser
// Cole este código no console quando logado como valojos367@ofacer.com

console.log('🔍 TESTE DE SIDEBAR - USUÁRIO valojos367@ofacer.com');
console.log('='.repeat(60));

// 1. Verificar roles carregados
console.log('\n1. VERIFICANDO ROLES:');
// Procurar por logs do AuthContext
const roleLogs = performance.getEntriesByType('navigation');
console.log('- Procure por logs "User roles loaded:" no console');
console.log('- Deve mostrar: ["owner"]');

// 2. Verificar breakpoint
console.log('\n2. VERIFICANDO BREAKPOINT:');
console.log('- Window width:', window.innerWidth);
console.log('- Viewport override:', localStorage.getItem('devViewportOverride'));
console.log('- Breakpoint esperado: desktop (para width >= 1024px)');

// 3. Verificar elementos DOM
console.log('\n3. VERIFICANDO DOM:');
const sidebar = document.querySelector('aside');
const sidebarContainer = document.querySelector('.w-64');
const dashboardLayout = document.querySelector('[class*="flex h-screen"]');

console.log('- Sidebar <aside>:', !!sidebar);
console.log('- Sidebar container (.w-64):', !!sidebarContainer);
console.log('- Dashboard layout:', !!dashboardLayout);

if (sidebarContainer) {
  console.log('- Container classes:', sidebarContainer.className);
  console.log('- Container display:', getComputedStyle(sidebarContainer).display);
  console.log('- Container position:', sidebarContainer.getBoundingClientRect());
}

// 4. Verificar CSS computado
if (sidebar) {
  console.log('\n4. VERIFICANDO CSS DO SIDEBAR:');
  const styles = getComputedStyle(sidebar);
  console.log('- display:', styles.display);
  console.log('- visibility:', styles.visibility);
  console.log('- opacity:', styles.opacity);
  console.log('- width:', styles.width);
  console.log('- height:', styles.height);
  console.log('- position:', styles.position);
  console.log('- z-index:', styles.zIndex);
  
  const rect = sidebar.getBoundingClientRect();
  console.log('- Posição na tela:', {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height
  });
}

// 5. Testar forçar visibilidade
console.log('\n5. FORÇANDO VISIBILIDADE:');
if (sidebarContainer && sidebar) {
  // Remover todas as classes que podem estar escondendo
  sidebarContainer.classList.remove('hidden');
  sidebarContainer.style.display = 'block';
  sidebarContainer.style.visibility = 'visible';
  sidebarContainer.style.opacity = '1';
  
  // Fazer o sidebar bem visível
  sidebar.style.backgroundColor = 'red';
  sidebar.style.position = 'fixed';
  sidebar.style.top = '0';
  sidebar.style.left = '0';
  sidebar.style.zIndex = '9999';
  sidebar.style.width = '300px';
  sidebar.style.height = '100vh';
  
  console.log('✅ Aplicados estilos forçados');
  console.log('❓ Você vê uma barra vermelha do lado esquerdo?');
} else {
  console.log('❌ Sidebar ou container não encontrados');
}

// 6. Verificar se há outros elementos cobrindo
console.log('\n6. VERIFICANDO ELEMENTOS QUE PODEM ESTAR COBRINDO:');
const elementsAtTop = document.elementsFromPoint(0, 0);
console.log('- Elementos no canto superior esquerdo:', elementsAtTop.map(el => el.tagName + '.' + el.className).slice(0, 5));

// 7. Verificar conteúdo do sidebar
if (sidebar) {
  console.log('\n7. CONTEÚDO DO SIDEBAR:');
  const menuItems = sidebar.querySelectorAll('a, button');
  console.log('- Total de itens de menu:', menuItems.length);
  menuItems.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.textContent?.trim() || 'Item sem texto'}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🏁 TESTE CONCLUÍDO');
console.log('📋 PRÓXIMOS PASSOS:');
console.log('1. Verificar se há logs "User roles loaded: [owner]"');
console.log('2. Confirmar se vê barra vermelha após forçar estilos');
console.log('3. Relatar resultados para debugging');
console.log('='.repeat(60));