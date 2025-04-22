import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, EditIcon, TrashIcon, UserCircle, Mail, Phone, Calendar, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Doctor } from '@/types';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDoctors } from '@/hooks/useDoctors';
import { useClinic } from '@/contexts/ClinicContext';
import { DoctorPhotoUpload } from '@/components/doctors/DoctorPhotoUpload';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface DoctorFormData {
  id?: string;
  name: string;
  speciality: string;
  licensenumber: string;
  bio: string;
  email: string;
  phone: string;
  photo_url?: string;
}

const specialities = [
  'Cardiologia', 
  'Dermatologia', 
  'Ortopedia', 
  'Pediatria', 
  'Ginecologia', 
  'Clínica Geral',
  'Psiquiatria',
  'Neurologia',
  'Oftalmologia',
  'Endocrinologia'
];

const Doctors = () => {
  const { activeClinic } = useClinic();
  const { doctors, isLoading, deleteDoctor, inactivateDoctor } = useDoctors();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    speciality: '',
    licensenumber: '',
    bio: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.speciality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.licensenumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      speciality: value
    }));
  };

  const handleAddDoctor = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      speciality: '',
      licensenumber: '',
      bio: '',
      email: '',
      phone: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setIsEditing(true);
    setFormData({
      id: doctor.id,
      name: doctor.name || '',
      speciality: doctor.speciality || '',
      licensenumber: doctor.licensenumber || '',
      bio: doctor.bio || '',
      email: doctor.email || '',
      phone: doctor.phone || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDoctor = async (id: string) => {
    setDoctorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDoctor = () => {
    if (doctorToDelete) {
      try {
        deleteDoctor(doctorToDelete);
      } catch (error) {
        console.error('Error deleting doctor:', error);
      }
    }
    setIsDeleteDialogOpen(false);
    setDoctorToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeClinic) {
      toast.error('Nenhuma clínica selecionada');
      return;
    }
    
    const crmRegex = /^\d{6}-\d{2}\/[A-Z]{2}$/;
    if (!crmRegex.test(formData.licensenumber)) {
      toast.error('CRM inválido. Use o formato: 123456-78/SP');
      return;
    }
    
    try {
      if (isEditing && formData.id) {
        const { error } = await supabase
          .from('doctors')
          .update({
            name: formData.name,
            speciality: formData.speciality,
            licensenumber: formData.licensenumber,
            bio: formData.bio,
            email: formData.email,
            phone: formData.phone,
            photo_url: formData.photo_url
          })
          .eq('id', formData.id);
          
        if (error) {
          console.error('Error updating doctor:', error);
          toast.error('Não foi possível atualizar o profissional');
          return;
        }
        
        toast.success('Profissional atualizado com sucesso');
      } else {
        const { data, error } = await supabase
          .from('doctors')
          .insert({
            name: formData.name,
            speciality: formData.speciality,
            licensenumber: formData.licensenumber,
            bio: formData.bio,
            email: formData.email,
            phone: formData.phone,
            photo_url: formData.photo_url,
            clinic_id: activeClinic.id
          })
          .select();
          
        if (error) {
          console.error('Error adding doctor:', error);
          toast.error('Não foi possível adicionar o profissional');
          return;
        }
        
        if (data && data[0]) {
          toast.success('Profissional adicionado com sucesso');
        }
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ocorreu um erro ao salvar o profissional');
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <p className="text-gray-500">Gerencie os profissionais da sua clínica</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profissionais</CardTitle>
            <CardDescription>
              {activeClinic 
                ? `Total de ${doctors.length} profissionais cadastrados na clínica ${activeClinic.name}`
                : 'Selecione uma clínica para gerenciar profissionais'}
            </CardDescription>
          </div>
          {activeClinic && (
            <Button onClick={handleAddDoctor}>
              <Plus className="mr-2 h-4 w-4" /> Novo profissional
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, especialidade ou CRM..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.speciality}</TableCell>
                      <TableCell>{doctor.licensenumber}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditDoctor(doctor)}
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteDoctor(doctor.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Nenhum profissional encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] h-[90vh] max-h-[800px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Profissional' : 'Adicionar Novo Profissional'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do profissional abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              {formData.id && (
                <div className="flex justify-center">
                  <DoctorPhotoUpload
                    doctorId={formData.id}
                    currentPhotoUrl={formData.photo_url}
                    doctorName={formData.name}
                    onPhotoUpdated={(url) => {
                      setFormData(prev => ({
                        ...prev,
                        photo_url: url
                      }));
                    }}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="name" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="pl-10" 
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speciality">Especialidade</Label>
                  <Select value={formData.speciality} onValueChange={handleSelectChange}>
                    <SelectTrigger id="speciality">
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialities.map(speciality => (
                        <SelectItem key={speciality} value={speciality}>{speciality}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensenumber">CRM</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="licensenumber" 
                    name="licensenumber" 
                    value={formData.licensenumber} 
                    onChange={handleInputChange} 
                    className="pl-10" 
                    required
                    placeholder="123456-78/SP"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Formato: 123456-78/SP (6 dígitos, hífen, 2 dígitos, barra, sigla do estado em maiúsculo)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Salvar alterações' : 'Adicionar profissional'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente excluir este profissional? Esta ação não pode ser desfeita.
              <br /><br />
              <strong>Nota:</strong> Se o profissional tiver agendamentos associados, 
              não será possível excluí-lo. Cancele todos os agendamentos vinculados primeiro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDoctor}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Doctors;
