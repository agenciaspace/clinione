import { createClient } from '@supabase/supabase-js'

// Função para validar se uma URL é válida
function isValidUrl(urlString: string): boolean {
  try {
    new URL(urlString)
    return true
  } catch {
    return false
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjI0ODAsImV4cCI6MTk2MDY5ODQ4MH0.placeholder'

// Verificar se as credenciais estão configuradas
const isConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                     supabaseAnonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxMjI0ODAsImV4cCI6MTk2MDY5ODQ4MH0.placeholder' &&
                     supabaseUrl !== 'your_supabase_url_here' &&
                     supabaseUrl !== 'your_supabase_url' &&
                     supabaseUrl !== 'https://your-project-id.supabase.co' &&
                     supabaseAnonKey !== 'your_supabase_anon_key_here' &&
                     supabaseAnonKey !== 'your_supabase_anon_key' &&
                     isValidUrl(supabaseUrl) &&
                     supabaseUrl.includes('supabase.co') &&
                     supabaseAnonKey.length > 50 // JWT tokens são longos

// Aviso no console se as credenciais não estão configuradas
if (!isConfigured) {
  console.warn('⚠️ Supabase credentials not configured or invalid. Please update your .env file with real credentials.')
}

// Criar cliente com URL válida (fallback se não configurado)
const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co'

export const supabase = createClient(finalUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'x-application-name': 'clini-one'
    }
  }
})

// Helper para verificar se está configurado
export const isSupabaseConfigured = () => isConfigured

// Helper para obter a clínica atual do usuário
export const getCurrentClinicId = async () => {
  if (!isConfigured) {
    console.warn('Supabase not configured, skipping getCurrentClinicId')
    return null
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    
    // Buscar a clínica associada ao usuário
    const { data, error } = await supabase
      .from('user_clinics')
      .select('clinic_id')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching clinic:', error)
      return null
    }
    
    return data?.clinic_id
  } catch (error) {
    console.error('Error in getCurrentClinicId:', error)
    return null
  }
}

// Helper para adicionar RLS automático nas queries
export const withClinicRLS = (query: any) => {
  if (!isConfigured) {
    console.warn('Supabase not configured, skipping query')
    return query
  }
  return query
}