import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from "@/components/ui/badge";
import { toast } from '@/components/ui/sonner';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPassword(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (password.new !== password.confirm) {
      toast.error('As senhas não coincidem');
      setLoading(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: password.new 
      });
      
      if (error) throw error;
      
      toast.success('Senha atualizada com sucesso');
      setPassword({
        current: '',
        new: '',
        confirm: ''
      });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      toast.error('Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
        <p className="text-gray-500">Gerencie a segurança da sua conta</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha periodicamente para maior segurança</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Senha atual</Label>
              <Input 
                id="current" 
                name="current" 
                type="password" 
                value={password.current} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Nova senha</Label>
              <Input 
                id="new" 
                name="new" 
                type="password" 
                value={password.new} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar nova senha</Label>
              <Input 
                id="confirm" 
                name="confirm" 
                type="password" 
                value={password.confirm} 
                onChange={handlePasswordChange} 
                required 
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Atualizando...' : 'Atualizar senha'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticação de dois fatores</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center">
                <h4 className="text-sm font-medium">Autenticação por SMS</h4>
                <Badge variant="outline" className="ml-2">
                  Recomendado
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Receba um código por SMS quando fizer login
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Autenticação por aplicativo</h4>
              <p className="text-sm text-muted-foreground">
                Use um aplicativo como Google Authenticator
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Backup de códigos</h4>
              <p className="text-sm text-muted-foreground">
                Gere códigos de backup para acesso emergencial
              </p>
            </div>
            <Button variant="outline" size="sm">Gerar códigos</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Zona de perigo</CardTitle>
          <CardDescription>Ações irreversíveis de segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <div className="flex items-start space-x-4">
              <div className="mt-0.5">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium text-red-500">Excluir conta</h4>
                <p className="text-sm text-gray-700 mt-1">
                  Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
                </p>
                <div className="mt-4">
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir minha conta
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 