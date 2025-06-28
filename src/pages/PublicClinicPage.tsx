
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { PreviewBanner } from '@/components/public-clinic/PreviewBanner';
import { ClinicHeader } from '@/components/public-clinic/ClinicHeader';
import { ContactInfo } from '@/components/public-clinic/ContactInfo';
import { DoctorsList } from '@/components/public-clinic/DoctorsList';
import { WorkingHoursComponent } from '@/components/public-clinic/WorkingHours';
import { useClinicPublicData } from '@/hooks/useClinicPublicData';
import { webhookEvents } from '@/utils/webhook-service';
import { supabase } from '@/integrations/supabase/client';

const PublicClinicPage: React.FC = () => {
  const { slug, clinicId } = useParams<{ slug: string; clinicId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ops!</h1>
          <p className="text-gray-600 mb-8">{error || "Clínica não encontrada"}</p>
          {isPreview ? (
            <Button onClick={() => navigate('/dashboard/clinic')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ir para Gerenciamento da Clínica
            </Button>
          ) : (
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar à página inicial
              </Link>
            </Button>
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
    <div className="min-h-screen bg-gray-50">
      {isPreview && (
        <PreviewBanner
          isPublished={clinic.is_published}
          publicUrl={renderVisitPublicPage()}
          selectedClinicId={selectedClinicId}
          availableClinics={availableClinics}
          onClinicChange={(value) => setSelectedClinicId(value)}
        />
      )}
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ClinicHeader
          name={clinic.name}
          logo={clinic.logo}
          photo={clinic.photo}
          address={clinic.address}
          id={clinic.id}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Sobre a Clínica</h2>
              <p className="text-gray-700 leading-relaxed">
                {clinic.description || "Nenhuma informação sobre a clínica disponível."}
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Contato</h2>
              <ContactInfo
                address={clinic.address}
                phone={clinic.phone}
                email={clinic.email}
                website={clinic.website}
              />
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Nossa Equipe</h2>
              {loadingDoctors ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-gray-600">Carregando profissionais...</span>
                </div>
              ) : (
                <DoctorsList doctors={doctors} />
              )}
            </section>
          </div>
          
          <div className="space-y-6">
            <WorkingHoursComponent workingHours={clinic.working_hours} clinicId={clinic.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicClinicPage;
