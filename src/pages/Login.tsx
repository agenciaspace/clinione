import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Building2 } from 'lucide-react'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Card from '../components/ui/Card'
import { supabase } from '../lib/supabase'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Verificar se o usuário está associado a alguma clínica
        const { data: userClinic, error: clinicError } = await supabase
          .from('user_clinics')
          .select('clinic_id')
          .eq('user_id', authData.user.id)
          .single()

        if (clinicError && clinicError.code !== 'PGRST116') {
          console.error('Error checking user clinic:', clinicError)
        }

        // Redirecionar baseado no status do onboarding
        if (userClinic) {
          // Usuário tem clínica, verificar onboarding
          const { data: onboarding } = await supabase
            .from('onboarding_progress')
            .select('completed')
            .eq('clinic_id', userClinic.clinic_id)
            .single()

          if (onboarding?.completed) {
            navigate('/dashboard')
          } else {
            navigate('/onboarding')
          }
        } else {
          // Usuário não tem clínica, iniciar onboarding
          navigate('/onboarding')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      
      if (err instanceof Error) {
        switch (err.message) {
          case 'Invalid login credentials':
            setError('Email ou senha incorretos')
            break
          case 'Email not confirmed':
            setError('Por favor, confirme seu email antes de fazer login')
            break
          case 'Too many requests':
            setError('Muitas tentativas de login. Tente novamente em alguns minutos.')
            break
          default:
            setError('Erro ao fazer login. Tente novamente.')
        }
      } else {
        setError('Erro inesperado. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo e título */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary rounded-xl">
              <Building2 className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clini.One</h1>
              <p className="text-sm text-gray-600">Sistema de Gestão Médica</p>
            </div>
          </div>
        </div>
        
        <h2 className="mt-8 text-center text-2xl font-bold text-gray-900">
          Entre na sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            to="/signup"
            className="font-medium text-primary hover:text-primary-hover transition-colors"
          >
            crie uma nova conta
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-6">
          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(handleLogin)}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-primary hover:text-primary-hover transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Entrar
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Credenciais de Teste
            </h4>
            <div className="text-xs text-blue-800 space-y-1">
              <p><strong>Email:</strong> admin@clinica.com</p>
              <p><strong>Senha:</strong> Clinica123!</p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          © 2024 Clini.One. Sistema desenvolvido para clínicas médicas brasileiras.
        </p>
      </div>
    </div>
  )
}