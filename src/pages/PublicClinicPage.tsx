
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Phone, Mail, Globe, Clock, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type WorkingHourPeriod = { start: string; end: string }[];

type WorkingHours = {
  monday: WorkingHourPeriod;
  tuesday: WorkingHourPeriod;
  wednesday: WorkingHourPeriod;
  thursday: WorkingHourPeriod;
  friday: WorkingHourPeriod;
  saturday: WorkingHourPeriod;
  sunday: WorkingHourPeriod;
};

type ClinicData = {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_id: string | null;
  instagram_id: string | null;
  working_hours: WorkingHours | null;
  slug: string | null;
  is_published: boolean | null;
};

const PublicClinicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  
  // Verifica se está em modo de preview na dashboard
  useEffect(() => {
    const isPreviewMode = location.pathname.includes('/dashboard/public-page');
    setIsPreview(isPreviewMode);
    console.log("Modo preview:", isPreviewMode);
  }, [location.pathname]);
  
  useEffect(() => {
    const fetchClinicData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Buscando clínica. Modo preview:", isPreview, "Slug:", slug);
        
        let clinicQuery;
        
        if (isPreview) {
          // No modo preview, busca a primeira clínica do usuário logado
          console.log("Buscando primeira clínica para preview");
          clinicQuery = await supabase
            .from('clinics')
            .select('*')
            .limit(1);
            
          console.log("Dados da consulta:", clinicQuery.data);
          console.log("Erro da consulta (se houver):", clinicQuery.error);
          
          if (clinicQuery.error) throw clinicQuery.error;
          
          if (!clinicQuery.data || clinicQuery.data.length === 0) {
            console.log("Nenhuma clínica encontrada, usando mock data");
            // Mock data para preview quando não há clínicas
            setClinic({
              id: "preview-mock-id",
              name: "Clínica Modelo",
              logo: null,
              description: "Esta é uma visualização de exemplo de como sua página pública pode ficar. Adicione informações da sua clínica para personalizar esta página.",
              address: "Av. Exemplo, 123, São Paulo - SP",
              phone: "(11) 1234-5678",
              email: "contato@clinica.exemplo",
              website: "https://clinica.exemplo",
              facebook_id: null,
              instagram_id: null,
              working_hours: {
                monday: [{ start: "08:00", end: "18:00" }],
                tuesday: [{ start: "08:00", end: "18:00" }],
                wednesday: [{ start: "08:00", end: "18:00" }],
                thursday: [{ start: "08:00", end: "18:00" }],
                friday: [{ start: "08:00", end: "18:00" }],
                saturday: [{ start: "08:00", end: "13:00" }],
                sunday: []
              },
              slug: "clinica-modelo",
              is_published: false
            } as ClinicData);
            setIsLoading(false);
            return;
          }
        } else if (slug) {
          // Modo público, busca pela slug específica
          console.log("Buscando clínica pelo slug:", slug);
          clinicQuery = await supabase
            .from('clinics')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .limit(1);
        } else {
          throw new Error("Slug não fornecido");
        }
        
        if (clinicQuery.error) {
          console.error("Erro ao buscar clínica:", clinicQuery.error);
          throw clinicQuery.error;
        }
        
        if (clinicQuery.data && clinicQuery.data.length > 0) {
          const clinicData = clinicQuery.data[0];
          console.log("Clínica encontrada:", clinicData);
          setClinic(clinicData as ClinicData);
        } else {
          console.log("Nenhuma clínica encontrada");
          setError(isPreview 
            ? "Nenhuma clínica encontrada para este usuário." 
            : "Página não encontrada ou não está publicada."
          );
        }
      } catch (error) {
        console.error("Erro:", error);
        setError("Ocorreu um erro ao buscar os dados da clínica.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClinicData();
  }, [slug, isPreview]);
  
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-8">{error || "Clínica não encontrada"}</p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para a página inicial
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Define o nome dos dias da semana em português
  const weekdayNames = {
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    sunday: "Domingo"
  };
  
  const renderWorkingHours = () => {
    if (!clinic.working_hours) return <p className="text-gray-500">Horários não disponíveis</p>;
    
    return (
      <div className="space-y-2">
        {Object.entries(clinic.working_hours).map(([day, periods]) => {
          const dayName = weekdayNames[day as keyof typeof weekdayNames];
          
          return (
            <div key={day} className="flex justify-between items-center">
              <span className="text-gray-600">{dayName}</span>
              <span className="font-medium">
                {periods && periods.length > 0 
                  ? `${periods[0].start} - ${periods[0].end}`
                  : "Fechado"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Define os Médicos fictícios para demonstração
  const dummyDoctors = [
    { id: 1, name: "Dr. João Cardoso", specialty: "Cardiologista", initials: "JC" },
    { id: 2, name: "Dra. Ana Beatriz", specialty: "Dermatologista", initials: "AB" },
    { id: 3, name: "Dr. Ricardo Silva", specialty: "Ortopedista", initials: "RS" },
    { id: 4, name: "Dra. Mariana Costa", specialty: "Pediatra", initials: "MC" }
  ];
  
  // Define avaliações fictícias para demonstração
  const dummyReviews = [
    { id: 1, rating: 5, comment: "Excelente atendimento", author: "Maria S." },
    { id: 2, rating: 4, comment: "Muito bom", author: "João P." },
    { id: 3, rating: 5, comment: "Médicos atenciosos", author: "Carlos F." }
  ];
  
  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };
  
  const renderDoctors = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dummyDoctors.map((doctor) => (
          <div key={doctor.id} className="flex items-center p-4 border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
              {doctor.initials}
            </div>
            <div className="ml-3">
              <p className="font-medium">{doctor.name}</p>
              <p className="text-sm text-gray-500">{doctor.specialty}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderReviews = () => {
    return (
      <div className="space-y-4">
        {dummyReviews.map((review) => (
          <div key={review.id}>
            <div className="flex items-center">
              <span className="text-yellow-400">{renderStars(review.rating)}</span>
              <span className="ml-2 font-medium">{review.comment}</span>
            </div>
            <p className="text-gray-600 text-sm">{review.author}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderVisitPublicPage = () => {
    if (clinic && clinic.slug) {
      return `https://clini.one/c/${clinic.slug}`;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isPreview && (
        <div className="bg-blue-500 text-white text-center py-2">
          <p>
            Modo de visualização. {clinic.is_published 
              ? <span>Esta página está publicada em <a href={renderVisitPublicPage()} target="_blank" rel="noopener noreferrer" className="underline">{renderVisitPublicPage()}</a></span> 
              : "Esta página ainda não está publicada publicamente."}
          </p>
          <Button variant="outline" className="bg-white text-blue-500 mt-2" asChild>
            <Link to="/dashboard/clinic">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para edição
            </Link>
          </Button>
        </div>
      )}
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center pb-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
              {clinic.logo ? (
                <img src={clinic.logo} alt={clinic.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                clinic.name.charAt(0)
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
              <p className="text-gray-500 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {clinic.address ? clinic.address.split(',')[0] : "Endereço não disponível"}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Agendar Consulta
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">Sobre a Clínica</h2>
              <p className="text-gray-700 leading-relaxed">
                {clinic.description || "Informações sobre a clínica não disponíveis."}
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Contato</h2>
              <div className="space-y-3">
                {clinic.address && (
                  <p className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    {clinic.address}
                  </p>
                )}
                
                {clinic.phone && (
                  <p className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    {clinic.phone}
                  </p>
                )}
                
                {clinic.email && (
                  <p className="flex items-center text-gray-700">
                    <Mail className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    {clinic.email}
                  </p>
                )}
                
                {clinic.website && (
                  <p className="flex items-center text-gray-700">
                    <Globe className="h-5 w-5 mr-3 text-blue-500 flex-shrink-0" />
                    {clinic.website}
                  </p>
                )}
              </div>
            </section>
            
            <Separator />
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Nossa Equipe</h2>
              {renderDoctors()}
            </section>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Horários de Funcionamento
              </h2>
              {renderWorkingHours()}
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Consulta
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Avaliações</h2>
              {renderReviews()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicClinicPage;
