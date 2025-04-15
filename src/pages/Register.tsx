
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'doctor' | 'receptionist'>('admin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast("Erro de validação", {
        description: "Por favor, preencha todos os campos"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast("Erro de validação", {
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
      toast("Registro concluído", {
        description: "Sua conta foi criada com sucesso!"
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast("Erro no registro", {
        description: "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-healthblue-50">
      <div className="flex-1 hidden lg:block bg-healthblue-600 relative">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <h1 className="text-4xl font-bold mb-6">Clínica Digital Hub</h1>
          <p className="text-xl mb-8 max-w-md text-center">
            Uma plataforma completa para gestão da sua clínica e presença online.
          </p>
          <ul className="space-y-4 max-w-md">
            <li className="flex items-start space-x-3">
              <span className="bg-white text-healthblue-600 rounded-full p-1 mt-0.5">✓</span>
              <span>Agendamento online para seus pacientes</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-white text-healthblue-600 rounded-full p-1 mt-0.5">✓</span>
              <span>Histórico médico e prontuário eletrônico</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-white text-healthblue-600 rounded-full p-1 mt-0.5">✓</span>
              <span>Gerenciamento financeiro simplificado</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-white text-healthblue-600 rounded-full p-1 mt-0.5">✓</span>
              <span>Página pública personalizada para sua clínica</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="bg-white text-healthblue-600 rounded-full p-1 mt-0.5">✓</span>
              <span>Relatórios e análises para decisões estratégicas</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Cadastre-se para começar a usar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  placeholder="Seu Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@clinica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label>Tipo de usuário</Label>
                <RadioGroup 
                  defaultValue="admin" 
                  value={role}
                  onValueChange={(value) => setRole(value as 'admin' | 'doctor' | 'receptionist')}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Administrador da Clínica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label htmlFor="doctor">Médico/Profissional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="receptionist" id="receptionist" />
                    <Label htmlFor="receptionist">Recepcionista</Label>
                  </div>
                </RadioGroup>
              </div>
              <Button
                type="submit"
                className="w-full bg-healthblue-600 hover:bg-healthblue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Registrando...' : 'Cadastrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm mt-2">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-healthblue-600 hover:underline">
                Faça login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
