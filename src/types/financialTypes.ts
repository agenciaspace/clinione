
import { Doctor, Patient, Clinic } from '@/types';

export type PaymentType = 'private' | 'insurance';
export type ForecastStatus = 'forecast' | 'confirmed' | 'sent' | 'partial' | 'paid' | 'denied' | 'cancelled';
export type GlosaAppealStatus = 'pending' | 'approved' | 'denied';

export interface Procedure {
  id: string;
  name: string;
  code: string;
  description?: string;
  value_private: number;
  value_insurance?: number;
  clinic_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code?: string;
  payment_term: number;
  clinic_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialForecast {
  id: string;
  clinic_id: string;
  appointment_id?: string;
  patient_id?: string;
  doctor_id?: string;
  procedure_id?: string;
  insurance_company_id?: string;
  payment_type: PaymentType;
  description: string;
  value: number;
  expected_payment_date: string;
  status: ForecastStatus;
  tiss_batch_id?: string;
  glosa_value?: number;
  glosa_reason?: string;
  glosa_appeal_status?: GlosaAppealStatus;
  created_at?: string;
  updated_at?: string;
  reconciled_transaction_id?: string;
}

export interface TissBatch {
  id: string;
  clinic_id: string;
  batch_number: string;
  insurance_company_id?: string;
  submission_date: string;
  response_date?: string;
  status: 'preparing' | 'sent' | 'processed' | 'finished';
  total_value: number;
  approved_value?: number;
  denied_value?: number;
  response_file_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSettings {
  id: string;
  clinic_id: string;
  cancellation_fee_percentage: number;
  cancellation_tolerance_hours: number;
  default_insurance_payment_term: number;
  created_at?: string;
  updated_at?: string;
}
