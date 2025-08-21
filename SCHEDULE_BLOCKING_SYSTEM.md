# Sistema de Bloqueio de Agenda - Documentação Completa

## Visão Geral

O sistema de bloqueio de agenda do Clinio permite que médicos marquem períodos de indisponibilidade, similar ao sistema "out of office" do Google Calendar. Este sistema garante que não sejam marcados agendamentos durante períodos bloqueados.

## Funcionalidades Implementadas

### 1. Tipos de Bloqueios

- **Indisponível**: Período geral de indisponibilidade
- **Intervalo**: Pausas durante o dia de trabalho
- **Reunião**: Reuniões médicas ou administrativas
- **Férias**: Períodos de férias
- **Licença Médica**: Afastamentos médicos
- **Pessoal**: Compromissos pessoais

### 2. Características dos Bloqueios

- **Data e Hora**: Início e fim específicos
- **Médico**: Associado a um profissional específico
- **Recorrência**: Suporte para bloqueios recorrentes
- **Descrição**: Campo opcional para detalhes
- **Validação**: Prevenção de sobreposições

### 3. Integração com Calendário

- **Indicadores Visuais**: Dias com bloqueios aparecem em vermelho
- **Lista de Bloqueios**: Mostra bloqueios ativos para a data selecionada
- **Validação de Conflitos**: Impede agendamentos em horários bloqueados

## Componentes Principais

### 1. ScheduleBlockForm
**Localização**: `/src/components/appointments/ScheduleBlockForm.tsx`

- Formulário para criar/editar bloqueios
- Seleção de médico, tipo, data e hora
- Configurações de recorrência
- Validação de dados

### 2. ScheduleBlockManager
**Localização**: `/src/components/appointments/ScheduleBlockManager.tsx`

- Interface de gerenciamento de bloqueios
- CRUD completo (Create, Read, Update, Delete)
- Listagem com filtros
- Integração com dialogs

### 3. ScheduleBlocksList
**Localização**: `/src/components/appointments/ScheduleBlocksList.tsx`

- Lista de bloqueios ativos para data específica
- Informações resumidas dos bloqueios
- Indicadores visuais por tipo

### 4. useScheduleBlocks Hook
**Localização**: `/src/hooks/useScheduleBlocks.tsx`

- Hook para gerenciamento de estado
- Operações CRUD
- Verificação de conflitos
- Filtros por data e médico

## Estrutura do Banco de Dados

### Tabela: schedule_blocks

