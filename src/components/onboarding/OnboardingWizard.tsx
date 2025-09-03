import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../hooks/useOnboarding'
import Button from '../ui/Button'
import Progress from '../ui/Progress'
import Card from '../ui/Card'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import ClinicSetup from './steps/ClinicSetup'
import ProfessionalsSetup from './steps/ProfessionalsSetup'
import ServicesSetup from './steps/ServicesSetup'
import NotificationsSetup from './steps/NotificationsSetup'
import BrandingSetup from './steps/BrandingSetup'
import ComplianceSetup from './steps/ComplianceSetup'

const steps = [
  {
    title: 'Dados da Clínica',
    description: 'Informações básicas sobre sua clínica',
    component: ClinicSetup,
  },
  {
    title: 'Profissionais',
    description: 'Cadastre os médicos e profissionais',
    component: ProfessionalsSetup,
  },
  {
    title: 'Serviços',
    description: 'Configure os tipos de consulta',
    component: ServicesSetup,
  },
  {
    title: 'Notificações',
    description: 'Configure confirmações automáticas',
    component: NotificationsSetup,
  },
  {
    title: 'Identidade Visual',
    description: 'Personalize a aparência',
    component: BrandingSetup,
    isOptional: true,
  },
  {
    title: 'Conformidade',
    description: 'Termos e LGPD',
    component: ComplianceSetup,
  },
]

export default function OnboardingWizard() {
  const navigate = useNavigate()
  const {
    currentStep,
    completedSteps,
    data,
    loading,
    error,
    progress,
    goToNext,
    goToPrevious,
    updateData,
    completeOnboarding: completeOnboardingOriginal,
    skipOnboarding: skipOnboardingOriginal,
    isLastStep,
  } = useOnboarding()

  const completeOnboarding = async () => {
    await completeOnboardingOriginal()
    navigate('/dashboard')
  }

  const skipOnboarding = async () => {
    await skipOnboardingOriginal()
    navigate('/dashboard')
  }

  const CurrentStepComponent = steps[currentStep].component

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bem-vindo ao Clini.One
          </h1>
          <p className="mt-2 text-gray-600">
            Configure sua clínica em menos de 10 minutos
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>Tempo estimado: {10 - Math.floor(currentStep * 1.5)} min</span>
          </div>
          <Progress value={progress} showLabel={false} />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    completedSteps.includes(index)
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {completedSteps.includes(index) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-2 hidden md:block">
                  <p className={`text-sm font-medium ${
                    index === currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  {step.isOptional && (
                    <p className="text-xs text-gray-400">Opcional</p>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    completedSteps.includes(index)
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep].title}
              </h2>
              <p className="mt-1 text-gray-600">
                {steps[currentStep].description}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <CurrentStepComponent
              data={data}
              onUpdate={updateData}
              onNext={goToNext}
              onBack={goToPrevious}
            />
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button
            variant="ghost"
            onClick={skipOnboarding}
          >
            Pular por enquanto
          </Button>

          {isLastStep ? (
            <Button
              variant="primary"
              onClick={completeOnboarding}
              loading={loading}
            >
              Concluir e ir para o Dashboard
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={goToNext}
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}