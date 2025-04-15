
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, EditIcon, TrashIcon, UserCircle, Mail, Phone, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Doctor } from '@/types';
import { toast } from '@/components/ui/sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Dados mockados para exemplo
const mockDoctors = [
  {
    id: '1',
    userId: 'user1',
    name: 'Dr. João Cardoso',
    speciality: 'Cardiologia',
    licenseNumber: 'CRM 12345',
    bio: 'Especialista em cardiologia com 10 anos de experiência.',
    photo: undefined,
    clinicId: 'clinic1'
  },
  {
    id: '2',
    userId: 'user2',
    name: 'Dra. Ana Beatriz',
    speciality: 'Dermatologia',
    licenseNumber: 'CRM 54321',
    bio: 'Dermatologista com foco em tratamentos estéticos e clínicos.',
    photo: undefined,
    clinicId: 'clinic1'
  },
  {
    id: '3',
    userId: 'user3',
    name: 'Dr. Carlos Eduardo',
    speciality: 'Ortopedia',
    licenseNumber: 'CRM 78901',
    bio: 'Ortopedista especializado em cirurgias de joelho e ombro.',
    photo: undefined,
    clinicId: 'clinic1'
  }
];

interface DoctorFormData {
  id?: string;
  name: string;
  speciality: string;
  licenseNumber: string;
  bio: string;
  email: string;
  phone: string;
}

const Doctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>(mockDoctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DoctorFormData>({
    name: '',
    speciality: '',
    licenseNumber: '',
    bio: '',
    email: '',
    phone: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
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
      licenseNumber: '',
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
      name: doctor.name,
      speciality: doctor.speciality,
      licenseNumber: doctor.licenseNumber,
      bio: doctor.bio || '',
      email: '', // Normalmente viria do usuário associado
      phone: ''  // Normalmente viria do usuário associado
    });
    setIsDialogOpen(true);
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter(doctor => doctor.id !== id));
    toast("Profissional removido com sucesso");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && formData.id) {
      // Atualiza um profissional existente
      setDoctors(doctors.map(doctor => 
        doctor.id === formData.id ? 
        {
          ...doctor,
          name: formData.name,
          speciality: formData.speciality,
          licenseNumber: formData.licenseNumber,
          bio: formData.bio
        } : doctor
      ));
      toast("Profissional atualizado com sucesso");
    } else {
      // Adiciona um novo profissional
      const newDoctor: Doctor = {
        id: `${Date.now()}`,
        userId: `user${Date.now()}`,
        name: formData.name,
        speciality: formData.speciality,
        licenseNumber: formData.licenseNumber,
        bio: formData.bio,
        clinicId: 'clinic1'
      };
      setDoctors([...doctors, newDoctor]);
      toast("Profissional adicionado com sucesso");
    }
    
    setIsDialogOpen(false);
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
            <CardDescription>Total de {doctors.length} profissionais cadastrados</CardDescription>
          </div>
          <Button onClick={handleAddDoctor}>
            <Plus className="mr-2 h-4 w-4" /> Novo profissional
          </Button>
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
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.speciality}</TableCell>
                      <TableCell>{doctor.licenseNumber}</TableCell>
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Profissional' : 'Adicionar Novo Profissional'}</DialogTitle>
            <DialogDescription>
              Preencha os dados do profissional abaixo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
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
                      <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                      <SelectItem value="Ortopedia">Ortopedia</SelectItem>
                      <SelectItem value="Pediatria">Pediatria</SelectItem>
                      <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                      <SelectItem value="Clínica Geral">Clínica Geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="licenseNumber">CRM</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    id="licenseNumber" 
                    name="licenseNumber" 
                    value={formData.licenseNumber} 
                    onChange={handleInputChange} 
                    className="pl-10" 
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
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
    </DashboardLayout>
  );
};

export default Doctors;
