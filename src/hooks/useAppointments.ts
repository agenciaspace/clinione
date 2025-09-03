import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  birth_date: string
}

export interface Professional {
  id: string
  name: string
  crm: string
  specialty: string
}

export interface Service {
  id: string
  name: string
  duration: number
  price: number
}

export interface Appointment {
  id: string
  patient_id: string
  professional_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  created_at: string
  updated_at: string
  // Dados relacionados
  patient?: Patient
  professional?: Professional
  service?: Service
}

export interface CreateAppointmentData {
  patient_id: string
  professional_id: string
  service_id: string
  appointment_date: string
  appointment_time: string
  notes?: string
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carregar appointments com dados relacionados
  const loadAppointments = async (date?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (date) {
        query = query.eq('appointment_date', date)
      }

      const { data, error } = await query

      if (error) throw error

      setAppointments(data || [])
    } catch (err) {
      console.error('Error loading appointments:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos')
    } finally {
      setLoading(false)
    }
  }

  // Carregar pacientes
  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setPatients(data || [])
    } catch (err) {
      console.error('Error loading patients:', err)
    }
  }

  // Carregar profissionais
  const loadProfessionals = async () => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('status', 'active')
        .order('name')

      if (error) throw error
      setProfessionals(data || [])
    } catch (err) {
      console.error('Error loading professionals:', err)
    }
  }

  // Carregar serviços
  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('name')

      if (error) throw error
      setServices(data || [])
    } catch (err) {
      console.error('Error loading services:', err)
    }
  }

  // Criar novo agendamento
  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar se já existe agendamento no mesmo horário
      const { data: existing, error: checkError } = await supabase
        .from('appointments')
        .select('id')
        .eq('professional_id', appointmentData.professional_id)
        .eq('appointment_date', appointmentData.appointment_date)
        .eq('appointment_time', appointmentData.appointment_time)
        .neq('status', 'cancelled')

      if (checkError) throw checkError

      if (existing && existing.length > 0) {
        throw new Error('Já existe um agendamento para este horário')
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `)
        .single()

      if (error) throw error

      // Atualizar lista local
      setAppointments(prev => [data, ...prev])
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar agendamento'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Atualizar agendamento
  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          service:services(*)
        `)
        .single()

      if (error) throw error

      // Atualizar lista local
      setAppointments(prev => 
        prev.map(appointment => 
          appointment.id === id ? data : appointment
        )
      )

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar agendamento'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Cancelar agendamento
  const cancelAppointment = async (id: string) => {
    return updateAppointment(id, { status: 'cancelled' })
  }

  // Carregar dados iniciais
  useEffect(() => {
    loadPatients()
    loadProfessionals()
    loadServices()
    loadAppointments()
  }, [])

  return {
    appointments,
    patients,
    professionals,
    services,
    loading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    refreshData: () => {
      loadPatients()
      loadProfessionals()
      loadServices()
      loadAppointments()
    }
  }
}