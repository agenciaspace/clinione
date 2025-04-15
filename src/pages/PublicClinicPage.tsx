
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
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

// Default working hours template for the preview mode
const defaultWorkingHours: WorkingHours = {
  monday: [{ start: '08:00', end: '18:00' }],
  tuesday: [{ start: '08:00', end: '18:00' }],
  wednesday: [{ start: '08:00', end: '18:00' }],
  thursday: [{ start: '08:00', end: '18:00' }],
  friday: [{ start: '08:00', end: '18:00' }],
  saturday: [{ start: '08:00', end: '13:00' }],
  sunday: []
};

const PublicClinicPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [availableClinics, setAvailableClinics] = useState<{ id: string; name: string }[]>([]);
  
  // Check if in preview mode
  useEffect(() => {
    const isPreviewMode = location.pathname.includes('/dashboard/public-page');
    setIsPreview(isPreviewMode);
    console.log("Preview mode:", isPreviewMode);
  }, [location.pathname]);
  
  // Fetch available clinics in preview mode
  useEffect(() => {
    if (isPreview) {
      const fetchAvailableClinics = async () => {
        try {
          const { data, error } = await supabase
            .from('clinics')
            .select('id, name')
            .order('name');
            
          if (error) {
            console.error("Error fetching clinics:", error);
            return;
          }
          
          if (data && data.length > 0) {
            setAvailableClinics(data);
            // Select first clinic by default
            if (!selectedClinicId) {
              setSelectedClinicId(data[0].id);
            }
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };
      
      fetchAvailableClinics();
    }
  }, [isPreview, selectedClinicId]);
  
  useEffect(() => {
    const fetchClinicData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching clinic. Preview mode:", isPreview, "Slug:", slug, "Selected ID:", selectedClinicId);
        
        let clinicQuery;
        
        if (isPreview) {
          // In preview mode, fetch by ID if selected, otherwise fetch first clinic
          if (selectedClinicId) {
            console.log("Fetching clinic by ID for preview:", selectedClinicId);
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .eq('id', selectedClinicId)
              .single();
          } else {
            console.log("Fetching first clinic for preview");
            clinicQuery = await supabase
              .from('clinics')
              .select('*')
              .limit(1)
              .single();
          }
          
          console.log("Query results:", clinicQuery.data);
          console.log("Query error (if any):", clinicQuery.error);
          
          if (clinicQuery.error && clinicQuery.error.code !== 'PGRST116') { // PGRST116 is "no rows found"
            throw clinicQuery.error;
          }
          
          if (!clinicQuery.data) {
            // If no data, create example preview clinic
            const exampleClinic: ClinicData = {
              id: "preview-example",
              name: "Example Clinic",
              logo: null,
              description: "This is an example of how your public page will look. Add your clinic information to customize this page.",
              address: "123 Example St, City, State",
              phone: "(555) 123-4567",
              email: "contact@example-clinic.com",
              website: "www.example-clinic.com",
              facebook_id: null,
              instagram_id: null,
              working_hours: defaultWorkingHours,
              slug: "example-clinic",
              is_published: false
            };
            setClinic(exampleClinic);
            setIsLoading(false);
            return;
          }
        } else if (slug) {
          // Public mode, fetch by slug
          console.log("Fetching clinic by slug:", slug);
          clinicQuery = await supabase
            .from('clinics')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();
            
          if (clinicQuery.error) {
            console.error("Error fetching by slug:", clinicQuery.error);
            throw new Error("Clinic page not found or not published");
          }
          
          if (!clinicQuery.data) {
            throw new Error("Clinic page not found");
          }
        } else {
          throw new Error("No slug provided");
        }
        
        const clinicData = clinicQuery.data;
        console.log("Clinic found:", clinicData);
        
        setClinic({
          id: clinicData.id,
          name: clinicData.name,
          logo: clinicData.logo,
          description: clinicData.description,
          address: clinicData.address,
          phone: clinicData.phone,
          email: clinicData.email,
          website: clinicData.website,
          facebook_id: clinicData.facebook_id,
          instagram_id: clinicData.instagram_id,
          working_hours: clinicData.working_hours || defaultWorkingHours,
          slug: clinicData.slug,
          is_published: clinicData.is_published
        });
      } catch (error: any) {
        console.error("Error:", error);
        setError(isPreview 
          ? "No clinics found. Please create a clinic first." 
          : error.message || "Page not found or not published."
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClinicData();
  }, [slug, isPreview, selectedClinicId]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error || !clinic) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600 mb-8">{error || "Clinic not found"}</p>
          {isPreview ? (
            <Button onClick={() => navigate('/dashboard/clinic')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Clinic Management
            </Button>
          ) : (
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to home page
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  // Day names in Portuguese
  const weekdayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday"
  };
  
  const renderWorkingHours = () => {
    if (!clinic.working_hours) return <p className="text-gray-500">Hours not available</p>;
    
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
                  : "Closed"}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Dummy doctors for demonstration
  const dummyDoctors = [
    { id: 1, name: "Dr. John Smith", specialty: "Cardiologist", initials: "JS" },
    { id: 2, name: "Dr. Anna Miller", specialty: "Dermatologist", initials: "AM" },
    { id: 3, name: "Dr. Richard Brown", specialty: "Orthopedist", initials: "RB" },
    { id: 4, name: "Dr. Maria Garcia", specialty: "Pediatrician", initials: "MG" }
  ];
  
  // Dummy reviews for demonstration
  const dummyReviews = [
    { id: 1, rating: 5, comment: "Excellent service", author: "Mary S." },
    { id: 2, rating: 4, comment: "Very good", author: "John P." },
    { id: 3, rating: 5, comment: "Attentive doctors", author: "Carlos F." }
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
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p className="mb-2 md:mb-0">
                  Preview Mode {clinic.is_published 
                    ? <span>This page is published at <a href={renderVisitPublicPage()} target="_blank" rel="noopener noreferrer" className="underline">{renderVisitPublicPage()}</a></span> 
                    : "This page is not yet published."}
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                {availableClinics.length > 0 && (
                  <div className="flex items-center">
                    <select
                      className="px-2 py-1 rounded text-blue-500 border-none"
                      value={selectedClinicId || ''}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                    >
                      {availableClinics.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <Button variant="outline" className="bg-white text-blue-500" asChild>
                  <Link to="/dashboard/clinic">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
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
                {clinic.address ? clinic.address.split(',')[0] : "Address not available"}
              </p>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">About the Clinic</h2>
              <p className="text-gray-700 leading-relaxed">
                {clinic.description || "No clinic information available."}
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4">Contact</h2>
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
              <h2 className="text-xl font-semibold mb-4">Our Team</h2>
              {renderDoctors()}
            </section>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Working Hours
              </h2>
              {renderWorkingHours()}
              
              <div className="mt-6">
                <Button variant="outline" className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Reviews</h2>
              {renderReviews()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicClinicPage;
