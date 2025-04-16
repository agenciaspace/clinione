
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClinicProvider } from "./contexts/ClinicContext";
import { RoleBasedRoute } from "./components/auth/RoleBasedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Reports from "./pages/Reports";
import Financial from "./pages/Financial";
import Marketing from "./pages/Marketing";
import Settings from "./pages/Settings";
import ClinicProfile from "./pages/ClinicProfile";
import PublicClinicPage from "./pages/PublicClinicPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/patients" element={<Patients />} />
              <Route path="/dashboard/doctors" element={<Doctors />} />
              <Route path="/dashboard/reports" element={<Reports />} />
              <Route path="/dashboard/financial" element={<Financial />} />
              <Route path="/dashboard/marketing" element={<Marketing />} />
              <Route path="/dashboard/clinic" element={<ClinicProfile />} />
              <Route path="/dashboard/settings" element={
                <RoleBasedRoute requiredRoles={['admin']}>
                  <Settings />
                </RoleBasedRoute>
              } />
              {/* Public clinic routes */}
              <Route path="/c/:slug" element={<PublicClinicPage />} />
              <Route path="/dashboard/public-page" element={<PublicClinicPage />} />
              {/* Redirect from old format to new format */}
              <Route path="/:slug" element={<Navigate to="/c/:slug" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ClinicProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
