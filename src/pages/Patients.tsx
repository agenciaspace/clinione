
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
    isRecordModalOpen,
    patientForm,
    handleInputChange,
    handleAddPatient,
    handleToggleStatus,
    handleDeletePatient,
    handleUpdatePatient,
    handleOpenRecordModal,
    handleCloseRecordModal,
    filteredPatients,
    isLoading,
  } = usePatientManagement();

  // Configurar escuta em tempo real para atualizações na tabela de pacientes
  useEffect(() => {
    if (!activeClinic?.id) return;

    // Criar um nome de canal único para evitar sobreposições
    const channelName = `patient-changes-${activeClinic.id}-${Date.now()}`;
    
    // Remover canais antigos com prefixo semelhante
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic && ch.topic.startsWith(`patient-changes-${activeClinic.id}`)) {
        console.log('Removendo canal antigo de pacientes:', ch.topic);
        supabase.removeChannel(ch);
      }
    });

    // Criar novo canal com um pequeno delay para evitar condições de corrida
    const setupChannelTimer = setTimeout(() => {
      console.log('Configurando novo canal para pacientes:', channelName);
      const channel = supabase
        .channel(channelName)
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
        console.log('Removendo canal de pacientes ao desmontar:', channelName);
        supabase.removeChannel(channel);
      };
    }, 500); // Delay para evitar problemas de sincronização

    return () => {
      clearTimeout(setupChannelTimer);
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
                onOpenRecord={handleOpenRecordModal}
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
            
            <TabsContent value="active">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'active')}
                isLoading={isLoading}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePatient}
                onOpenRecord={handleOpenRecordModal}
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <PatientsTabContent
                patients={filteredPatients.filter(p => p.status === 'inactive')}
                isLoading={isLoading}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePatient}
                onOpenRecord={handleOpenRecordModal}
                onUpdatePatient={handleUpdatePatient}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <PatientRecordModal
        isOpen={isRecordModalOpen}
        onOpenChange={handleCloseRecordModal}
        patient={selectedPatient}
        currentUser={user}
      />
    </DashboardLayout>
  );
};

export default Patients;
