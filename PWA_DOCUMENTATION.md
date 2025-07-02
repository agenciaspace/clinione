# Clini.One PWA - Documentação

## 🚀 Progressive Web App Implementado

O Clini.One agora é um PWA (Progressive Web App) totalmente funcional, oferecendo uma experiência nativa em todos os dispositivos e sistemas operacionais.

## ✅ Funcionalidades Implementadas

### 1. **Instalação do App**
- ✅ Prompt automático de instalação em dispositivos compatíveis
- ✅ Instruções específicas para iOS (Add to Home Screen)
- ✅ Detecção automática se o app já está instalado
- ✅ Suporte para Android, iOS, Windows, macOS e Linux

### 2. **Funcionamento Offline**
- ✅ Service Worker com cache inteligente
- ✅ Indicador visual de status offline/online
- ✅ Cache de assets estáticos (HTML, CSS, JS, imagens)
- ✅ Cache de fontes do Google Fonts
- ✅ Estratégia Network First para APIs do Supabase

### 3. **Atualizações Automáticas**
- ✅ Detecção automática de novas versões
- ✅ Prompt de atualização não intrusivo
- ✅ Atualização sem perda de dados

### 4. **Ícones e Manifest**
- ✅ Ícones em múltiplas resoluções (64x64, 192x192, 512x512)
- ✅ Ícone maskable para Android
- ✅ Apple Touch Icon para iOS
- ✅ Tema personalizado (#FFD400)
- ✅ Modo standalone (sem barras do navegador)

## 📱 Compatibilidade

### Android
- Chrome 40+
- Firefox 44+
- Samsung Internet 5.0+
- Edge 79+

### iOS
- Safari 11.3+ (iOS 11.3+)
- Chrome for iOS
- Firefox for iOS

### Desktop
- Chrome 45+
- Firefox 44+
- Edge 79+
- Safari 11.1+ (macOS)

## 🛠️ Arquitetura Técnica

### Service Worker
```javascript
// Estratégias de cache implementadas:
- CacheFirst: Assets estáticos e fontes
- NetworkFirst: APIs do Supabase (com fallback)
- StaleWhileRevalidate: Imagens do storage
```

### Manifest
```json
{
  "name": "Clini.One - Gestão de Clínicas",
  "short_name": "Clini.One",
  "theme_color": "#FFD400",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "orientation": "portrait"
}
```

## 🔧 Componentes PWA

### 1. PWAInstallPrompt
- Detecta disponibilidade de instalação
- Mostra instruções específicas por plataforma
- Persiste escolha do usuário

### 2. OfflineIndicator
- Monitora status de conexão
- Feedback visual imediato
- Notificações toast

### 3. PWAUpdatePrompt
- Detecta novas versões
- Permite atualização manual
- Não interrompe o trabalho do usuário

## 📊 Otimizações de Performance

### Cache Strategy
1. **Assets Estáticos**: Cache First (1 ano)
2. **API Calls**: Network First (5 minutos cache)
3. **Imagens**: Cache First (30 dias)
4. **Fontes**: Cache First (1 ano)

### Bundle Size
- Service Worker: ~40KB
- Manifest: < 1KB
- Overhead total: < 50KB

## 🚀 Como Testar

### Desenvolvimento
```bash
npm run dev
# PWA habilitado em desenvolvimento
```

### Produção
```bash
npm run build
npm run preview
```

### Lighthouse Audit
1. Abra o Chrome DevTools
2. Vá para a aba Lighthouse
3. Execute audit PWA
4. Score esperado: 90+

## 📝 Checklist de Funcionalidades

- [x] Service Worker registrado
- [x] Manifest.json válido
- [x] HTTPS habilitado (requerido)
- [x] Ícones em todas resoluções
- [x] Splash screen personalizado
- [x] Funcionamento offline
- [x] Instalável em todos OS
- [x] Atualizações automáticas
- [x] Cache inteligente
- [x] Indicadores visuais
- [x] Compatibilidade iOS
- [x] Background sync ready

## 🔮 Funcionalidades Futuras

1. **Push Notifications**
   - Notificações de agendamentos
   - Lembretes de consultas
   - Alertas importantes

2. **Background Sync**
   - Sincronização offline de dados
   - Upload de fotos em background
   - Fila de ações offline

3. **Share Target**
   - Receber arquivos compartilhados
   - Integração com sistema nativo

## 🐛 Troubleshooting

### App não instala
- Verifique HTTPS
- Limpe cache do navegador
- Verifique console por erros

### Service Worker não atualiza
- Force refresh (Ctrl+Shift+R)
- Clear storage no DevTools
- Unregister SW manualmente

### iOS não mostra prompt
- iOS não suporta prompt automático
- Usuário deve adicionar manualmente
- Instruções são mostradas automaticamente

## 📚 Recursos

- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Workbox Docs](https://developers.google.com/web/tools/workbox)
- [PWA Builder](https://www.pwabuilder.com/) 