import { AlertTriangle, ExternalLink } from 'lucide-react'
import Card from './Card'
import Button from './Button'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function SupabaseWarning() {
  if (isSupabaseConfigured()) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card variant="bordered" className="border-amber-200 bg-amber-50">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Configuração Necessária
            </h2>
            <p className="text-gray-600 mb-4">
              Para usar o Clini.One, você precisa configurar as credenciais do Supabase no arquivo <code className="bg-gray-100 px-1 py-0.5 rounded">.env</code>
            </p>
            
            <div className="text-left bg-gray-900 text-green-400 p-4 rounded-lg mb-4 text-sm font-mono">
              <div>VITE_SUPABASE_URL=https://seu-projeto.supabase.co</div>
              <div>VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui</div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <h3 className="font-medium text-blue-900 mb-1">Como obter as credenciais:</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Acesse seu <strong>Supabase Dashboard</strong></li>
                <li>2. Vá em <strong>Settings → API</strong></li>
                <li>3. Copie a <strong>Project URL</strong> e <strong>anon public key</strong></li>
                <li>4. ⚠️ Use apenas a chave <strong>ANON</strong> (não a secret key)</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.open('https://supabase.com', '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Criar conta no Supabase
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={() => window.location.reload()}
              >
                Recarregar após configurar
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Após configurar as credenciais, recarregue a página
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}