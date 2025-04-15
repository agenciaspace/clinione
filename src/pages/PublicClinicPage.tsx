
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Calendar, 
  Facebook, 
  Instagram,
  Star,
  ChevronRight,
  X,
  User,
  CalendarRange,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

// Dados mockados para exemplo
const mockClinic = {
  id: '1',
  name: 'Clínica Saúde & Bem-estar',
  slug: 'clinica-saude-bem-estar',
  logo: '', // Seria a URL da imagem
  address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
  cep: '01310-100',
  phone: '(11) 3000-5000',
  whatsapp: '(11) 99999-9999',
  email: 'contato@clinicasaude.com',
  website: 'www.clinicasaude.com',
  about: 'Somos uma clínica multiprofissional dedicada à saúde e bem-estar. Oferecemos atendimento em diversas especialidades com profissionais altamente qualificados e infraestrutura moderna para proporcionar o melhor cuidado aos nossos pacientes.',
  specialties: ['Cardiologia', 'Dermatologia', 'Ortopedia', 'Pediatria', 'Psicologia'],
  socialMedia: {
    facebook: 'clinicasaude',
    instagram: 'clinica_saude',
  },
  workingHours: {
    monday: [{ start: '08:00', end: '18:00' }],
    tuesday: [{ start: '08:00', end: '18:00' }],
    wednesday: [{ start: '08:00', end: '18:00' }],
    thursday: [{ start: '08:00', end: '18:00' }],
    friday: [{ start: '08:00', end: '18:00' }],
    saturday: [{ start: '08:00', end: '12:00' }],
    sunday: [],
  },
};

const mockDoctors = [
  {
    id: '1',
    name: 'Dr. João Cardoso',
    specialty: 'Cardiologista',
    crm: 'CRM 123456',
    photo: '',
    bio: 'Médico com mais de 15 anos de experiência. Especialista em cardiologia intervencionista.'
  },
  {
    id: '2',
    name: 'Dra. Ana Beatriz',
    specialty: 'Dermatologista',
    crm: 'CRM 654321',
    photo: '',
    bio: 'Especialista em dermatologia clínica e estética. Pós-graduada pela Universidade de São Paulo.'
  },
  {
    id: '3',
    name: 'Dr. Carlos Oliveira',
    specialty: 'Ortopedista',
    crm: 'CRM 789012',
    photo: '',
    bio: 'Especialista em traumatologia e ortopedia. Foco em lesões esportivas e tratamentos minimamente invasivos.'
  }
];

const mockServices = [
  {
    id: '1',
    name: 'Consulta Médica',
    description: 'Consulta com especialista para diagnóstico e acompanhamento',
    duration: 30,
    price: 250
  },
  {
    id: '2',
    name: 'Check-up Completo',
    description: 'Avaliação completa de saúde com exames laboratoriais',
    duration: 120,
    price: 800
  },
  {
    id: '3',
    name: 'Exame de Eletrocardiograma',
    description: 'Avaliação da atividade elétrica do coração',
    duration: 20,
    price: 150
  }
];

const mockReviews = [
  {
    id: '1',
    author: 'Maria Silva',
    rating: 5,
    date: '2023-11-10',
    comment: 'Excelente atendimento! Toda a equipe foi muito atenciosa e cuidadosa.'
  },
  {
    id: '2',
    author: 'João Pereira',
    rating: 4,
    date: '2023-10-22',
    comment: 'Ótima estrutura e atendimento rápido. Recomendo!'
  },
  {
    id: '3',
    author: 'Ana Oliveira',
    rating: 5,
    date: '2023-09-15',
    comment: 'Atendimento humanizado e profissionais muito competentes. Saí com todas as minhas dúvidas esclarecidas.'
  }
];

// Opções de horário disponíveis para agendamento (mockado)
const availableTimes = [
  "08:00", "08:30", "09:00", "09:30", "10:00", 
  "10:30", "11:00", "14:00", "14:30", "15:00", 
  "15:30", "16:00", "16:30", "17:00", "17:30"
];

