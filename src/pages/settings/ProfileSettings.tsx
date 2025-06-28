import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { UserPhotoUpload } from '@/components/settings/UserPhotoUpload';

export const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    profession: 'Médico'
  });

  // Carregar dados do usuário incluindo foto
  useEffect(() => {
    if (user) {
      const getUserData = async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUserPhotoUrl(authUser.user_metadata?.avatar_url || null);
          setProfileData(prev => ({
            ...prev,
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
            email: authUser.email || ''
          }));
        }
      };
      getUserData();
    }
  }, [user]);

  const handlePhotoUpdate = (url: string | null) => {
    setUserPhotoUrl(url);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Update user profile in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: profileData.name,
          phone: profileData.phone,
          profession: profileData.profession
        }
      });

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Perfil</h2>
        <p className="text-gray-500">Gerencie suas informações pessoais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize suas informações pessoais e de contato</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/4 flex flex-col items-center justify-start">
                <UserPhotoUpload
                  userId={user?.id || ''}
                  currentPhotoUrl={userPhotoUrl}
                  userName={profileData.name}
                  onPhotoUpdated={handlePhotoUpdate}
                />
              </div>

              <div className="md:w-3/4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      value={profileData.name} 
                      onChange={handleProfileChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      value={profileData.email} 
                      onChange={handleProfileChange} 
                      required 
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Para alterar o email, entre em contato com o suporte
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      value={profileData.phone} 
                      onChange={handleProfileChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profissão</Label>
                    <Select 
                      value={profileData.profession} 
                      onValueChange={(value) => setProfileData({...profileData, profession: value})}
                    >
                      <SelectTrigger id="profession">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Médico">Médico</SelectItem>
                        <SelectItem value="Enfermeiro">Enfermeiro</SelectItem>
                        <SelectItem value="Fisioterapeuta">Fisioterapeuta</SelectItem>
                        <SelectItem value="Nutricionista">Nutricionista</SelectItem>
                        <SelectItem value="Psicólogo">Psicólogo</SelectItem>
                        <SelectItem value="Recepcionista">Recepcionista</SelectItem>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 