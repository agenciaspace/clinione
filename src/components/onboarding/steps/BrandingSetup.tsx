import { useState, useRef } from 'react'
import { Upload, Palette, Globe, Image } from 'lucide-react'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import { OnboardingStepProps } from '../../../types/onboarding.types'

export default function BrandingSetup({ data, onUpdate, onNext }: OnboardingStepProps) {
  const [logoUrl, setLogoUrl] = useState(data.branding?.logoUrl || '')
  const [primaryColor, setPrimaryColor] = useState(data.branding?.primaryColor || '#FFD400')
  const [customDomain, setCustomDomain] = useState(data.branding?.customDomain || '')
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl || null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Em produção, fazer upload para Supabase Storage
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        setLogoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleContinue = () => {
    onUpdate({
      branding: {
        logoUrl,
        primaryColor,
        customDomain,
      },
    })
    onNext()
  }

  const presetColors = [
    { name: 'Amarelo Clini.One', value: '#FFD400' },
    { name: 'Azul Médico', value: '#0EA5E9' },
    { name: 'Verde Saúde', value: '#10B981' },
    { name: 'Roxo Moderno', value: '#8B5CF6' },
    { name: 'Rosa Suave', value: '#EC4899' },
    { name: 'Cinza Profissional', value: '#6B7280' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-800">
          Personalize a identidade visual da sua clínica. Esta etapa é opcional e pode ser configurada depois.
        </p>
      </div>

      {/* Upload de Logo */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logotipo da Clínica</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="h-24 w-24 object-contain rounded-lg border border-gray-200 p-2 bg-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Escolher arquivo
            </Button>
            <p className="mt-2 text-sm text-gray-500">
              PNG, JPG ou SVG. Tamanho máximo 2MB.
            </p>
          </div>
        </div>
      </div>

      {/* Cor Primária */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cor Principal</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {presetColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => setPrimaryColor(color.value)}
                className={`relative p-3 rounded-lg border-2 transition-all ${
                  primaryColor === color.value
                    ? 'border-gray-900'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                <div
                  className="w-full h-12 rounded-md mb-2"
                  style={{ backgroundColor: color.value }}
                />
                <p className="text-xs text-gray-600 text-center">{color.name}</p>
                {primaryColor === color.value && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-sm text-gray-600">Cor personalizada:</span>
            </div>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32"
              placeholder="#FFD400"
            />
          </div>
        </div>
      </div>

      {/* Domínio Personalizado */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          <Globe className="w-5 h-5 inline mr-2" />
          Domínio Personalizado (V2)
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-3">
            Na versão 2, você poderá ter uma página pública para agendamento online.
          </p>
          <Input
            label="URL desejada"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="minhaclinica"
            helpText="Sua página ficará disponível em: minhaclinica.clini.one"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="border border-gray-200 rounded-lg p-6 bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preview</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {logoPreview && (
              <img src={logoPreview} alt="Logo" className="h-12 w-12 object-contain" />
            )}
            <div>
              <h4 className="text-xl font-bold" style={{ color: primaryColor }}>
                {data.clinic?.name || 'Sua Clínica'}
              </h4>
              <p className="text-sm text-gray-500">
                {customDomain ? `${customDomain}.clini.one` : 'suaclinica.clini.one'}
              </p>
            </div>
          </div>
          <button
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: primaryColor }}
          >
            Botão de Exemplo
          </button>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onUpdate({ branding: {} })
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