const weekdayLabels = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const PublicClinicPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  // States para agendamento
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [dateRange, setDateRange] = useState<any>(undefined);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  
  // Num cenário real, buscaríamos os dados da clínica com base no slug
  // Por enquanto, usamos os dados mockados
  const clinic = mockClinic;

  // Form para agendamento
  const bookingForm = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      date: '',
      time: '',
      doctor: '',
      service: ''
    }
  });

  // Form para avaliação
  const reviewForm = useForm({
    defaultValues: {
      name: '',
      rating: 5,
      comment: '',
    }
  });

  // Funções de submissão
  const handleBookingSubmit = (data: any) => {
    // Em um caso real, enviaríamos esses dados para o servidor
    console.log('Agendamento:', data);
    toast({
      title: "Agendamento realizado!",
      description: `Sua consulta foi agendada com sucesso para ${data.date} às ${data.time}.`,
    });
    setIsBookingOpen(false);
  };

  const handleReviewSubmit = (data: any) => {
    // Em um caso real, enviaríamos a avaliação para o servidor
    console.log('Avaliação:', {...data, rating});
    toast({
      title: "Avaliação enviada!",
      description: "Obrigado por compartilhar sua experiência.",
    });
    setIsReviewDialogOpen(false);
    reviewForm.reset();
  };
  
  // Renderizar estrelas com base na avaliação
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Componente de seleção de estrelas interativas
  const RatingSelector = () => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
          >
            <Star 
              className={`h-6 w-6 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com informações básicas */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            {clinic.logo ? (
              <img 
                src={clinic.logo} 
                alt={clinic.name} 
                className="w-12 h-12 rounded-full object-contain mr-3" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-healthblue-100 flex items-center justify-center text-healthblue-600 font-bold text-lg mr-3">
                {clinic.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{clinic.name}</h1>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{clinic.address.split('-')[0]}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <a 
              href={`https://wa.me/${clinic.whatsapp?.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm"
            >
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </a>
            
            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Agendar Consulta</DialogTitle>
                </DialogHeader>

                <Form {...bookingForm}>
                  <form onSubmit={bookingForm.handleSubmit(handleBookingSubmit)} className="space-y-4">
                    {/* Dados pessoais */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bookingForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={bookingForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="seu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Seleção de serviço e profissional */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Serviço</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedService(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um serviço" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockServices.map((service) => (
                                  <SelectItem key={service.id} value={service.id}>
                                    {service.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bookingForm.control}
                        name="doctor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profissional</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedDoctor(value);
                              }}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um profissional" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {mockDoctors.map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Data e hora */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={bookingForm.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma data" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[...Array(7)].map((_, i) => {
                                  const date = new Date();
                                  date.setDate(date.getDate() + i + 1);
                                  const formattedDate = format(date, "EEEE, dd/MM", { locale: ptBR });
                                  const valueDate = format(date, "yyyy-MM-dd");
                                  return (
                                    <SelectItem key={i} value={valueDate}>
                                      {formattedDate}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={bookingForm.control}
                        name="time"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={!bookingForm.getValues('date')}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={!bookingForm.getValues('date') ? "Selecione uma data primeiro" : "Selecione um horário"} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableTimes.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Observações */}
                    <FormField
                      control={bookingForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Alguma informação adicional importante?" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button type="submit">Confirmar Agendamento</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      
      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="about" className="space-y-8">
          <div className="bg-white rounded-lg shadow p-4 sticky top-0 z-10">
            <TabsList className="grid grid-cols-4 md:grid-cols-4">
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="doctors">Profissionais</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Aba Sobre */}
          <TabsContent value="about" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Sobre a Clínica</h2>
                    <p className="text-gray-700">
                      {clinic.about}
                    </p>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold text-lg mb-3">Nossas Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {clinic.specialties.map(specialty => (
                          <Badge key={specialty} variant="secondary">{specialty}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-4">Localização</h2>
                    <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      {/* Aqui seria incorporado o mapa */}
                      <div className="text-gray-500">Mapa da localização</div>
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-start text-gray-700">
                        <MapPin className="h-5 w-5 mr-2 text-healthblue-500 shrink-0 mt-0.5" />
                        <span>{clinic.address}, {clinic.cep}</span>
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">
                        Como chegar
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold mb-4">Informações de Contato</h2>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 mr-3 text-healthblue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Telefone</p>
                          <p className="text-gray-600">{clinic.phone}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 mr-3 text-healthblue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-gray-600">{clinic.email}</p>
                        </div>
                      </div>
                      
                      {clinic.website && (
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 mr-3 text-healthblue-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium">Website</p>
                            <a 
                              href={`https://${clinic.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-healthblue-600 hover:underline"
                            >
                              {clinic.website}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start">
                        <Clock className="h-5 w-5 mr-3 text-healthblue-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Horário de Funcionamento</p>
                          <div className="text-gray-600 text-sm mt-1 space-y-1">
                            {Object.entries(clinic.workingHours).map(([day, periods]) => (
                              <div key={day} className="flex justify-between">
                                <span>{weekdayLabels[day as keyof typeof weekdayLabels]}:</span>
                                <span>
                                  {periods.length > 0 
                                    ? `${periods[0].start} - ${periods[0].end}` 
                                    : 'Fechado'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div>
                      <p className="font-medium mb-2">Redes Sociais</p>
                      <div className="flex space-x-2">
                        {clinic.socialMedia?.facebook && (
                          <a 
                            href={`https://facebook.com/${clinic.socialMedia.facebook}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                          >
                            <Facebook className="h-5 w-5" />
                            <span className="sr-only">Facebook</span>
                          </a>
                        )}
                        
                        {clinic.socialMedia?.instagram && (
                          <a 
                            href={`https://instagram.com/${clinic.socialMedia.instagram}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100"
                          >
                            <Instagram className="h-5 w-5" />
                            <span className="sr-only">Instagram</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Agendar Consulta
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </TabsContent>
          
          {/* Aba Profissionais */}
          <TabsContent value="doctors" className="space-y-6">
            <h2 className="text-2xl font-bold">Nossa Equipe</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDoctors.map(doctor => (
                <Card key={doctor.id} className="overflow-hidden">
                  <div className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                    {doctor.photo ? (
                      <img 
                        src={doctor.photo} 
                        alt={doctor.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-healthblue-100 flex items-center justify-center text-healthblue-600 font-bold text-xl">
                        {doctor.name.split(' ').map(n => n.charAt(0)).join('')}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                    <p className="text-healthblue-600 font-medium">{doctor.specialty}</p>
                    <p className="text-sm text-gray-500 mb-3">{doctor.crm}</p>
                    <p className="text-gray-700">{doctor.bio}</p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-4">
                          <CalendarRange className="h-4 w-4 mr-2" />
                          Ver horários disponíveis
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Horários de {doctor.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="flex flex-col">
                            <h4 className="font-medium mb-2">Próximos dias disponíveis:</h4>
                            <div className="grid grid-cols-3 gap-2">
                              {[...Array(6)].map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() + i + 1);
                                return (
                                  <Button
                                    key={i}
                                    variant="outline"
                                    className="justify-start text-left"
                                    onClick={() => setIsBookingOpen(true)}
                                  >
                                    <div className="text-left">
                                      <div className="font-medium">{format(date, "dd/MM", { locale: ptBR })}</div>
                                      <div className="text-xs text-gray-500">{format(date, "EEEE", { locale: ptBR })}</div>
                                    </div>
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Button className="w-full" onClick={() => setIsBookingOpen(true)}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Agendar Consulta
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Aba Serviços */}
          <TabsContent value="services" className="space-y-6">
            <h2 className="text-2xl font-bold">Nossos Serviços</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockServices.map(service => (
                <Card key={service.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold">{service.name}</h3>
                        <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{service.duration} minutos</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-healthblue-600">
                          R$ {service.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setIsBookingOpen(true)}
                    >
                      Agendar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Aba Avaliações */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Avaliações de Pacientes</h2>
              <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Deixar Avaliação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Conte sua experiência</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...reviewForm}>
                    <form onSubmit={reviewForm.handleSubmit(handleReviewSubmit)} className="space-y-4">
                      <FormField
                        control={reviewForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel>Avaliação</FormLabel>
                        <RatingSelector />
                      </FormItem>
                      
                      <FormField
                        control={reviewForm.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Seu comentário</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Conte sobre sua experiência..." 
                                className="resize-none min-h-[100px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Enviar Avaliação</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-4xl font-bold text-gray-900">4.7</div>
                <div>
                  <div className="flex">
                    {renderStars(5)}
                  </div>
                  <p className="text-sm text-gray-500">{mockReviews.length} avaliações</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {mockReviews.map(review => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{review.author}</p>
                        <div className="flex mt-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} {clinic.name}. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-healthblue-600"
              >
                Política de Privacidade
              </a>
              <a 
                href="#" 
                className="text-sm text-gray-500 hover:text-healthblue-600"
              >
                Termos de Uso
              </a>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 mt-4">
            Página gerada por ClínicaDigitalHub
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicClinicPage;
