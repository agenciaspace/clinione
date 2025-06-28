
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Reports from "./pages/Reports";
import Financial from "./pages/Financial";

import Settings from "./pages/Settings";
import ClinicProfile from "./pages/ClinicProfile";
import PublicClinicPage from "./pages/PublicClinicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
      <AuthProvider>
        <ClinicProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/patients" element={<Patients />} />
              <Route path="/dashboard/doctors" element={<Doctors />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/dashboard/financial" element={<Financial />} />

              <Route path="/dashboard/clinic" element={<ClinicProfile />} />
              {/* Temporarily remove role-based protection for Settings page */}
              <Route path="/dashboard/settings" element={<Settings />} />
              {/* Public clinic routes */}
              <Route path="/c/:slug" element={<PublicClinicPage />} />
              <Route path="/dashboard/public-page" element={<PublicClinicPage />} />
              {/* Redirect from old format to new format - only for specific patterns */}
              <Route path="/:slug" element={<RedirectToNewFormat />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClinicProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
