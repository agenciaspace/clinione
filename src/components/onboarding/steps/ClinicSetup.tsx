import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '../../ui/Input'
import Button from '../../ui/Button'
import { OnboardingStepProps } from '../../../types/onboarding.types'

const clinicSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido'),
  timezone: z.string(),
})

type ClinicFormData = z.infer<typeof clinicSchema>

const timezones = [
  { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
  { value: 'America/Recife', label: 'Recife (GMT-3)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (GMT-4)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
]

const specialties = [
  'Clínica Geral',
  'Pediatria',
  'Ginecologia',
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Psiquiatria',
  'Oftalmologia',
  'Odontologia',
  'Fisioterapia',
  'Nutrição',
  'Psicologia',
]

export default function ClinicSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>(
    data.clinic?.specialties || []
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClinicFormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: data.clinic?.name || '',
      cnpj: data.clinic?.cnpj || '',
      cpf: data.clinic?.cpf || '',
      address: data.clinic?.address || '',
      phone: data.clinic?.phone || '',
      email: data.clinic?.email || '',
      timezone: data.clinic?.timezone || 'America/Sao_Paulo',
    },
  })

  const onSubmit = (formData: ClinicFormData) => {
    onUpdate({
      clinic: {
        ...formData,
        specialties: selectedSpecialties,
      },
    })
    onNext()
  }

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nome da Clínica"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        
        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />
        
        <Input
          label="CNPJ"
          {...register('cnpj')}
          error={errors.cnpj?.message}
          placeholder="00.000.000/0000-00"
        />
        
        <Input
          label="CPF (se pessoa física)"
          {...register('cpf')}
          error={errors.cpf?.message}
          placeholder="000.000.000-00"
        />
        
        <Input
          label="Telefone"
          {...register('phone')}
          error={errors.phone?.message}
          placeholder="(11) 99999-9999"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fuso Horário <span className="text-red-500">*</span>
          </label>
          <select
            {...register('timezone')}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {timezones.map(tz => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <Input
        label="Endereço"
        {...register('address')}
        error={errors.address?.message}
        placeholder="Rua, número, bairro, cidade - UF"
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Especialidades da Clínica
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specialties.map(specialty => (
            <button
              key={specialty}
              type="button"
              onClick={() => toggleSpecialty(specialty)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedSpecialties.includes(specialty)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
        {selectedSpecialties.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Selecione pelo menos uma especialidade
          </p>
        )}
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={selectedSpecialties.length === 0}
        >
          Continuar
        </Button>
      </div>
    </form>
  )
}