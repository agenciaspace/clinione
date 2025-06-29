
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
import { Patient } from '@/types';

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
    
    // Limpar canal existente
    if (patientChannelRef.current) {
      try {
        supabase.removeChannel(patientChannelRef.current);
      } catch (error) {
        console.error('Erro ao remover canal de pacientes:', error);
      }
      patientChannelRef.current = null;
    }
    
    // Criar um novo canal com nome único
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
            
            // Get current cache data
            const currentPatients = queryClient.getQueryData<Patient[]>(['patients', activeClinic.id]) || [];
            
            // Handle different event types
            if (payload.eventType === 'INSERT') {
              // Add new patient to the cache if it doesn't exist
              const newPatient = payload.new;
              if (newPatient && !currentPatients.some(p => p.id === newPatient.id)) {
                // Format the patient data to match our expected structure
                const formattedPatient = {
                  id: newPatient.id,
                  name: newPatient.name,
                  email: newPatient.email || '',
                  phone: newPatient.phone || '',
                  birthDate: newPatient.birth_date,
                  created_at: newPatient.created_at,
                  updated_at: newPatient.updated_at,
                  clinic_id: newPatient.clinic_id,
                  status: newPatient.status || 'active',
                  lastVisit: newPatient.last_visit
                };
                
                queryClient.setQueryData(['patients', activeClinic.id], [...currentPatients, formattedPatient]);
              }
            } else if (payload.eventType === 'UPDATE') {
              // Update existing patient in the cache
              const updatedPatient = payload.new;
              if (updatedPatient) {
                const formattedPatient = {
                  id: updatedPatient.id,
                  name: updatedPatient.name,
                  email: updatedPatient.email || '',
                  phone: updatedPatient.phone || '',
                  birthDate: updatedPatient.birth_date,
                  created_at: updatedPatient.created_at,
                  updated_at: updatedPatient.updated_at,
                  clinic_id: updatedPatient.clinic_id,
                  status: updatedPatient.status || 'active',
                  lastVisit: updatedPatient.last_visit
                };
                
                queryClient.setQueryData(['patients', activeClinic.id], 
                  currentPatients.map(p => p.id === updatedPatient.id ? formattedPatient : p)
                );
              }
            } else if (payload.eventType === 'DELETE') {
              // Remove patient from cache
              const deletedId = payload.old?.id;
              if (deletedId) {
                queryClient.setQueryData(['patients', activeClinic.id], 
                  currentPatients.filter(p => p.id !== deletedId)
                );
              }
            }
            
            // Always invalidate to ensure consistency
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

    // Cleanup ao desmontar
    return () => {
      if (patientChannelRef.current) {
        try {
          console.log('Removendo canal de pacientes ao desmontar:', patientChannelRef.current.topic);
          supabase.removeChannel(patientChannelRef.current);
          patientChannelRef.current = null;
        } catch (error) {
          console.error('Erro ao remover canal de pacientes durante limpeza:', error);
        }
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
