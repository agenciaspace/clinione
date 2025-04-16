
import React from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import ClinicManager from '../components/clinic/ClinicManager';

const ClinicProfile = () => {
  return (
    <DashboardLayout requireClinic={false}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Clínicas</h1>
        <p className="text-gray-500">Gerencie suas clínicas e selecione a clínica ativa</p>
      </div>
      
      <ClinicManager />
    </DashboardLayout>
  );
};

export default ClinicProfile;
