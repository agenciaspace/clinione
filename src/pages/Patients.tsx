
import React, { useEffect, useRef } from 'react';
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
import { RealtimeChannel } from '@supabase/supabase-js';

const Patients = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const queryClient = useQueryClient();
  const patientChannelRef = useRef<RealtimeChannel | null>(null);
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
    
    // Cleanup any existing channel first
    if (patientChannelRef.current) {
      try {
        console.log('Removendo canal de pacientes existente:', patientChannelRef.current.topic);
        supabase.removeChannel(patientChannelRef.current);
      } catch (error) {
        console.error('Erro ao remover canal de pacientes:', error);
      }
      patientChannelRef.current = null;
    }
    
    // Wait a small amount of time before creating a new channel
    const setupChannelTimer = setTimeout(() => {
      // Create a unique channel name with timestamp
      const channelName = `patient-changes-${activeClinic.id}-${Date.now()}`;
      console.log('Configurando novo canal para pacientes:', channelName);
      
      try {
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
          .subscribe((status) => {
            console.log(`Canal de pacientes ${channelName} status:`, status);
          });
          
        patientChannelRef.current = channel;
      } catch (error) {
        console.error('Erro ao configurar canal de pacientes:', error);
      }
    }, 1000); // Increased delay to ensure proper cleanup

    // Cleanup on unmount or when activeClinic changes
    return () => {
      clearTimeout(setupChannelTimer);
      if (patientChannelRef.current) {
        try {
          console.log('Removendo canal de pacientes ao desmontar:', patientChannelRef.current.topic);
          supabase.removeChannel(patientChannelRef.current);
        } catch (error) {
          console.error('Erro ao remover canal de pacientes durante limpeza:', error);
        }
        patientChannelRef.current = null;
      }
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
