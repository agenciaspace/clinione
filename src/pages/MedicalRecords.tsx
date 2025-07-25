import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileText, Search, Calendar, Phone, Mail, User, Clock, Filter, Eye, Plus, Stethoscope, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/sonner';
import { PatientRecordModal } from '@/components/patients/PatientRecordModal';
import { NewMedicalRecordModalWithAutoSave } from '@/components/medical-records/NewMedicalRecordModalWithAutoSave';
import { useDoctor } from '@/hooks/useDoctor';
import { Patient as BasePatient } from '@/types';

interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_cpf: string;
  doctor_id: string;
  doctor_name: string;
  appointment_date: string;
  appointment_type: string;
  diagnosis: string;
  cid_code?: string;
  cid_description?: string;
  treatment: string;
  notes: string;
  medications: string;
  follow_up: string;
  status: 'draft' | 'completed' | 'reviewed';
  created_at: string;
  updated_at: string;
  appointment_id?: string;
}

const MedicalRecords = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const { 
    currentDoctor, 
    isDoctorRole,
    isOwnerRole,
    isSuperAdminRole, 
    canCreateRecords, 
    canEditRecord, 
    canViewAllRecords,
    canSelectAnyDoctor,
    isLoadingDoctor,
    error: doctorError 
  } = useDoctor();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [doctorFilter, setDoctorFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedPatient, setSelectedPatient] = useState<BasePatient | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [doctors, setDoctors] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (activeClinic && !isLoadingDoctor) {
      fetchMedicalRecords();
      fetchDoctors();
    }
  }, [activeClinic, isLoadingDoctor, currentDoctor, canSelectAnyDoctor, isDoctorRole]);

  useEffect(() => {
    filterAndSortRecords();
  }, [records, searchTerm, statusFilter, typeFilter, doctorFilter, sortBy]);

  const fetchDoctors = async () => {
    if (!activeClinic) return;
    
    try {
      let doctorsData = [];
      
      if (canSelectAnyDoctor) {
        // Owners, admins and staff can see all doctors
        const { data, error } = await supabase
          .from('doctors')
          .select('id, name')
          .eq('clinic_id', activeClinic.id);
          
        if (error) {
          console.error('Error fetching doctors:', error);
          return;
        }
        
        doctorsData = data || [];
      } else if (isDoctorRole && currentDoctor) {
        // Doctors can only see themselves in the filter
        doctorsData = [{ id: currentDoctor.id, name: currentDoctor.name }];
      }
      
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMedicalRecords = async () => {
    if (!activeClinic) return;
    
    setIsLoading(true);
    
    try {
      // Build query based on user permissions
      let query = supabase
        .from('appointments')
        .select(`
          id,
          date,
          type,
          notes,
          status,
          created_at,
          updated_at,
          patient_name,
          phone,
          email,
          doctor_id,
          doctor_name,
          clinic_id
        `)
        .eq('clinic_id', activeClinic.id);

      // If user is a doctor, only show their own appointments
      if (isDoctorRole && currentDoctor && !canViewAllRecords) {
        query = query.eq('doctor_id', currentDoctor.id);
      }

      const { data: appointmentsData, error: appointmentsError } = await query
        .order('date', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        toast.error(`Erro ao carregar prontuários: ${appointmentsError.message}`);
        setIsLoading(false);
        return;
      }

      // If no data, just set empty array - this is not an error
      if (!appointmentsData || appointmentsData.length === 0) {
        setRecords([]);
        setIsLoading(false);
        return;
      }

      // Helper function to extract CID from notes
      const extractCIDFromNotes = (notes: string) => {
        if (!notes) return { code: '', description: '' };
        
        // Look for CID pattern in notes: "CID: CODE - DESCRIPTION"
        const cidMatch = notes.match(/CID:\s*([A-Z]\d{2}(?:\.\d)?)\s*-\s*([^\n\r]+)/i);
        if (cidMatch) {
          return {
            code: cidMatch[1].trim(),
            description: cidMatch[2].trim()
          };
        }
        
        return { code: '', description: '' };
      };

      // Helper function to extract description from notes (everything before CID)
      const extractDescriptionFromNotes = (notes: string) => {
        if (!notes) return '';
        
        // Split by CID line and take the first part
        const cidIndex = notes.indexOf('\n\nCID:');
        if (cidIndex > 0) {
          return notes.substring(0, cidIndex).trim();
        }
        
        return notes.trim();
      };

      // Converter appointments para format de prontuário
      const recordsData: MedicalRecord[] = (appointmentsData || []).map(appointment => {
        const notes = appointment.notes || '';
        const cid = extractCIDFromNotes(notes);
        const description = extractDescriptionFromNotes(notes);
        
        return {
          id: `record-${appointment.id}`,
          patient_id: '', // appointments table doesn't have patient_id
          patient_name: appointment.patient_name || '',
          patient_email: appointment.email || '', // Use 'email' field instead of 'patient_email'
          patient_phone: appointment.phone || '', // Use 'phone' field instead of 'patient_phone'
          patient_cpf: '', // appointments table doesn't have patient_cpf
          doctor_id: appointment.doctor_id || '',
          doctor_name: appointment.doctor_name || '',
          appointment_date: appointment.date,
          appointment_type: appointment.type,
          diagnosis: description,
          cid_code: cid.code,
          cid_description: cid.description,
          treatment: '',
          notes,
          medications: '',
          follow_up: '',
          status: appointment.status === 'completed' ? 'completed' : 'draft',
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
          appointment_id: appointment.id
        };
      });

      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortRecords = () => {
    let filtered = records;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.patient_phone.includes(searchTerm) ||
        record.cid_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.cid_description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(record => record.appointment_type === typeFilter);
    }

    // Apply doctor filter
    if (doctorFilter !== 'all') {
      filtered = filtered.filter(record => record.doctor_id === doctorFilter);
    }

    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime();
        case 'patient':
          return a.patient_name.localeCompare(b.patient_name);
        case 'doctor':
          return a.doctor_name.localeCompare(b.doctor_name);
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredRecords(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-yellow-500',
      completed: 'bg-green-500',
      reviewed: 'bg-blue-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      draft: 'Rascunho',
      completed: 'Concluído',
      reviewed: 'Revisado',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      'in-person': 'Presencial',
      'online': 'Online',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatDateOnly = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleViewRecord = (record: MedicalRecord) => {
    // Criar um patient object para o modal
    const basePatient: BasePatient = {
      id: record.patient_id || `temp-${record.appointment_id}`,
      name: record.patient_name,
      email: record.patient_email, // This comes from the mapped data
      phone: record.patient_phone, // This comes from the mapped data
      birthDate: '', // Não temos essa informação aqui
      cpf: record.patient_cpf || '',
      status: 'active',
      clinic_id: activeClinic?.id
    };
    setSelectedPatient(basePatient);
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setSelectedPatient(null);
  };

  const handleNewRecord = () => {
    setIsNewRecordModalOpen(true);
  };

  const handleNewRecordSuccess = () => {
    // Refresh the records list
    fetchMedicalRecords();
    setIsNewRecordModalOpen(false);
  };

  const handlePublishDraft = async (record: MedicalRecord) => {
    try {
      // Update the appointment status from draft to completed
      const { error } = await supabase
        .from('appointments')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', record.appointment_id);

      if (error) throw error;

      toast.success('Prontuário publicado com sucesso!');
      // Refresh the records list
      fetchMedicalRecords();
    } catch (error) {
      console.error('Error publishing draft:', error);
      toast.error('Erro ao publicar rascunho');
    }
  };


  if (isLoading || isLoadingDoctor) {
    return (
      <DashboardLayout>
        <div className="flex h-64 w-full items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show message if no active clinic
  if (!activeClinic) {
    return (
      <DashboardLayout>
        <div className="flex h-64 w-full items-center justify-center">
          <div className="text-center">
            <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma clínica selecionada</h2>
            <p className="text-muted-foreground">
              Selecione uma clínica para visualizar os prontuários médicos.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <FileText className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'} text-primary`} />
            <div>
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold text-foreground`}>
                Prontuários
              </h1>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-muted-foreground`}>
                {activeClinic 
                  ? isDoctorRole && !canSelectAnyDoctor
                    ? `Seus prontuários na ${activeClinic.name}`
                    : `Histórico de todos os prontuários da ${activeClinic.name}`
                  : 'Selecione uma clínica para visualizar prontuários'
                }
              </p>
            </div>
          </div>
          
          {activeClinic && canCreateRecords && (
            <Button 
              size={isMobile ? "default" : "lg"}
              onClick={handleNewRecord}
            >
              <Plus className="h-5 w-5 mr-2" />
              {isMobile ? "Novo" : "Novo Prontuário"}
            </Button>
          )}
          
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4'}`}>
            <div className={`${isMobile ? '' : 'col-span-2'}`}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente, médico, prontuário, CID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="reviewed">Revisado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="in-person">Presencial</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>

            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Médico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os médicos</SelectItem>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data da consulta</SelectItem>
                <SelectItem value="patient">Nome do paciente</SelectItem>
                <SelectItem value="doctor">Médico</SelectItem>
                <SelectItem value="created">Data de criação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Prontuários ({filteredRecords.length})
            </CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRecords.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || doctorFilter !== 'all'
                  ? 'Nenhum prontuário encontrado com os filtros aplicados' 
                  : 'Nenhum prontuário registrado'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`${isMobile ? 'space-y-3' : 'flex items-start justify-between'}`}>
                    <div className={`${isMobile ? 'space-y-3' : 'flex items-start space-x-4 flex-1'}`}>
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(record.patient_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{record.patient_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Dr. {record.doctor_name}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={`${getStatusColor(record.status)} text-white`}
                            >
                              {getStatusLabel(record.status)}
                            </Badge>
                            <Badge variant="outline">
                              {getTypeLabel(record.appointment_type)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className={`${isMobile ? 'space-y-1' : 'flex flex-wrap gap-4'} text-sm text-muted-foreground`}>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(record.appointment_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{record.patient_email}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{record.patient_phone}</span>
                          </div>
                        </div>
                        
                        {record.diagnosis && (
                          <div className="bg-gray-50 rounded-lg p-3 mt-2">
                            <p className="text-sm">
                              <strong>Descrição:</strong> {record.diagnosis}
                            </p>
                          </div>
                        )}
                        
                        {record.cid_code && record.cid_description && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-2">
                            <p className="text-sm">
                              <strong>CID:</strong> {record.cid_code} - {record.cid_description}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className={`${isMobile ? 'flex justify-end space-x-2' : 'flex flex-col space-y-2'} flex-shrink-0`}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewRecord(record)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Prontuário
                      </Button>
                      {record.status === 'draft' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handlePublishDraft(record)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Publicar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Criado em: {formatDateOnly(record.created_at)}</span>
                      <span>ID: {record.appointment_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Record Modal */}
      <PatientRecordModal
        isOpen={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        patient={selectedPatient}
        currentUser={user}
      />

      {/* New Medical Record Modal */}
      {activeClinic && (
        <NewMedicalRecordModalWithAutoSave
          isOpen={isNewRecordModalOpen}
          onClose={() => setIsNewRecordModalOpen(false)}
          clinicId={activeClinic.id}
          onSuccess={handleNewRecordSuccess}
        />
      )}
    </DashboardLayout>
  );
};

export default MedicalRecords;