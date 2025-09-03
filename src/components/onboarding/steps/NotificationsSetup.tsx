import { useState } from 'react'
import { MessageSquare, Mail, Phone, Clock, Send } from 'lucide-react'
import Button from '../../ui/Button'
import { OnboardingStepProps } from '../../../types/onboarding.types'

export default function NotificationsSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [channels, setChannels] = useState({
    whatsapp: data.notifications?.channels?.whatsapp ?? true,
    sms: data.notifications?.channels?.sms ?? false,
    email: data.notifications?.channels?.email ?? true,
  })

  const [confirmationWindow, setConfirmationWindow] = useState(
    data.notifications?.confirmationWindow || 48
  )

  const [reminderWindows, setReminderWindows] = useState<number[]>(
    data.notifications?.reminderWindows || [24, 2]
  )

  const [testSent, setTestSent] = useState(false)

  const toggleChannel = (channel: keyof typeof channels) => {
    setChannels({ ...channels, [channel]: !channels[channel] })
  }

  const toggleReminder = (hours: number) => {
    if (reminderWindows.includes(hours)) {
      setReminderWindows(reminderWindows.filter(h => h !== hours))
    } else {
      setReminderWindows([...reminderWindows, hours].sort((a, b) => b - a))
    }
  }

  const sendTestMessage = () => {
    // Simular envio de mensagem teste
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  const handleContinue = () => {
    onUpdate({
      notifications: {
        channels,
        confirmationWindow,
        reminderWindows,
        templates: {
          confirmation: `Olá {nome}! Confirmamos sua consulta para {data} às {hora}. Responda SIM para confirmar ou NAO para cancelar.`,
          reminder: `Lembrete: Sua consulta é {tempo} às {hora}. Endereço: {endereco}`,
        },
      },
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          Configure como e quando seus pacientes receberão confirmações e lembretes automáticos.
        </p>
      </div>

      {/* Canais de Comunicação */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Canais de Comunicação</h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => toggleChannel('whatsapp')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              channels.whatsapp
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-3 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">WhatsApp</p>
                <p className="text-sm text-gray-500">Recomendado - Taxa de leitura 98%</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.whatsapp}
              onChange={() => {}}
              className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
            />
          </button>

          <button
            type="button"
            onClick={() => toggleChannel('sms')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              channels.sms
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-3 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">SMS</p>
                <p className="text-sm text-gray-500">Backup para quem não tem WhatsApp</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={() => {}}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </button>

          <button
            type="button"
            onClick={() => toggleChannel('email')}
            className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
              channels.email
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-3 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">E-mail</p>
                <p className="text-sm text-gray-500">Complementar com informações detalhadas</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={channels.email}
              onChange={() => {}}
              className="h-5 w-5 text-purple-600 rounded focus:ring-purple-500"
            />
          </button>
        </div>
      </div>

      {/* Janelas de Envio */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quando Enviar</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enviar confirmação quantas horas antes?
          </label>
          <select
            value={confirmationWindow}
            onChange={(e) => setConfirmationWindow(parseInt(e.target.value))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="24">24 horas antes</option>
            <option value="48">48 horas antes</option>
            <option value="72">72 horas antes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enviar lembretes
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[168, 72, 48, 24, 12, 2].map(hours => (
              <button
                key={hours}
                type="button"
                onClick={() => toggleReminder(hours)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                  reminderWindows.includes(hours)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                {hours >= 24 ? `${hours / 24} dia${hours > 24 ? 's' : ''}` : `${hours}h`} antes
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mensagem de Teste */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Testar Envio</h3>
        <p className="text-sm text-gray-600 mb-4">
          Envie uma mensagem de teste para verificar se as configurações estão corretas.
        </p>
        <Button
          type="button"
          variant={testSent ? 'secondary' : 'outline'}
          onClick={sendTestMessage}
          disabled={testSent}
          fullWidth
        >
          <Send className="w-4 h-4 mr-2" />
          {testSent ? 'Mensagem enviada!' : 'Enviar mensagem de teste'}
        </Button>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
          disabled={!channels.whatsapp && !channels.sms && !channels.email}
        >
          Continuar
        </Button>
      </div>
    </div>
  )
}