import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Patients from "./pages/Patients";
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
import ClinicProfile from "./pages/ClinicProfile";
import PublicClinicPage from "./pages/PublicClinicPage";
import NotFound from "./pages/NotFound";
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

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
      refetchOnReconnect: 'always'
    },
  },
});

// Component to handle redirect from old format to new format
const RedirectToNewFormat = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // Only redirect if it looks like a clinic slug (avoid conflicts with other routes)
  if (slug && !slug.includes('/') && slug.length > 2) {
    return <Navigate to={`/c/${slug}`} replace />;
  }
  
  // If it doesn't look like a valid slug, show 404
  return <NotFound />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <ClinicProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <PWAInstallPrompt />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/calendar" element={<Calendar />} />
                <Route path="/dashboard/patients" element={<Patients />} />
                <Route path="/dashboard/doctors" element={<Doctors />} />
                <Route path="/dashboard/reports" element={<Reports />} />
                <Route path="/dashboard/financial" element={<Financial />} />

                <Route path="/dashboard/clinic" element={<ClinicProfile />} />
                
                {/* Settings routes with subroutes */}
                <Route path="/dashboard/settings" element={<SettingsLayout />}>
                  <Route index element={<Navigate to="/dashboard/settings/profile" replace />} />
                  <Route path="profile" element={<ProfileSettings />} />
                  <Route path="security" element={<SecuritySettings />} />
                  <Route path="notifications" element={<NotificationsSettings />} />
                  <Route path="appearance" element={<AppearanceSettings />} />
                  <Route path="email" element={<EmailSettings />} />
                  <Route path="webhooks" element={<WebhooksSettings />} />
                </Route>
                {/* Public clinic routes */}
                <Route path="/c/:slug" element={<PublicClinicPage />} />
                <Route path="/dashboard/public-page" element={<PublicClinicPage />} />
                <Route path="/dashboard/public-page/:clinicId" element={<PublicClinicPage />} />
                {/* Redirect from old format to new format - only for specific patterns */}
                <Route path="/:slug" element={<RedirectToNewFormat />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ClinicProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
