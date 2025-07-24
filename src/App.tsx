import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import { EmailVerificationGuard } from "./components/auth/EmailVerificationGuard";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Patients from "./pages/Patients";
import MedicalRecords from "./pages/MedicalRecords";
import Doctors from "./pages/Doctors";
import Reports from "./pages/Reports";
import Financial from "./pages/Financial";

import Settings from "./pages/Settings";
import SettingsLayout from "./pages/SettingsLayout";
import { ProfileSettings } from "./pages/settings/ProfileSettings";
import { SecuritySettings } from "./pages/settings/SecuritySettings";
import { NotificationsSettings } from "./pages/settings/NotificationsSettings";
import { AppearanceSettings } from "./pages/settings/AppearanceSettings";
import { EmailSettings } from "./pages/settings/EmailSettings";
import { WebhooksSettings } from "./pages/settings/WebhooksSettings";
import { ArchivedDataSettings } from "./pages/settings/ArchivedDataSettings";
import ClinicProfile from "./pages/ClinicProfile";
import PublicClinicPage from "./pages/PublicClinicPage";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DevToolToggle } from './components/dev/DevToolToggle';
import { useCleanupOldDrafts } from './hooks/useCleanupOldDrafts';
import { isSubdomain } from './utils/subdomain';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        // Retry up to 3 times with exponential backoff
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false
    },
  },
});

// Component to handle redirect from old format to new format
const RedirectToNewFormat = () => {
  const { slug } = useParams<{ slug: string }>();
  
  console.log('🔍 RedirectToNewFormat called with slug:', slug);
  console.log('🔍 Current URL:', window.location.href);
  
  // COMPREHENSIVE list of ALL auth and system routes that should NEVER be treated as clinic slugs
  const PROTECTED_ROUTES = [
    // Auth routes
    'redefinir-senha', 'reset-password', 'reset-pwd', 'login', 'register', 
    'forgot-password', 'email-confirmation', 'auth',
    // System routes  
    'dashboard', 'api', 'admin', 'app', 'www',
    // Static assets
    'assets', 'static', 'public', 'images', 'css', 'js',
    // Common reserved words
    'help', 'support', 'contact', 'about', 'terms', 'privacy', 'legal',
    // Technical routes
    'robots.txt', 'sitemap.xml', 'favicon.ico', '.well-known'
  ];
  
  // ABSOLUTE PROTECTION: These routes should NEVER reach this component
  if (slug && PROTECTED_ROUTES.includes(slug.toLowerCase())) {
    console.error(`🚨 CRITICAL: Protected route "${slug}" reached RedirectToNewFormat!`);
    console.error('🚨 This should be impossible with correct route ordering!');
    
    // Emergency redirect back to proper route
    const searchParams = new URLSearchParams(window.location.search);
    const queryString = searchParams.toString();
    const targetUrl = `/${slug}${queryString ? '?' + queryString : ''}`;
    
    console.log(`🔄 Emergency redirect to: ${targetUrl}`);
    return <Navigate to={targetUrl} replace />;
  }
  
  // Additional safety: reject slugs that look like file extensions or technical paths
  if (slug && (
    slug.includes('.') || // files like favicon.ico
    slug.startsWith('_') || // _next, _app, etc
    slug.startsWith('-') || // invalid clinic names
    slug.length < 2 || slug.length > 50 || // unreasonable lengths
    /[^a-zA-Z0-9-]/.test(slug) // invalid characters
  )) {
    console.log(`🚫 Invalid slug format: ${slug} - showing 404`);
    return <NotFound />;
  }
  
  // Only redirect valid clinic slugs
  if (slug && /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(slug)) {
    console.log(`✅ Valid clinic slug detected: ${slug} - redirecting to /c/${slug}`);
    return <Navigate to={`/c/${slug}`} replace />;
  }
  
  console.log(`🚫 Unrecognized slug: ${slug} - showing 404`);
  return <NotFound />;
};

const App = () => {
  // Initialize cleanup of old drafts
  useCleanupOldDrafts();
  
  // Force cache invalidation - timestamp: 2025-07-24
  
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <EmailVerificationGuard>
              <ClinicProvider>
                <Toaster />
                <Sonner />
                <OfflineIndicator />
                <PWAInstallPrompt />
                <DevToolToggle />
                <BrowserRouter>
                <Routes>
                {/* AUTH ROUTES - HIGHEST PRIORITY */}
                <Route path="/reset-password-new" element={<ResetPassword />} />
                <Route path="/redefinir-senha" element={<ResetPassword />} />
                <Route path="/redefinir-senha/*" element={<ResetPassword />} />
                <Route path="/reset-pwd" element={<ResetPassword />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                
                {/* MAIN ROUTES */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/calendar" element={<Calendar />} />
                <Route path="/dashboard/patients" element={<Patients />} />
                <Route path="/dashboard/medical-records" element={<MedicalRecords />} />
                <Route path="/dashboard/doctors" element={<Doctors />} />
                <Route path="/dashboard/reports" element={<Reports />} />
                <Route path="/dashboard/financial" element={<Financial />} />
                <Route path="/dashboard/clinic" element={<ClinicProfile />} />
                
                {/* Settings routes with subroutes */}
                <Route path="/dashboard/settings/*" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="/dashboard/settings/profile" replace />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="security" element={<SecuritySettings />} />
                  <Route path="notifications" element={<NotificationsSettings />} />
                  <Route path="appearance" element={<AppearanceSettings />} />
                  <Route path="email" element={<EmailSettings />} />
                  <Route path="webhooks" element={<WebhooksSettings />} />
                  <Route path="archived-data" element={<ArchivedDataSettings />} />
                </Route>
                {/* Public clinic routes */}
                <Route path="/c/:slug" element={<PublicClinicPage />} />
                <Route path="/dashboard/public-page" element={<PublicClinicPage />} />
                <Route path="/dashboard/public-page/:clinicId" element={<PublicClinicPage />} />
                {/* Landing page route for marketing purposes */}
                <Route path="/landing" element={<LandingPage />} />
                
                {/* Legacy redirect for SEO - MUST BE LAST before catch-all */}
                <Route path="/:slug" element={<RedirectToNewFormat />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </ClinicProvider>
          </EmailVerificationGuard>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
