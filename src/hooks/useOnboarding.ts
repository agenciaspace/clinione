import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { OnboardingData } from '../types/onboarding.types'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'clini-one-onboarding-progress'

export function useOnboarding() {
  const navigate = useNavigate()
  const { clinic } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [data, setData] = useState<Partial<OnboardingData>>(() => {
    // Recuperar dados salvos localmente
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Salvar progresso localmente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  // Salvar progresso no banco
  const saveProgress = async () => {
    if (!clinic) return
    
    try {
      await supabase
        .from('onboarding_progress')
        .upsert({
          clinic_id: clinic.id,
          current_step: currentStep,
          completed_steps: completedSteps,
          data,
          completed: false,
        })
    } catch (err) {
      console.error('Error saving progress:', err)
    }
  }

  // Navegar para próximo passo
  const goToNext = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep])
    }
    setCurrentStep(currentStep + 1)
    saveProgress()
  }

  // Navegar para passo anterior
  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Atualizar dados
  const updateData = (newData: Partial<OnboardingData>) => {
    setData({ ...data, ...newData })
  }

  // Completar onboarding
  const completeOnboarding = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Salvar dados da clínica
      if (data.clinic) {
        const { error: clinicError } = await supabase
          .from('clinics')
          .update(data.clinic)
          .eq('id', clinic?.id)
        
        if (clinicError) throw clinicError
      }

      // Criar profissionais
      if (data.professionals && data.professionals.length > 0) {
        const { error: profError } = await supabase
          .from('professionals')
          .insert(
            data.professionals.map(prof => ({
              ...prof,
              clinic_id: clinic?.id,
            }))
          )
        
        if (profError) throw profError
      }

      // Marcar onboarding como completo
      await supabase
        .from('onboarding_progress')
        .update({ completed: true })
        .eq('clinic_id', clinic?.id)

      // Limpar dados locais
      localStorage.removeItem(STORAGE_KEY)
      
      // Redirecionar para dashboard
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Pular onboarding (opcional)
  const skipOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/dashboard')
  }

  return {
    currentStep,
    completedSteps,
    data,
    loading,
    error,
    totalSteps: 6,
    progress: (completedSteps.length / 6) * 100,
    goToNext,
    goToPrevious,
    updateData,
    completeOnboarding,
    skipOnboarding,
    canGoNext: completedSteps.includes(currentStep) || currentStep === 0,
    isLastStep: currentStep === 5,
  }
}