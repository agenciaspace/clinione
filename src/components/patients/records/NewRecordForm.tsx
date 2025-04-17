
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const recordEntrySchema = z.object({
  content: z.string().min(1, { message: 'O conteúdo do prontuário não pode ficar vazio.' })
});

interface NewRecordFormProps {
  onSubmit: (data: z.infer<typeof recordEntrySchema>) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
  defaultValue?: string;
  isPending?: boolean;
}

export const NewRecordForm = ({ 
  onSubmit, 
  onCancel, 
  onDelete, 
  isEditing = false,
  defaultValue = '',
  isPending = false 
}: NewRecordFormProps) => {
  const form = useForm<z.infer<typeof recordEntrySchema>>({
    resolver: zodResolver(recordEntrySchema),
    defaultValues: {
      content: defaultValue
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Editar Entrada' : 'Nova Entrada'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anotações do Prontuário</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Adicione informações ao prontuário do paciente..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              {isEditing && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    Cancelar
                  </Button>
                  {onDelete && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onDelete}
                    >
                      Excluir
                    </Button>
                  )}
                </>
              )}
              <Button type="submit" disabled={isPending}>
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
