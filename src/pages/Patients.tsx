
import React, { useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/patients/PageHeader';
import { PatientsFilter } from '@/components/patients/PatientsFilter';
import { PatientsTabContent } from '@/components/patients/PatientsTabContent';
import { PatientRecordModal } from '@/components/patients/PatientRecordModal';
import { usePatientManagement } from '@/hooks/mutations/usePatientManagement';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClinic } from '@/contexts/ClinicContext';

const Patients = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const queryClient = useQueryClient();
  const {
    searchTerm,
    setSearchTerm,
    isAddPatientOpen,
    setIsAddPatientOpen,
    selectedPatient,
    setSelectedPatient,
    isRecordModalOpen,
    setIsRecordModalOpen,
    patientForm,
    handleInputChange,
    handleAddPatient,
    handleToggleStatus,
    handleDeletePatient,
    handleUpdatePatient,
    filteredPatients,
    isLoading,
  } = usePatientManagement();

  // Configurar escuta em tempo real para atualizações na tabela de pacientes
  useEffect(() => {
    if (!activeClinic?.id) return;

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
          queryClient.invalidateQueries({ queryKey: ['patients', activeClinic.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeClinic?.id, queryClient]);

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
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
            
            <TabsContent value="active">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'active')}
                isLoading={isLoading}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePatient}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'inactive')}
                isLoading={isLoading}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePatient}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PatientRecordModal
        isOpen={isRecordModalOpen}
        onOpenChange={setIsRecordModalOpen}
        patient={selectedPatient}
        currentUser={user}
      />
    </DashboardLayout>
  );
};

export default Patients;
