
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/patients/PageHeader';
import PatientRecord from '@/components/patients/PatientRecord';
import { Patient, PatientFormData } from '@/types';
import { usePatients } from '@/hooks/usePatients';
import { PatientsFilter } from '@/components/patients/PatientsFilter';
import { PatientsTabContent } from '@/components/patients/PatientsTabContent';
import { toast } from '@/components/ui/sonner';
import { useQueryClient } from '@tanstack/react-query';
import { usePatientMutations } from '@/hooks/mutations/usePatientMutations';
import { supabase } from '@/integrations/supabase/client'; // Adicionando a importação do supabase

const Patients = () => {
  const queryClient = useQueryClient();
  const { activeClinic } = useClinic();
  const { user } = useAuth();
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

  const { patients, isLoading } = usePatients(activeClinic?.id);
  const { 
    updatePatient, 
    deletePatient, 
    isUpdating, 
    isDeleting 
  } = usePatientMutations(activeClinic?.id);

  // Configurar escuta em tempo real para atualizações na tabela de pacientes
  useEffect(() => {
    if (!activeClinic?.id) return;

    // Inscrever-se em atualizações em tempo real
    const channel = supabase
      .channel('patient-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'patients',
          filter: `clinic_id=eq.${activeClinic.id}`
        }, 
        (payload) => {
          console.log('Alteração em pacientes detectada:', payload);
          // Recarregar os dados de pacientes
          queryClient.invalidateQueries({ queryKey: ['patients', activeClinic.id] });
        }
      )
      .subscribe();

    // Limpeza ao desmontar
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeClinic?.id, queryClient]);

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

    // Implementação para adicionar paciente
  };

  const handleToggleStatus = (patient: Patient) => {
    const newStatus = patient.status === 'active' ? 'inactive' : 'active';
    updatePatient({ ...patient, status: newStatus });
  };

  const handleDeletePatient = (id: string) => {
    deletePatient(id);
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <PageHeader />
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full">
            <PatientsFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              isAddPatientOpen={isAddPatientOpen}
              setIsAddPatientOpen={setIsAddPatientOpen}
              patientForm={patientForm}
              handleInputChange={handleInputChange}
              handleAddPatient={handleAddPatient}
            />
            
            <TabsContent value="all">
              <PatientsTabContent
                patients={filteredPatients}
                isLoading={isLoading}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePatient}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="active">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'active')}
                isLoading={isLoading}
                onToggleStatus={(patient) => handleToggleStatus(patient)}
                onDelete={handleDeletePatient}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'inactive')}
                isLoading={isLoading}
                onToggleStatus={(patient) => handleToggleStatus(patient)}
                onDelete={handleDeletePatient}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
              />
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
