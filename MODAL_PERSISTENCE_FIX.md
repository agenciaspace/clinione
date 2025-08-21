# Correção de Recarregamentos e Persistência de Modais

## Problemas Identificados

1. **Recarregamentos Excessivos**: A aplicação sofria com recarregamentos que fechavam modais e perdiam informações
2. **Configurações React Query Inadequadas**: Muitas invalidações desnecessárias causavam refetches excessivos
3. **Falta de Persistência de Estado**: Estados de modais e formulários se perdiam em navegações/recarregamentos
4. **Fechamento Acidental de Modais**: Usuários perdiam dados ao clicar fora ou pressionar ESC acidentalmente

## Soluções Implementadas

### 1. Sistema de Persistência de Modais (`useModalPersistence`)

- **Arquivo**: `src/hooks/useModalPersistence.ts`
- **Funcionalidade**: Persiste estado de modais no sessionStorage
- **Características**:
  - Auto-expiração configurável (padrão: 30 minutos)
  - Restauração automática após recarregamentos
  - Callback de restauração para ações customizadas
  - Limpeza automática de dados expirados

### 2. Sistema de Persistência de Formulários (`useFormPersistence`)

- **Arquivo**: `src/hooks/useFormPersistence.ts`
- **Funcionalidade**: Auto-save de formulários com debounce
- **Características**:
  - Auto-save com delay configurável (padrão: 1 segundo)
  - Restauração automática de dados
  - Suporte a diferentes tipos de input (text, checkbox, number)
  - Indicador de dados "sujos" (modificados)

### 3. Guarda de Navegação (`useNavigationGuard`)

- **Arquivo**: `src/hooks/useNavigationGuard.ts`
- **Funcionalidade**: Previne navegação acidental com dados não salvos
- **Características**:
  - Intercepta beforeunload (fechamento/recarregamento)
  - Intercepta navegação programática
  - Confirmação customizável
  - Navegação segura com verificações

### 4. Otimização React Query

- **Arquivo**: `src/App.tsx`
- **Melhorias**:
  - Aumentado staleTime para 45 minutos
  - Aumentado gcTime para 90 minutos
  - Reduzido tentativas de retry de 3 para 2
  - Configurado refetchOnMount como 'always' para dados atualizados
  - Mantido refetchOnWindowFocus e refetchOnReconnect como false

### 5. Componentes de Dialog Melhorados

- **Arquivos**: 
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/responsive-dialog.tsx`
- **Melhorias**:
  - Adicionado prop `preventClose` (padrão: true)
  - Prevenção de fechamento acidental ao clicar fora
  - Prevenção de fechamento com ESC quando necessário
  - Controle granular de comportamento de fechamento

### 6. Hooks de Mutação Otimizados

- **Arquivo**: `src/hooks/mutations/usePatientMutations.tsx`
- **Melhorias**:
  - Reduzido invalidateQueries desnecessárias
  - Maior uso de atualizações otimistas
  - Melhor tratamento de erros
  - Cache mais inteligente

### 7. Gerenciamento de Pacientes Atualizado

- **Arquivo**: `src/hooks/mutations/usePatientManagement.tsx`
- **Melhorias**:
  - Integração com sistema de persistência
  - Estados de modal persistentes
  - Formulários com auto-save
  - Melhor sincronização de dados

## Benefícios Alcançados

1. **Persistência Robusta**: Modais e formulários mantêm estado entre navegações
2. **Menos Recarregamentos**: Configurações otimizadas reduzem refetches desnecessários
3. **Melhor UX**: Usuários não perdem dados por fechamentos acidentais
4. **Performance**: Cache mais eficiente e menos requisições à API
5. **Confiabilidade**: Sistema mais estável com menos pontos de falha

## Como Usar

### Para Modais com Persistência:

```typescript
const modal = useModalPersistence<DataType>({
  key: 'unique-modal-key',
  maxAge: 30 * 60 * 1000, // 30 minutos
  onRestore: (data) => {
    console.log('Modal restaurado:', data);
  }
});

// Abrir modal
modal.openModal(data);

// Fechar modal
modal.closeModal();

// Estado atual
const isOpen = modal.isOpen;
const modalData = modal.data;
```

### Para Formulários com Auto-save:

```typescript
const form = useFormPersistence({
  key: 'unique-form-key',
  initialValues: { name: '', email: '' },
  onRestore: (data) => {
    console.log('Formulário restaurado:', data);
  },
  onAutoSave: (data) => {
    console.log('Auto-save realizado:', data);
  }
});

// Usar nos inputs
<input 
  name="name"
  value={form.formData.name}
  onChange={form.handleInputChange}
/>
```

### Para Proteção de Navegação:

```typescript
const { safeNavigate } = useNavigationGuard({
  shouldBlock: () => form.isDirty,
  message: 'Você tem alterações não salvas. Deseja sair?',
  onBeforeUnload: () => {
    // Salvar dados antes de sair
  }
});

// Usar para navegação segura
safeNavigate('/outra-pagina');
```

## Configurações Recomendadas

- **Modais**: maxAge de 30-60 minutos
- **Formulários**: autoSaveDelay de 1-2 segundos
- **React Query**: staleTime de 30-45 minutos
- **Dialogs**: preventClose = true para formulários importantes

## Monitoramento

O sistema inclui logs detalhados para monitoramento:
- Restauração de estados
- Auto-saves realizados
- Tentativas de navegação bloqueadas
- Limpeza de dados expirados

Todos os logs são prefixados para fácil identificação no console do navegador.
