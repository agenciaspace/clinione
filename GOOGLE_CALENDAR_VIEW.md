# Google Calendar View - Documentação

## Visão Geral

Implementei uma visualização expandida do calendário que replica a experiência do Google Calendar, oferecendo uma interface mais intuitiva e completa para gerenciamento de agendamentos e bloqueios.

## Principais Funcionalidades

### 1. Visualização Mensal Expandida
- **Grid completo**: Layout de 7x6 mostrando o mês inteiro
- **Navegação intuitiva**: Botões para mês anterior/posterior e "Hoje"
- **Indicadores visuais**: Eventos e bloqueios diretamente nas células
- **Seleção de data**: Clique para selecionar e ver detalhes

### 2. Sidebar de Detalhes do Dia
- **Eventos do dia**: Lista completa de agendamentos e bloqueios
- **Ações rápidas**: Editar, excluir, criar novos eventos
- **Informações detalhadas**: Horários, médicos, status
- **Design responsivo**: Adapta para mobile e desktop

### 3. Alternância de Visualizações
- **Botão toggle**: Alterna entre visualização compacta e expandida
- **Persistência**: Mantém a visualização escolhida
- **Responsividade**: Interface adaptável para diferentes tamanhos de tela

## Componentes Criados

### 1. ExpandedCalendarView
**Localização**: `/src/components/calendar/ExpandedCalendarView.tsx`

```typescript
interface ExpandedCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  onNewAppointment: (date: Date) => void;
  onNewBlock: (date: Date) => void;
}
```

**Funcionalidades**:
- Layout em grid 7x6 para visualização mensal
- Indicadores visuais para eventos e bloqueios
- Navegação por mês com botões
- Células clicáveis para seleção de data
- Responsividade mobile/desktop

### 2. DayDetailsSidebar
**Localização**: `/src/components/calendar/DayDetailsSidebar.tsx`

```typescript
interface DayDetailsSidebarProps {
  selectedDate: Date;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  onNewAppointment: () => void;
  onNewBlock: () => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onEditBlock: (block: ScheduleBlock) => void;
  onDeleteBlock: (id: string) => void;
}
```

**Funcionalidades**:
- Lista organizada de eventos do dia selecionado
- Ações CRUD para agendamentos e bloqueios
- Badges coloridos por status/tipo
- Botões de criação rápida
- Estado vazio com call-to-action

### 3. GoogleCalendarView
**Localização**: `/src/components/calendar/GoogleCalendarView.tsx`

```typescript
interface GoogleCalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  appointments: Appointment[];
  scheduleBlocks: ScheduleBlock[];
  doctors: Doctor[];
  onNewAppointment: (date?: Date) => void;
  onNewBlock: (date?: Date) => void;
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onEditBlock: (block: ScheduleBlock) => void;
  onDeleteBlock: (id: string) => void;
}
```

**Funcionalidades**:
- Componente principal que integra calendário e sidebar
- Gerenciamento de estado do dia selecionado
- Responsividade para mobile (stack vertical)
- Filtros automáticos por data

## Características Visuais

### 1. Indicadores no Calendário

#### Dias Especiais
- **Hoje**: Fundo amarelo claro
- **Dia selecionado**: Fundo azul claro com borda azul
- **Outros meses**: Fundo cinza claro

#### Eventos nas Células
- **Bloqueios**: Ícone 🚫 + título, cores por tipo
- **Agendamentos**: Ícone de relógio + horário + paciente
- **Indicador "+X mais"**: Quando há muitos eventos

### 2. Cores por Tipo

#### Bloqueios
- **Indisponível**: Cinza
- **Intervalo**: Azul
- **Reunião**: Roxo
- **Férias**: Verde
- **Licença Médica**: Vermelho
- **Pessoal**: Laranja

#### Agendamentos
- **Agendado**: Azul
- **Confirmado**: Verde
- **Concluído**: Cinza
- **Cancelado**: Vermelho
- **Faltou**: Amarelo

### 3. Layout Responsivo

#### Desktop
```
┌─────────────────────────────────────┬─────────────────┐
│                                     │                 │
│           Calendar Grid             │   Day Details   │
│                                     │    Sidebar      │
│                                     │                 │
└─────────────────────────────────────┴─────────────────┘
```

