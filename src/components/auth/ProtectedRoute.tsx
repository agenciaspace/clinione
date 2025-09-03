import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireOnboarding?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [checkingOnboarding, setCheckingOnboarding] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  useEffect(() => {
    if (user && requireOnboarding) {
      checkOnboardingStatus()
    }
  }, [user, requireOnboarding])

  const checkOnboardingStatus = async () => {
    if (!user) return

    try {
      setCheckingOnboarding(true)
      
      // BYPASS para usuários de teste - permite pular onboarding
      const testEmails = ['admin@clinica.com', 'teste@clinica.com', 'test@clinica.com']
      if (testEmails.includes(user.email || '')) {
        console.log('🧪 Test user detected - bypassing onboarding check')
        setOnboardingComplete(true)
        return
      }
      
      // Verificar se usuário tem clínica associada
      const { data: userClinic } = await supabase
        .from('user_clinics')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single()

      if (userClinic) {
        // Verificar se onboarding foi completado
        const { data: onboarding } = await supabase
          .from('onboarding_progress')
          .select('completed')
          .eq('clinic_id', userClinic.clinic_id)
          .single()

        setOnboardingComplete(onboarding?.completed || false)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
      setOnboardingComplete(false)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirecionar para login se autenticação for obrigatória
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Redirecionar para dashboard se usuário logado tentar acessar login/signup
  if (!requireAuth && user) {
    // Se onboarding não foi completado, redirecionar para onboarding
    if (!onboardingComplete && location.pathname !== '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  // Verificar onboarding se obrigatório
  if (requireOnboarding && user && !onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}