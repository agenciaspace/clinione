import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import OnboardingWizard from './components/onboarding/OnboardingWizard'
import SupabaseWarning from './components/ui/SupabaseWarning'
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Professionals from './pages/Professionals'
import { isSupabaseConfigured } from './lib/supabase'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <SupabaseWarning />
          {isSupabaseConfigured() ? (
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/signup" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <SignUp />
                  </ProtectedRoute>
                } 
              />

              {/* Protected Routes */}
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute requireAuth={true}>
                    <OnboardingWizard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Dashboard Routes - Require completed onboarding */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireAuth={true} requireOnboarding={true}>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="patients" element={<Patients />} />
                <Route path="professionals" element={<Professionals />} />
                <Route path="records" element={<RecordsPlaceholder />} />
                <Route path="settings" element={<SettingsPlaceholder />} />
              </Route>

              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-600">Configurando Supabase...</p>
              </div>
            </div>
          )}
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

// Placeholder pages
function RecordsPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Prontuários</h1>
        <p className="text-gray-600 mt-1">Sistema de prontuários eletrônicos</p>
      </div>
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Em Desenvolvimento</h3>
        <p className="text-gray-600">Esta funcionalidade será implementada na Fase 2</p>
      </div>
    </div>
  )
}

function SettingsPlaceholder() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-1">Configurações da clínica e sistema</p>
      </div>
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Em Desenvolvimento</h3>
        <p className="text-gray-600">Configurações avançadas em desenvolvimento</p>
      </div>
    </div>
  )
}

export default App