import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import { OnboardingStepProps } from '../../../types/onboarding.types'

interface Professional {
  name: string
  email: string
  crm?: string
  specialty?: string
  phone?: string
}

export default function ProfessionalsSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [professionals, setProfessionals] = useState<Professional[]>(
    data.professionals || [{ name: '', email: '', crm: '', specialty: '', phone: '' }]
  )
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>({})

  const addProfessional = () => {
    if (professionals.length < 5) {
      setProfessionals([...professionals, { name: '', email: '', crm: '', specialty: '', phone: '' }])
    }
  }

  const removeProfessional = (index: number) => {
    setProfessionals(professionals.filter((_, i) => i !== index))
    const newErrors = { ...errors }
    delete newErrors[index]
    setErrors(newErrors)
  }

  const updateProfessional = (index: number, field: keyof Professional, value: string) => {
    const updated = [...professionals]
    updated[index] = { ...updated[index], [field]: value }
    setProfessionals(updated)
    
    // Clear error for this field
    if (errors[index]?.[field]) {
      const newErrors = { ...errors }
      delete newErrors[index][field]
      if (Object.keys(newErrors[index]).length === 0) {
        delete newErrors[index]
      }
      setErrors(newErrors)
    }
  }

  const validateProfessionals = () => {
    const newErrors: Record<number, Record<string, string>> = {}
    let isValid = true

    professionals.forEach((prof, index) => {
      const profErrors: Record<string, string> = {}
      
      if (!prof.name || prof.name.length < 3) {
        profErrors.name = 'Nome deve ter pelo menos 3 caracteres'
        isValid = false
      }
      
      if (!prof.email || !prof.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        profErrors.email = 'Email inválido'
        isValid = false
      }
      
      if (Object.keys(profErrors).length > 0) {
        newErrors[index] = profErrors
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleContinue = () => {
    if (validateProfessionals()) {
      onUpdate({ professionals })
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Cadastre os médicos e profissionais da sua clínica. Você pode adicionar até 5 profissionais nesta etapa.
        </p>
      </div>

      {professionals.map((professional, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Profissional {index + 1}
            </h3>
            {professionals.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProfessional(index)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={professional.name}
              onChange={(e) => updateProfessional(index, 'name', e.target.value)}
              error={errors[index]?.name}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={professional.email}
              onChange={(e) => updateProfessional(index, 'email', e.target.value)}
              error={errors[index]?.email}
              required
            />
            
            <Input
              label="CRM"
              value={professional.crm || ''}
              onChange={(e) => updateProfessional(index, 'crm', e.target.value)}
              placeholder="12345/SP"
            />
            
            <Input
              label="Especialidade"
              value={professional.specialty || ''}
              onChange={(e) => updateProfessional(index, 'specialty', e.target.value)}
              placeholder="Ex: Cardiologia"
            />
            
            <Input
              label="Telefone"
              value={professional.phone || ''}
              onChange={(e) => updateProfessional(index, 'phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      ))}

      {professionals.length < 5 && (
        <Button
          type="button"
          variant="outline"
          onClick={addProfessional}
          fullWidth
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar outro profissional
        </Button>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onUpdate({ professionals: [] })
            onNext()
          }}
        >
          Pular esta etapa
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}