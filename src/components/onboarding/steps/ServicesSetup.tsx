import { useState } from 'react'
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import { OnboardingStepProps } from '../../../types/onboarding.types'

interface Service {
  name: string
  duration: number
  price?: number
  description?: string
}

const defaultServices = [
  { name: 'Consulta', duration: 30, price: 150 },
  { name: 'Retorno', duration: 15, price: 0 },
  { name: 'Primeira Consulta', duration: 45, price: 200 },
  { name: 'Procedimento', duration: 60, price: 300 },
]

export default function ServicesSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [services, setServices] = useState<Service[]>(
    data.services || defaultServices
  )

  const addService = () => {
    setServices([...services, { name: '', duration: 30 }])
  }

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index))
    }
  }

  const updateService = (index: number, field: keyof Service, value: any) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const handleContinue = () => {
    const validServices = services.filter(s => s.name && s.duration > 0)
    onUpdate({ services: validServices })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          Configure os tipos de consulta e serviços oferecidos. Já adicionamos alguns modelos comuns que você pode personalizar.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-sm font-medium text-gray-700">Serviço {index + 1}</h4>
              {services.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome do Serviço"
                value={service.name}
                onChange={(e) => updateService(index, 'name', e.target.value)}
                placeholder="Ex: Consulta"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (minutos) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={service.duration}
                    onChange={(e) => updateService(index, 'duration', parseInt(e.target.value))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={service.price || ''}
                    onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || undefined)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <Input
                label="Descrição"
                value={service.description || ''}
                onChange={(e) => updateService(index, 'description', e.target.value)}
                placeholder="Descrição opcional"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addService}
        fullWidth
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar outro serviço
      </Button>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Políticas de Agendamento</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedência mínima para agendamento
            </label>
            <select className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="0">Sem antecedência mínima</option>
              <option value="1">1 hora</option>
              <option value="2">2 horas</option>
              <option value="24">1 dia</option>
              <option value="48">2 dias</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Política de cancelamento
            </label>
            <select className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="0">Cancelamento livre</option>
              <option value="2">Até 2 horas antes</option>
              <option value="24">Até 24 horas antes</option>
              <option value="48">Até 48 horas antes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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