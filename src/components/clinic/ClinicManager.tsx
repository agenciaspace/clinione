
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useClinic } from '@/contexts/ClinicContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Clinic } from '@/types';
import { Building2, Edit, Trash2, Check } from 'lucide-react';

interface ClinicFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
}

const ClinicManager: React.FC = () => {
  const { clinics, activeClinic, setActiveClinic, refreshClinics } = useClinic();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ClinicFormData>({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const handleAddClinic = () => {
    setIsEditing(false);
    setEditingClinicId(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      email: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditClinic = (clinic: Clinic) => {
    setIsEditing(true);
    setEditingClinicId(clinic.id);
    setFormData({
      name: clinic.name,
      address: clinic.address || '',
      phone: clinic.phone || '',
      email: clinic.email || ''
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }
    
    try {
      if (isEditing && editingClinicId) {
        const { error } = await supabase
          .from('clinics')
          .update({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingClinicId);
          
        if (error) throw error;
        
        toast.success('Clínica atualizada com sucesso');
      } else {
        const { data, error } = await supabase
          .from('clinics')
          .insert({
            name: formData.name,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            owner_id: user.id
          })
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          toast.success('Clínica criada com sucesso');
          setActiveClinic(data[0] as Clinic);
        }
      }
      
      setIsDialogOpen(false);
      refreshClinics();
    } catch (error) {
      console.error('Erro ao salvar clínica:', error);
      toast.error('Ocorreu um erro ao salvar a clínica');
    }
  };

  const handleDeleteClinic = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('clinics')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Clínica excluída com sucesso');
      refreshClinics();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      toast.error('Ocorreu um erro ao excluir a clínica');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Minhas Clínicas</CardTitle>
            <CardDescription>Gerencie suas clínicas e selecione a clínica ativa</CardDescription>
          </div>
          <Button onClick={handleAddClinic}>
            Nova Clínica
          </Button>
        </CardHeader>
        <CardContent>
          {clinics.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">Sem clínicas</h3>
              <p className="mt-1 text-sm text-gray-500">
                Você ainda não tem nenhuma clínica cadastrada.
              </p>
              <div className="mt-6">
                <Button onClick={handleAddClinic}>
                  Adicionar Clínica
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clinics.map((clinic) => (
                <Card key={clinic.id} className={`overflow-hidden ${activeClinic?.id === clinic.id ? 'border-primary' : ''}`}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">
                      {clinic.name}
                    </CardTitle>
                    <CardDescription className="truncate">
                      {clinic.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Telefone:</span> {clinic.phone || 'Não informado'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Email:</span> {clinic.email || 'Não informado'}
                    </div>
                  </CardContent>
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    {activeClinic?.id === clinic.id ? (
                      <Button variant="ghost" className="text-primary" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Selecionada
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setActiveClinic(clinic)}>
                        Selecionar
                      </Button>
                    )}
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClinic(clinic)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleDeleteClinic(clinic.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Clínica' : 'Nova Clínica'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Atualize as informações da sua clínica'
                : 'Preencha as informações para criar uma nova clínica'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Clínica</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input 
                  id="address" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? 'Salvar alterações' : 'Criar clínica'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicManager;