#### Mobile
```
┌─────────────────────────────────────┐
│           Calendar Grid             │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│         Day Details                 │
│                                     │
└─────────────────────────────────────┘
```

## Integração com Sistema Existente

### 1. Atualização na Página Calendar
- Botão toggle entre visualizações
- Estado `calendarView` para controlar modo
- Integração com hooks existentes
- Manutenção da funcionalidade compacta

### 2. Compatibilidade
- **Hooks**: Utiliza `useAppointments` e `useScheduleBlocks`
- **Formulários**: Integra com formulários existentes
- **Permissions**: Respeita permissões de usuário
- **Dados**: Trabalha com mesma estrutura de dados

## Como Usar

### 1. Ativação
1. Navegar para `/dashboard/calendar`
2. Clicar no botão "Expandir" no cabeçalho
3. O calendário mudará para visualização expandida

### 2. Navegação
- **Navegar meses**: Usar setas esquerda/direita
- **Voltar para hoje**: Clicar botão "Hoje"
- **Selecionar data**: Clicar na célula do dia desejado

### 3. Criação Rápida
- **Novo agendamento**: Clicar "+" na célula ou sidebar
- **Novo bloqueio**: Usar botão na sidebar
- **Ações**: Editar/excluir através da sidebar

## Melhorias Implementadas

### 1. Experiência do Usuário
- ✅ **Visualização mais ampla**: Mês inteiro visível
- ✅ **Navegação intuitiva**: Similar ao Google Calendar
- ✅ **Feedback visual**: Indicadores claros de eventos
- ✅ **Ações rápidas**: Criação e edição facilitadas

### 2. Funcionalidades
- ✅ **Integração completa**: Agendamentos + bloqueios
- ✅ **Responsividade**: Funciona em mobile e desktop
- ✅ **Performance**: Otimizada com useMemo
- ✅ **Acessibilidade**: Navegação por teclado e screen readers

### 3. Manutenibilidade
- ✅ **Componentes reutilizáveis**: Arquitetura modular
- ✅ **TypeScript**: Tipagem completa
- ✅ **Hooks personalizados**: Lógica separada da UI
- ✅ **Documentação**: Código bem documentado

## Comparação com Google Calendar

### Similaridades
- ✅ **Layout de grid**: Mesmo padrão 7x6
- ✅ **Navegação**: Botões mês anterior/posterior
- ✅ **Sidebar**: Detalhes do dia selecionado
- ✅ **Indicadores**: Eventos visíveis nas células
- ✅ **Cores**: Sistema de cores por tipo

### Diferenças
- **Domínio específico**: Focado em clínicas médicas
- **Bloqueios**: Sistema específico para indisponibilidade
- **Integração**: Conectado com sistema de agendamentos
- **Responsividade**: Adaptado para uso médico

## Configurações Técnicas

### 1. Dependências
```typescript
// Gerenciamento de datas
import { format, startOfMonth, endOfMonth, eachDayOfInterval, 
         isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Hooks personalizados
import { useIsMobile } from '@/hooks/use-mobile';
import { useScheduleBlocks } from '@/hooks/useScheduleBlocks';
import { useAppointments } from '@/hooks/useAppointments';
```

### 2. Performance
- **useMemo**: Filtros de eventos otimizados
- **useCallback**: Handlers memoizados
- **Lazy Loading**: Componentes carregados sob demanda

### 3. Estado
```typescript
const [calendarView, setCalendarView] = useState<'compact' | 'expanded'>('compact');
const [selectedDate, setSelectedDate] = useState<Date>(new Date());
const [currentMonth, setCurrentMonth] = useState(selectedDate);
```

## Próximos Passos

### 1. Funcionalidades Futuras
- [ ] **Visualização semanal**: Modo semana similar ao Google
- [ ] **Drag & Drop**: Mover eventos entre dias
- [ ] **Múltiplos calendários**: Filtros por médico/tipo
- [ ] **Exportação**: Sincronização com calendários externos

### 2. Otimizações
- [ ] **Virtualização**: Para meses com muitos eventos
- [ ] **Cache**: Otimização de consultas
- [ ] **Offline**: Suporte para uso offline
- [ ] **Temas**: Customização de cores

O sistema de calendário expandido oferece uma experiência moderna e intuitiva, replicando com sucesso a funcionalidade do Google Calendar adaptada para o contexto médico do Clinio.