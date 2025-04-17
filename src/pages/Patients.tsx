
import React, { useState } from 'react';
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

const Patients = () => {
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

  const {
    patients,
    isLoading,
    addPatientMutation,
    updatePatientMutation,
    deletePatientMutation,
    togglePatientStatusMutation
  } = usePatients(activeClinic?.id);

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

    setIsAddPatientOpen(false);
    setPatientForm({
      name: '',
      email: '',
      phone: '',
      birthDate: new Date().toISOString().split('T')[0]
    });
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
                onToggleStatus={(patient) => togglePatientStatusMutation.mutate({
                  id: patient.id,
                  status: patient.status === 'active' ? 'inactive' : 'active'
                })}
                onDelete={(id) => deletePatientMutation.mutate(id)}
                onOpenRecord={(patient) => {
                  setSelectedPatient(patient);
                  setIsRecordModalOpen(true);
                }}
                onUpdatePatient={(patient) => updatePatientMutation.mutate(patient)}
              />
            </TabsContent>
            
            <TabsContent value="active">
              <PatientsTabContent
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
                onUpdatePatient={(patient) => updatePatientMutation.mutate(patient)}
              />
            </TabsContent>
            
            <TabsContent value="inactive">
              <PatientsTabContent
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
                onUpdatePatient={(patient) => updatePatientMutation.mutate(patient)}
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
