
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { 
  FinancialForecast, 
  InsuranceCompany, 
  Procedure, 
  TissBatch, 
  FinancialSettings 
} from '@/types/financialTypes';

export const useFinancialQueries = (clinicId: string | undefined) => {
  // Query para buscar todas as previsões financeiras
  const {
    data: forecasts = [],
    isLoading: isLoadingForecasts,
    error: forecastsError,
    refetch: refetchForecasts
  } = useQuery({
    queryKey: ['financial_forecasts', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('financial_forecasts')
        .select(`
          *,
          patient:patient_id (name, email),
          doctor:doctor_id (name, speciality),
          procedure:procedure_id (name, code),
          insurance:insurance_company_id (name, code)
        `)
        .eq('clinic_id', clinicId)
        .order('expected_payment_date', { ascending: true });
        
      if (error) throw error;
      return data as (FinancialForecast & {
        patient: { name: string; email: string } | null;
        doctor: { name: string; speciality: string } | null;
        procedure: { name: string; code: string } | null;
        insurance: { name: string; code: string } | null;
      })[];
    },
    enabled: !!clinicId
  });

  // Query para buscar procedimentos
  const {
    data: procedures = [],
    isLoading: isLoadingProcedures
  } = useQuery({
    queryKey: ['procedures', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name');
        
      if (error) throw error;
      return data as Procedure[];
    },
    enabled: !!clinicId
  });

  // Query para buscar convênios
  const {
    data: insuranceCompanies = [],
    isLoading: isLoadingInsurance
  } = useQuery({
    queryKey: ['insurance_companies', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('insurance_companies')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name');
        
      if (error) throw error;
      return data as InsuranceCompany[];
    },
    enabled: !!clinicId
  });

  // Query para buscar lotes TISS
  const {
    data: tissBatches = [],
    isLoading: isLoadingTissBatches
  } = useQuery({
    queryKey: ['tiss_batches', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('tiss_batches')
        .select(`
          *,
          insurance:insurance_company_id (name)
        `)
        .eq('clinic_id', clinicId)
        .order('submission_date', { ascending: false });
        
      if (error) throw error;
      return data as (TissBatch & {
        insurance: { name: string } | null;
      })[];
    },
    enabled: !!clinicId
  });

  // Query para buscar configurações financeiras
  const {
    data: financialSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ['financial_settings', clinicId],
    queryFn: async () => {
      if (!clinicId) return null;
      
      try {
        const { data, error } = await supabase
          .from('financial_settings')
          .select('*')
          .eq('clinic_id', clinicId)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // Não encontrou configurações, criar padrão
            const { data: newSettings, error: insertError } = await supabase
              .from('financial_settings')
              .insert({
                clinic_id: clinicId,
                cancellation_fee_percentage: 0,
                cancellation_tolerance_hours: 24,
                default_insurance_payment_term: 30
              })
              .select()
              .single();
              
            if (insertError) {
              console.warn('Error creating default financial settings:', insertError);
              // Return default settings if creation fails
              return {
                id: 'default',
                clinic_id: clinicId,
                cancellation_fee_percentage: 0,
                cancellation_tolerance_hours: 24,
                default_insurance_payment_term: 30
              } as FinancialSettings;
            }
            return newSettings as FinancialSettings;
          }
          
          // Log error but don't throw - return default settings
          console.warn('Error fetching financial settings:', error);
          return {
            id: 'default',
            clinic_id: clinicId,
            cancellation_fee_percentage: 0,
            cancellation_tolerance_hours: 24,
            default_insurance_payment_term: 30
          } as FinancialSettings;
        }
        
        return data as FinancialSettings;
      } catch (error) {
        console.warn('Unexpected error in financial settings query:', error);
        // Return default settings on any error
        return {
          id: 'default',
          clinic_id: clinicId,
          cancellation_fee_percentage: 0,
          cancellation_tolerance_hours: 24,
          default_insurance_payment_term: 30
        } as FinancialSettings;
      }
    },
    enabled: !!clinicId,
    retry: false // Don't retry on permission errors
  });

  // Query para buscar forecasts por status
  const getForecastsByStatus = (status: string | string[]) => {
    const statusArray = Array.isArray(status) ? status : [status];
    
    return forecasts.filter(f => statusArray.includes(f.status));
  };

  return {
    forecasts,
    procedures,
    insuranceCompanies,
    tissBatches,
    financialSettings,
    isLoading: isLoadingForecasts || isLoadingProcedures || isLoadingInsurance || isLoadingTissBatches || isLoadingSettings,
    error: forecastsError,
    refetchForecasts,
    getForecastsByStatus
  };
};
