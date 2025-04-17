import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/patients/PageHeader';
import { SearchAndAddBar } from '@/components/patients/SearchAndAddBar';
import { PatientList } from '@/components/patients/PatientList';
import PatientRecord from '@/components/patients/PatientRecord';
import { Patient, PatientFormData } from '@/types';

const Patients = () => {
  const { activeClinic } = useClinic();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [patientForm, setPatientForm] = useState<PatientFormData>({
    name: '',
    email: '',
    phone: '',
    birthDate: new Date().toISOString().split('T')[0]
  });

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients', activeClinic?.id],
    queryFn: async () => {
      if (!activeClinic?.id) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', activeClinic.id);
      
      if (error) {
        console.error('Erro ao buscar pacientes:', error);
        toast.error("Erro ao carregar pacientes");
        return [];
      }
      
      return data.map((patient: any) => ({
        id: patient.id,
        name: patient.name,
        email: patient.email || '',
        phone: patient.phone || '',
        birthDate: patient.birth_date,
        created_at: patient.created_at,
        updated_at: patient.updated_at,
        clinic_id: patient.clinic_id,
        status: patient.status || 'active',
        lastVisit: patient.last_visit
      }));
    },
    enabled: !!activeClinic?.id
  });

  const addPatientMutation = useMutation({
    mutationFn: async (newPatient: { name: string, email: string, phone: string, birth_date: string, clinic_id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.id] });
      setIsAddPatientOpen(false);
      setPatientForm({
        name: '',
        email: '',
        phone: '',
        birthDate: new Date().toISOString().split('T')[0]
      });
      
      toast("Paciente adicionado", {
        description: "O novo paciente foi cadastrado com sucesso."
      });
    },
    onError: (error) => {
      console.error("Erro ao adicionar paciente:", error);
      toast.error("Erro ao adicionar paciente");
    }
  });

  const deletePatientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.id] });
      toast.success("Paciente removido com sucesso");
    },
    onError: (error) => {
      console.error("Erro ao remover paciente:", error);
      toast.error("Erro ao remover paciente");
    }
  });

  const togglePatientStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { error } = await supabase
        .from('patients')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients', activeClinic?.id] });
      toast.success(`Status do paciente alterado para ${data.status === 'active' ? 'ativo' : 'inativo'}`);
    },
    onError: (error) => {
      console.error("Erro ao alterar status do paciente:", error);
      toast.error("Erro ao alterar status do paciente");
    }
  });

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPatientForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error("Selecione uma clínica para adicionar um paciente");
      return;
    }

    addPatientMutation.mutate({
      name: patientForm.name,
      email: patientForm.email,
      phone: patientForm.phone,
      birth_date: patientForm.birthDate,
      clinic_id: activeClinic.id
    });
  };

  return (
    <DashboardLayout>
      <PageHeader />
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>
              
              <SearchAndAddBar
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isAddPatientOpen={isAddPatientOpen}
                setIsAddPatientOpen={setIsAddPatientOpen}
                patientForm={patientForm}
                handleInputChange={handleInputChange}
                handleAddPatient={handleAddPatient}
              />
            </div>
            
            <TabsContent value="all">
              <div className="rounded-md border">
                <PatientList
                  patients={filteredPatients}
                  isLoading={isLoading}
                  onToggleStatus={(patient) => togglePatientStatusMutation.mutate({
                    id: patient.id,
                    status: patient.status === 'active' ? 'inactive' : 'active'
                  })}
                  onDelete={(id) => deletePatientMutation.mutate(id)}
                  onOpenRecord={(patient) => {
                    setSelectedPatient(patient);
                    setIsRecordModalOpen(true);
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="active">
              <div className="rounded-md border">
                <PatientList
                  patients={filteredPatients.filter(p => p.status === 'active')}
                  isLoading={isLoading}
                  onToggleStatus={(patient) => togglePatientStatusMutation.mutate({
                    id: patient.id,
                    status: 'inactive'
                  })}
                  onDelete={(id) => deletePatientMutation.mutate(id)}
                  onOpenRecord={(patient) => {
                    setSelectedPatient(patient);
                    setIsRecordModalOpen(true);
                  }}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="inactive">
              <div className="rounded-md border">
                <PatientList
                  patients={filteredPatients.filter(p => p.status === 'inactive')}
                  isLoading={isLoading}
                  onToggleStatus={(patient) => togglePatientStatusMutation.mutate({
                    id: patient.id,
                    status: 'active'
                  })}
                  onDelete={(id) => deletePatientMutation.mutate(id)}
                  onOpenRecord={(patient) => {
                    setSelectedPatient(patient);
                    setIsRecordModalOpen(true);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPatient && (
            <PatientRecord 
              patient={selectedPatient} 
              onClose={() => setIsRecordModalOpen(false)} 
              currentUser={user}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Patients;
