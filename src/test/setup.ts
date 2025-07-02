import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Mock do useIsMobile para os testes
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false)
}))

// Mock do Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

// Mock do React Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null
  })),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children
}))

// Mock do React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/' })),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => 
    React.createElement('a', { href: to }, children),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children
}))

// Mock dos contexts
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn()
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}))

vi.mock('@/contexts/ClinicContext', () => ({
  useClinic: vi.fn(() => ({
    activeClinic: null,
    clinics: [],
    isLoading: false,
    setActiveClinic: vi.fn()
  })),
  ClinicProvider: ({ children }: { children: React.ReactNode }) => children
})) 