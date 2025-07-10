import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Doctor, ScheduleBlock, ScheduleBlockType, ScheduleBlockFormData } from '@/types';

const scheduleBlockSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  start_date: z.date({ required_error: 'Data de início é obrigatória' }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  end_date: z.date({ required_error: 'Data de fim é obrigatória' }),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido'),
  block_type: z.enum(['unavailable', 'break', 'meeting', 'vacation', 'sick_leave', 'personal']),
  is_recurring: z.boolean().default(false),
  doctor_id: z.string().min(1, 'Selecione um médico'),
});

type ScheduleBlockFormDataInternal = z.infer<typeof scheduleBlockSchema>;

interface ScheduleBlockFormProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  initialData?: ScheduleBlock;
  onSubmit: (data: ScheduleBlockFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
  onDoctorChange?: (doctorId: string) => void;
}

export const ScheduleBlockForm: React.FC<ScheduleBlockFormProps> = ({
  doctors,
  selectedDoctorId,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
  onDoctorChange,
}) => {
  const [isRecurring, setIsRecurring] = useState(initialData?.is_recurring || false);

  const form = useForm<ScheduleBlockFormDataInternal>({
    resolver: zodResolver(scheduleBlockSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      start_date: initialData ? new Date(initialData.start_datetime) : new Date(),
      start_time: initialData ? format(new Date(initialData.start_datetime), 'HH:mm') : '09:00',
      end_date: initialData ? new Date(initialData.end_datetime) : new Date(),
      end_time: initialData ? format(new Date(initialData.end_datetime), 'HH:mm') : '10:00',
      block_type: (initialData?.block_type as ScheduleBlockType) || 'unavailable',
      is_recurring: initialData?.is_recurring || false,
      doctor_id: selectedDoctorId || initialData?.doctor_id || '',
    },
  });

  useEffect(() => {
    if (selectedDoctorId && onDoctorChange) {
      onDoctorChange(selectedDoctorId);
    }
  }, [selectedDoctorId, onDoctorChange]);

  const handleSubmit = (data: ScheduleBlockFormDataInternal) => {
    // Combine date and time into datetime strings
    const startDateTime = new Date(data.start_date);
    const [startHour, startMinute] = data.start_time.split(':').map(Number);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(data.end_date);
    const [endHour, endMinute] = data.end_time.split(':').map(Number);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    // Validate that end time is after start time
    if (endDateTime <= startDateTime) {
      form.setError('end_time', {
        message: 'Horário de fim deve ser após o horário de início',
      });
      return;
    }

    const formattedData = {
      title: data.title,
      description: data.description,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
      block_type: data.block_type,
      is_recurring: data.is_recurring,
      doctor_id: data.doctor_id,
    };

    onSubmit(formattedData);
  };

  const blockTypeOptions = [
    { value: 'unavailable', label: 'Indisponível' },
    { value: 'break', label: 'Intervalo' },
    { value: 'lunch', label: 'Almoço' },
    { value: 'meeting', label: 'Reunião' },
    { value: 'conference', label: 'Conferência' },
    { value: 'training', label: 'Treinamento' },
    { value: 'vacation', label: 'Férias' },
    { value: 'sick_leave', label: 'Licença Médica' },
    { value: 'personal', label: 'Pessoal' },
    { value: 'emergency', label: 'Emergência' },
    { value: 'travel', label: 'Viagem' },
    { value: 'maintenance', label: 'Manutenção' },
  ];

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(handleSubmit)(e);
        }} 
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="doctor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Médico</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (onDoctorChange) onDoctorChange(value);
                }}
                value={field.value}
                disabled={isEditing}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um médico" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reunião médica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalhes sobre o bloqueio..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="block_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Bloqueio</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {blockTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Início</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMM", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Início</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="HH:MM"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data de Fim</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full pl-3 text-left font-normal"
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMM", { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Fim</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="HH:MM"
                      {...field}
                      className="pl-10"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_recurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recorrente</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Este bloqueio se repete periodicamente
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    setIsRecurring(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {isRecurring && (
          <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-semibold text-sm">Configurações de Recorrência</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensalmente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interval">Intervalo</Label>
                <Input
                  id="interval"
                  type="number"
                  min="1"
                  max="12"
                  defaultValue="1"
                  placeholder="Ex: 1"
                />
              </div>
            </div>
            
            <div>
              <Label>Dias da Semana (para recorrência semanal)</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`day-${index}`}
                      className="rounded"
                      defaultChecked={index >= 1 && index <= 5} // Mon-Fri by default
                    />
                    <Label htmlFor={`day-${index}`} className="text-xs">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="end-date">Data Final da Recorrência</Label>
              <Input
                id="end-date"
                type="date"
                className="mt-1"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
};