import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar } from 'lucide-react';
import { PreviewBanner } from '@/components/public-clinic/PreviewBanner';
import { ClinicHeader } from '@/components/public-clinic/ClinicHeader';
import { ContactInfo } from '@/components/public-clinic/ContactInfo';
import { DoctorsList } from '@/components/public-clinic/DoctorsList';
import { WorkingHoursComponent } from '@/components/public-clinic/WorkingHours';
import { AppointmentScheduler } from '@/components/public-clinic/AppointmentScheduler';
import { useClinicPublicData } from '@/hooks/useClinicPublicData';
import { webhookEvents } from '@/utils/webhook-service';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const PublicClinicPage: React.FC = () => {
  const { slug, clinicId } = useParams<{ slug: string; clinicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  
  useEffect(() => {
    const isPreviewMode = location.pathname.includes('/dashboard/public-page');
    setIsPreview(isPreviewMode);
    console.log("Modo de preview:", isPreviewMode, "Slug:", slug);
  }, [location.pathname, slug]);

  const { 
    clinic, 
    isLoading, 
    error, 
    availableClinics 
  } = useClinicPublicData(slug, selectedClinicId, isPreview, clinicId);

  // Carregar médicos quando a clínica for carregada
  useEffect(() => {
    const loadDoctors = async () => {
      if (!clinic?.id) {
        console.log('❌ Nenhuma clínica carregada ainda para buscar médicos');
        return;
      }

      console.log('🔍 Carregando médicos para clínica:', clinic.id, clinic.name);
      setLoadingDoctors(true);
      
      try {
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name, speciality, bio, photo_url')
          .eq('clinic_id', clinic.id)
          .order('name');
          
        if (error) {
          console.error('❌ Erro ao carregar médicos:', error);
          setDoctors([]);
          return;
        }
        
        console.log('✅ Médicos carregados com sucesso:', data?.length || 0);
        console.log('📋 Lista de médicos:', data);
        setDoctors(data || []);
      } catch (err) {
        console.error('💥 Erro inesperado ao carregar médicos:', err);
        setDoctors([]);
      } finally {
        setLoadingDoctors(false);
      }
    };
    
    loadDoctors();
  }, [clinic?.id]);

  // Disparar evento de visualização da página quando a clínica for carregada
  useEffect(() => {
    if (clinic && !isPreview) {
      // Disparar evento de visualização da página pública
      webhookEvents.clinics.updated({
        event: 'public_page_viewed',
        clinic_id: clinic.id,
        clinic_name: clinic.name,
        timestamp: new Date().toISOString(),
        slug: clinic.slug
      }, clinic.id);
    }
  }, [clinic, isPreview]);

  // Log para debug
  useEffect(() => {
    if (clinic) {
      console.log("Clínica carregada:", clinic);
      console.log("Logo:", clinic.logo);
      console.log("Photo:", clinic.photo);
      console.log("Horários de funcionamento:", clinic.working_hours);
    }
  }, [clinic]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    console.log('❌ Erro na página pública:', { error, clinic, slug, clinicId, isPreview });
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Página não encontrada</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {error || "A página que você está procurando não foi encontrada ou não está mais disponível."}
          </p>
          
          {slug && (
            <div className="bg-gray-100 p-3 rounded-md mb-4 text-xs sm:text-sm text-gray-700">
              <p><strong>Slug procurado:</strong> {slug}</p>
              <p><strong>URL:</strong> /c/{slug}</p>
            </div>
          )}
          
          {isPreview ? (
            <div className="space-y-2">
              <Button onClick={() => navigate('/dashboard/clinic')} size={isMobile ? "sm" : "default"}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isMobile ? 'Gerenciar Clínica' : 'Ir para Gerenciamento da Clínica'}
              </Button>
              <p className="text-xs text-gray-500">
                Certifique-se de que a clínica foi criada e tem um slug configurado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Button asChild size={isMobile ? "sm" : "default"}>
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isMobile ? 'Página inicial' : 'Voltar à página inicial'}
                </Link>
              </Button>
              <p className="text-xs text-gray-500">
                Esta página pode ter sido removida ou despublicada
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderVisitPublicPage = () => {
    if (clinic && clinic.slug) {
      return `https://clini.one/c/${clinic.slug}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {isPreview && (
        <PreviewBanner
          isPublished={clinic.is_published}
          publicUrl={renderVisitPublicPage()}
          selectedClinicId={selectedClinicId}
          availableClinics={availableClinics}
          onClinicChange={(value) => setSelectedClinicId(value)}
        />
      )}
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ClinicHeader
          name={clinic.name}
          logo={clinic.logo}
          photo={clinic.photo}
          address={clinic.address}
          id={clinic.id}
        />
        
        {/* Appointment Button - Prominent CTA */}
        <div className="mt-6 mb-8">
          <AppointmentScheduler 
            clinicId={clinic.id}
            trigger={
              <Button size={isMobile ? "default" : "lg"} className="w-full sm:w-auto">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Consulta Online
              </Button>
            } 
          />
        </div>
        
        <div className={`${
          isMobile 
            ? 'flex flex-col space-y-6' 
            : 'grid grid-cols-1 lg:grid-cols-3 gap-8'
        }`}>
          {/* Main Content */}
          <div className={`${isMobile ? 'order-1' : 'lg:col-span-2'} space-y-6 sm:space-y-8`}>
            {/* About Section */}
            <section className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Sobre a Clínica</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                {clinic.description || "Nenhuma informação sobre a clínica disponível."}
              </p>
            </section>
            
            {/* Doctors Section */}
            <section className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Nossos Profissionais</h2>
              {loadingDoctors ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando profissionais...</span>
                </div>
              ) : (
                <DoctorsList doctors={doctors} />
              )}
            </section>
          </div>
          
          {/* Sidebar */}
          <div className={`${isMobile ? 'order-2' : 'lg:col-span-1'} space-y-4 sm:space-y-6`}>
            {/* Contact Section */}
            <section className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contato</h2>
              <ContactInfo
                address={clinic.address}
                phone={clinic.phone}
                email={clinic.email}
                website={clinic.website}
              />
            </section>
            
            {/* Working Hours */}
            <section className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 p-4 sm:p-6 rounded-lg shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Horário de Funcionamento</h2>
              <WorkingHoursComponent workingHours={clinic.working_hours} clinicId={clinic.id} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicClinicPage;