```sql
CREATE TABLE schedule_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  block_type TEXT NOT NULL DEFAULT 'unavailable',
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Índices para Performance

- `idx_schedule_blocks_doctor_id`: Consultas por médico
- `idx_schedule_blocks_clinic_id`: Consultas por clínica
- `idx_schedule_blocks_datetime`: Consultas por período
- `idx_schedule_blocks_type`: Consultas por tipo

## Funcionalidades Avançadas

### 1. Validação de Conflitos

```typescript
const isTimeSlotBlocked = (doctorId: string, startTime: string, endTime: string) => {
  const doctorBlocks = scheduleBlocks.filter(block => block.doctor_id === doctorId);
  
  return doctorBlocks.some(block => {
    const blockStart = new Date(block.start_datetime);
    const blockEnd = new Date(block.end_datetime);
    const slotStart = new Date(startTime);
    const slotEnd = new Date(endTime);

    // Verifica sobreposição
    return (
      (slotStart >= blockStart && slotStart < blockEnd) ||
      (slotEnd > blockStart && slotEnd <= blockEnd) ||
      (slotStart <= blockStart && slotEnd >= blockEnd)
    );
  });
};
```

### 2. Filtros por Data

```typescript
const getBlocksForDateRange = (startDate: string, endDate: string, doctorId?: string) => {
  let blocks = scheduleBlocks;
  
  if (doctorId) {
    blocks = blocks.filter(block => block.doctor_id === doctorId);
  }
  
  return blocks.filter(block => {
    const blockStart = new Date(block.start_datetime);
    const blockEnd = new Date(block.end_datetime);
    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);

    return (
      (blockStart >= rangeStart && blockStart <= rangeEnd) ||
      (blockEnd >= rangeStart && blockEnd <= rangeEnd) ||
      (blockStart <= rangeStart && blockEnd >= rangeEnd)
    );
  });
};
```

### 3. Indicadores Visuais

#### Calendário
- Dias com bloqueios: fundo vermelho claro
- Dias com agendamentos: fundo amarelo claro

#### Lista de Bloqueios
- Código de cores por tipo de bloqueio
- Informações de horário e médico
- Badges para identificação rápida

## Integração com Agendamentos

### 1. Validação no Formulário

```typescript
const handleCreateAppointment = async (formData: any) => {
  // Verificar conflitos com bloqueios
  if (formData.doctor_id && formData.date && formData.time) {
    const appointmentDateTime = new Date(formData.date);
    const [hours, minutes] = formData.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const endDateTime = new Date(appointmentDateTime);
    endDateTime.setHours(endDateTime.getHours() + 1);
    
    const isBlocked = isTimeSlotBlocked(
      formData.doctor_id,
      appointmentDateTime.toISOString(),
      endDateTime.toISOString()
    );
    
    if (isBlocked) {
      toast.error('Este horário está bloqueado para o profissional selecionado.');
      return;
    }
  }
  
  // Prosseguir com criação do agendamento
  await createAppointment(formData);
};
```

### 2. Prevenção de Conflitos

- Validação em tempo real
- Mensagens de erro claras
- Sugestões de horários alternativos

## Configuração e Uso

### 1. Acesso ao Sistema

1. Navegar para `/dashboard/calendar`
2. Clicar em "Bloqueios de Agenda"
3. Usar o botão "Novo Bloqueio" para criar

### 2. Criação de Bloqueios

1. Selecionar médico
2. Definir título e tipo
3. Escolher data e horário
4. Configurar recorrência (opcional)
5. Adicionar descrição (opcional)

### 3. Gerenciamento

- **Editar**: Clicar no ícone de edição
- **Excluir**: Clicar no ícone de lixeira
- **Visualizar**: Bloqueios aparecem na lista e calendário

## Tipos de Bloqueios Recorrentes

### 1. Configurações Disponíveis

- **Frequência**: Diária, semanal, mensal
- **Intervalo**: A cada X dias/semanas/meses
- **Dias da Semana**: Para recorrência semanal
- **Data Final**: Quando a recorrência termina

### 2. Exemplos de Uso

- **Intervalo de Almoço**: Diário, 12:00-13:00
- **Reunião Semanal**: Toda segunda-feira, 09:00-10:00
- **Férias**: Período específico, não recorrente

## Segurança e Permissões

### 1. Row Level Security (RLS)

- Usuários só veem bloqueios de suas clínicas
- Autenticação obrigatória para todas as operações
- Políticas de acesso baseadas em roles

### 2. Validações

- Médico deve pertencer à clínica
- Horário de fim deve ser após início
- Não permite sobreposições

## Monitoramento e Logs

### 1. Logs de Operações

- Criação, edição e exclusão de bloqueios
- Tentativas de agendamento em horários bloqueados
- Erros de validação

### 2. Auditoria

- Histórico de alterações
- Usuário responsável por cada operação
- Timestamps de todas as ações

## Testes e Validação

### 1. Cenários de Teste

- ✅ Criar bloqueio simples
- ✅ Criar bloqueio recorrente
- ✅ Validar conflitos de agendamento
- ✅ Editar bloqueio existente
- ✅ Excluir bloqueio
- ✅ Visualizar bloqueios no calendário

### 2. Validação de Dados

- Formato de data/hora correto
- Médico válido e da clínica
- Horários consistentes
- Tipos de bloqueio válidos

## Próximas Funcionalidades

### 1. Melhorias Planejadas

- Notificações automáticas
- Sincronização com calendários externos
- Relatórios de disponibilidade
- Aprovação de bloqueios por administradores

### 2. Integrações Futuras

- Google Calendar
- Outlook Calendar
- Sistemas de RH
- Aplicativos móveis

## Solução de Problemas

### 1. Problemas Comuns

- **Bloqueio não aparece**: Verificar filtros de médico
- **Conflito não detectado**: Verificar formato de data/hora
- **Recorrência não funciona**: Verificar configurações de padrão

### 2. Debugging

- Verificar logs do navegador
- Confirmar dados no banco
- Testar com dados simples primeiro

## Conclusão

O sistema de bloqueio de agenda oferece uma solução completa para gerenciamento de disponibilidade médica, com integração total ao sistema de agendamentos e interface intuitiva similar ao Google Calendar. A implementação garante consistência de dados e uma experiência de usuário otimizada.