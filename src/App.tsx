
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public clinic pages */}
            <Route path="/c/:slug" element={<PublicClinicPage />} />
            
            {/* Dashboard routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/patients" element={<Patients />} />
            <Route path="/dashboard/doctors" element={<Doctors />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/financial" element={<Financial />} />
            <Route path="/dashboard/marketing" element={<Marketing />} />
            <Route path="/dashboard/clinic" element={<ClinicProfile />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/dashboard/public-page" element={<ClinicProfile />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
