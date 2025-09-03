import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Calendar, Clock, User, UserCheck, FileText, Save } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Card from '../ui/Card'
import { CreateAppointmentData, Patient, Professional, Service } from '../../hooks/useAppointments'

const appointmentSchema = z.object({
  patient_id: z.string().min(1, 'Selecione um paciente'),
  professional_id: z.string().min(1, 'Selecione um profissional'),
  service_id: z.string().min(1, 'Selecione um serviço'),
  appointment_date: z.string().min(1, 'Selecione a data'),
  appointment_time: z.string().min(1, 'Selecione o horário'),
  notes: z.string().optional()
})

type AppointmentFormData = z.infer<typeof appointmentSchema>

interface AppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateAppointmentData) => Promise<void>
  patients: Patient[]
  professionals: Professional[]
  services: Service[]
  loading?: boolean
  selectedDate?: string
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  patients,
  professionals,
  services,
  loading = false,
  selectedDate
}: AppointmentModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema)
  })

  const selectedServiceId = watch('service_id')
  const selectedService = services.find(s => s.id === selectedServiceId)

  useEffect(() => {
    if (selectedDate) {
      setValue('appointment_date', selectedDate)
    }
  }, [selectedDate, setValue])

  const handleFormSubmit = async (data: AppointmentFormData) => {
    try {
      setSubmitting(true)
      await onSubmit(data)
      reset()
      onClose()
    } catch (error) {
      console.error('Error creating appointment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50" onClick={onClose} />
        
        <Card className="relative w-full max-w-2xl bg-white">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Novo Agendamento
                </h2>
                <p className="text-sm text-gray-600">
                  Preencha os dados para criar um agendamento
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2" />
                Paciente
              </label>
              <select
                {...register('patient_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.phone}
                  </option>
                ))}
              </select>
              {errors.patient_id && (
                <p className="mt-1 text-sm text-red-600">{errors.patient_id.message}</p>
              )}
            </div>

            {/* Professional Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <UserCheck className="h-4 w-4 mr-2" />
                Profissional
              </label>
              <select
                {...register('professional_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione um profissional</option>
                {professionals.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name} - {professional.specialty}
                  </option>
                ))}
              </select>
              {errors.professional_id && (
                <p className="mt-1 text-sm text-red-600">{errors.professional_id.message}</p>
              )}
            </div>

            {/* Service Selection */}
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 mr-2" />
                Serviço
              </label>
              <select
                {...register('service_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Selecione um serviço</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration}min - R$ {service.price.toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <p className="mt-1 text-sm text-red-600">{errors.service_id.message}</p>
              )}
              
              {selectedService && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Duração:</strong> {selectedService.duration} minutos • 
                    <strong> Valor:</strong> R$ {selectedService.price.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Data
                </label>
                <Input
                  type="date"
                  {...register('appointment_date')}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.appointment_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointment_date.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Horário
                </label>
                <select
                  {...register('appointment_time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecione o horário</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                {errors.appointment_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.appointment_time.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações (opcional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Adicione observações sobre o agendamento..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Agendar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}