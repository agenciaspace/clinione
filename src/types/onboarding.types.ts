export interface OnboardingData {
  // Step 1: Clinic Setup
  clinic: {
    name: string
    cnpj?: string
    cpf?: string
    address?: string
    phone?: string
    email?: string
    timezone: string
    specialties: string[]
  }
  
  // Step 2: Professionals
  professionals: Array<{
    name: string
    email: string
    crm?: string
    specialty?: string
    phone?: string
  }>
  
  // Step 3: Services
  services: Array<{
    name: string
    duration: number // minutos
    price?: number
    description?: string
  }>
  
  // Step 4: Notifications
  notifications: {
    channels: {
      whatsapp: boolean
      sms: boolean
      email: boolean
    }
    confirmationWindow: number // horas antes
    reminderWindows: number[] // array de horas antes
    templates: {
      confirmation?: string
      reminder?: string
    }
  }
  
  // Step 5: Branding
  branding: {
    logoUrl?: string
    primaryColor?: string
    customDomain?: string
  }
  
  // Step 6: Compliance
  compliance: {
    termsAccepted: boolean
    privacyAccepted: boolean
    lgpdConsent: boolean
    dataRetention: number // anos
  }
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<OnboardingStepProps>
  isOptional?: boolean
}

export interface OnboardingStepProps {
  data: Partial<OnboardingData>
  onUpdate: (data: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}