
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/components/ui/sonner';
import { FinancialForecast, ForecastStatus, TissBatch } from '@/types/financialTypes';
import { webhookEvents } from '@/utils/webhook-service';

export const useFinancialMutations = (clinicId: string | undefined) => {
  const queryClient = useQueryClient();

  const createFinancialForecast = useMutation({
    mutationFn: async (forecast: Omit<FinancialForecast, 'id' | 'created_at' | 'updated_at' | 'clinic_id'>) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      const newForecast = {
        ...forecast,
        clinic_id: clinicId,
      };
      
      const { data, error } = await supabase
        .from('financial_forecasts')
        .insert(newForecast)
        .select()
        .single();
        
      if (error) throw error;
      
      // Disparar webhook
      await webhookEvents.transactions.created(data, clinicId);
      
      return data;
    },
    onSuccess: () => {
      toast.success('Previsão financeira criada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Erro ao criar previsão financeira:', error);
      toast.error('Erro ao criar previsão financeira');
    }
  });

  const updateForecastStatus = useMutation({
    mutationFn: async ({ id, status, glosaInfo }: { 
      id: string; 
      status: ForecastStatus; 
      glosaInfo?: { 
        value?: number; 
        reason?: string; 
        appealStatus?: string;
      }; 
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      const updateData: any = { status };
      
      if (glosaInfo) {
        if (glosaInfo.value !== undefined) updateData.glosa_value = glosaInfo.value;
        if (glosaInfo.reason) updateData.glosa_reason = glosaInfo.reason;
        if (glosaInfo.appealStatus) updateData.glosa_appeal_status = glosaInfo.appealStatus;
      }
      
      const { data, error } = await supabase
        .from('financial_forecasts')
        .update(updateData)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();
        
      if (error) throw error;
      
      // Disparar webhook
      await webhookEvents.transactions.updated(data, clinicId);
      
      return data;
    },
    onSuccess: () => {
      toast.success('Status da previsão atualizado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar status da previsão:', error);
      toast.error('Erro ao atualizar status da previsão');
    }
  });

  const createTissBatch = useMutation({
    mutationFn: async ({ 
      insuranceId, 
      forecastIds 
    }: { 
      insuranceId: string; 
      forecastIds: string[];
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      // Obter forecasts para calcular valor total
      const { data: forecasts, error: forecastError } = await supabase
        .from('financial_forecasts')
        .select('*')
        .in('id', forecastIds)
        .eq('clinic_id', clinicId)
        .eq('insurance_company_id', insuranceId);
        
      if (forecastError) throw forecastError;
      
      if (!forecasts || forecasts.length === 0) {
        throw new Error('Nenhuma previsão financeira encontrada');
      }
      
      const totalValue = forecasts.reduce((sum, f) => sum + (f.value || 0), 0);
      
      // Gerar número do lote (timestamp + primeiras 4 chars do ID da clínica)
      const batchNumber = `${Date.now()}-${clinicId.substring(0, 4)}`;
      
      // Criar lote TISS
      const { data: batch, error: batchError } = await supabase
        .from('tiss_batches')
        .insert({
          clinic_id: clinicId,
          insurance_company_id: insuranceId,
          batch_number: batchNumber,
          status: 'preparing',
          total_value: totalValue,
          submission_date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (batchError) throw batchError;
      
      // Atualizar forecasts com o ID do lote
      const { error: updateError } = await supabase
        .from('financial_forecasts')
        .update({ 
          tiss_batch_id: batch.id,
          status: 'sent'
        })
        .in('id', forecastIds)
        .eq('clinic_id', clinicId);
        
      if (updateError) throw updateError;
      
      return batch;
    },
    onSuccess: (batch) => {
      toast.success(`Lote TISS ${batch.batch_number} criado com sucesso`);
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['tiss_batches'] });
    },
    onError: (error) => {
      console.error('Erro ao criar lote TISS:', error);
      toast.error('Erro ao criar lote TISS');
    }
  });

  const processInsuranceResponse = useMutation({
    mutationFn: async ({ 
      batchId, 
      approvedValue, 
      deniedValue, 
      glosaDetails 
    }: { 
      batchId: string; 
      approvedValue: number; 
      deniedValue: number;
      glosaDetails?: Array<{ 
        forecastId: string; 
        value: number; 
        reason: string;
      }>;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      // Atualizar lote TISS
      const { data: updatedBatch, error: batchError } = await supabase
        .from('tiss_batches')
        .update({
          status: 'processed',
          approved_value: approvedValue,
          denied_value: deniedValue,
          response_date: new Date().toISOString()
        })
        .eq('id', batchId)
        .eq('clinic_id', clinicId)
        .select()
        .single();
        
      if (batchError) throw batchError;
      
      // Se tem detalhes de glosa, atualizar cada previsão
      if (glosaDetails && glosaDetails.length > 0) {
        for (const detail of glosaDetails) {
          const { error: glosaError } = await supabase
            .from('financial_forecasts')
            .update({
              status: detail.value > 0 ? 'partial' : 'denied',
              glosa_value: detail.value,
              glosa_reason: detail.reason,
              glosa_appeal_status: 'pending'
            })
            .eq('id', detail.forecastId)
            .eq('clinic_id', clinicId);
            
          if (glosaError) throw glosaError;
        }
      }
      
      return updatedBatch;
    },
    onSuccess: () => {
      toast.success('Resposta do convênio processada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['tiss_batches'] });
    },
    onError: (error) => {
      console.error('Erro ao processar resposta do convênio:', error);
      toast.error('Erro ao processar resposta do convênio');
    }
  });

  const reconcileTransaction = useMutation({
    mutationFn: async ({ 
      forecastId, 
      transactionId 
    }: { 
      forecastId: string; 
      transactionId: string;
    }) => {
      if (!clinicId) throw new Error('Nenhuma clínica selecionada');
      
      const { data, error } = await supabase
        .from('financial_forecasts')
        .update({
          status: 'paid',
          reconciled_transaction_id: transactionId
        })
        .eq('id', forecastId)
        .eq('clinic_id', clinicId)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      toast.success('Transação reconciliada com sucesso');
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error) => {
      console.error('Erro ao reconciliar transação:', error);
      toast.error('Erro ao reconciliar transação');
    }
  });

  return {
    createFinancialForecast: createFinancialForecast.mutate,
    updateForecastStatus: updateForecastStatus.mutate,
    createTissBatch: createTissBatch.mutate,
    processInsuranceResponse: processInsuranceResponse.mutate,
    reconcileTransaction: reconcileTransaction.mutate,
  };
};
