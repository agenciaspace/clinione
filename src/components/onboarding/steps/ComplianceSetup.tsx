import { useState } from 'react'
import { Shield, FileText, Database, AlertTriangle, CheckCircle } from 'lucide-react'
import Button from '../../ui/Button'
import { OnboardingStepProps } from '../../../types/onboarding.types'

export default function ComplianceSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [termsAccepted, setTermsAccepted] = useState(
    data.compliance?.termsAccepted || false
  )
  const [privacyAccepted, setPrivacyAccepted] = useState(
    data.compliance?.privacyAccepted || false
  )
  const [lgpdConsent, setLgpdConsent] = useState(
    data.compliance?.lgpdConsent || false
  )
  const [dataRetention, setDataRetention] = useState(
    data.compliance?.dataRetention || 5
  )

  const handleContinue = () => {
    onUpdate({
      compliance: {
        termsAccepted,
        privacyAccepted,
        lgpdConsent,
        dataRetention,
      },
    })
    onNext()
  }

  const canProceed = termsAccepted && privacyAccepted && lgpdConsent

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800 font-medium mb-1">Conformidade Obrigatória</p>
            <p className="text-sm text-red-700">
              Para usar o Clini.One, você deve aceitar nossos termos e estar em conformidade com a LGPD.
            </p>
          </div>
        </div>
      </div>

      {/* Termos de Uso */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="terms" className="block text-sm font-medium text-gray-900 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Termos de Uso
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Li e aceito os{' '}
              <a href="#" className="text-primary hover:underline">
                Termos de Uso
              </a>{' '}
              do Clini.One, incluindo as condições de uso da plataforma, responsabilidades e limitações.
            </p>
            {termsAccepted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Aceito</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Política de Privacidade */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              id="privacy"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="privacy" className="block text-sm font-medium text-gray-900 mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Política de Privacidade
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Li e aceito a{' '}
              <a href="#" className="text-primary hover:underline">
                Política de Privacidade
              </a>{' '}
              do Clini.One, incluindo como coletamos, usamos e protegemos os dados.
            </p>
            {privacyAccepted && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Aceito</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Consentimento LGPD */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              id="lgpd"
              checked={lgpdConsent}
              onChange={(e) => setLgpdConsent(e.target.checked)}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="lgpd" className="block text-sm font-medium text-gray-900 mb-2">
              <Database className="w-4 h-4 inline mr-2" />
              Consentimento LGPD
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Autorizo o tratamento dos meus dados pessoais e dos dados dos pacientes da minha clínica 
              conforme a Lei Geral de Proteção de Dados (LGPD), para as finalidades descritas na 
              Política de Privacidade.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <p className="text-xs text-blue-800">
                <strong>Seus direitos LGPD:</strong> Você pode solicitar acesso, correção, exclusão ou 
                portabilidade dos seus dados a qualquer momento através do menu Configurações → Privacidade.
              </p>
            </div>
            {lgpdConsent && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span className="text-sm">Consentimento concedido</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Retenção de Dados */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Database className="w-5 h-5 inline mr-2" />
          Política de Retenção de Dados
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Por quanto tempo manter os dados dos pacientes?
            </label>
            <select
              value={dataRetention}
              onChange={(e) => setDataRetention(parseInt(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="5">5 anos (recomendado - CFM)</option>
              <option value="10">10 anos</option>
              <option value="20">20 anos (permanente)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              O Conselho Federal de Medicina recomenda 5 anos. Dados serão arquivados e depois excluídos automaticamente.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Como funciona:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dados ficam ativos durante o período escolhido</li>
              <li>• Após o prazo, dados são arquivados (não excluídos)</li>
              <li>• Período de quarentena de 90 dias antes da exclusão definitiva</li>
              <li>• Logs de auditoria para conformidade LGPD</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Checklist Final */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-green-800 mb-3">Checklist de Conformidade</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <CheckCircle className={`w-4 h-4 mr-2 ${termsAccepted ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={`text-sm ${termsAccepted ? 'text-green-800' : 'text-gray-600'}`}>
              Termos de Uso aceitos
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle className={`w-4 h-4 mr-2 ${privacyAccepted ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={`text-sm ${privacyAccepted ? 'text-green-800' : 'text-gray-600'}`}>
              Política de Privacidade aceita
            </span>
          </div>
          <div className="flex items-center">
            <CheckCircle className={`w-4 h-4 mr-2 ${lgpdConsent ? 'text-green-500' : 'text-gray-300'}`} />
            <span className={`text-sm ${lgpdConsent ? 'text-green-800' : 'text-gray-600'}`}>
              Consentimento LGPD concedido
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          variant="primary"
          onClick={handleContinue}
          disabled={!canProceed}
        >
          Finalizar Configuração
        </Button>
      </div>
    </div>
  )
}