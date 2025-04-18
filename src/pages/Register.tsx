
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await register(formData.name, formData.email, formData.password, 'patient');
      // Add the user role to the user_roles table
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.from('user_roles').insert({
          user_id: session.user.id,
          role: 'patient' // Default role for new users
        });
      }
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative flex h-screen w-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-[#FFFAE6]">
      <Link to="/login" className="absolute left-4 top-4 md:left-8 md:top-8 text-sm underline underline-offset-4">
        Já tem uma conta?
      </Link>
      <div className="relative hidden h-full flex-col p-10 text-black lg:flex bg-[#FFD600]">
        <div className="absolute inset-0 bg-[#FFD600]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img 
            src="/lovable-uploads/f27f17f1-fd78-4724-bd56-ab6c1c419fad.png" 
            alt="Logo" 
            className="h-10 w-auto logo-flat mr-2"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Gerencie sua clínica de forma eficiente e ofereça o melhor
              cuidado aos seus pacientes.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <CardHeader className="space-y-0.5">
              <div className="flex justify-center mb-2">
                <img 
                  src="/lovable-uploads/f27f17f1-fd78-4724-bd56-ab6c1c419fad.png" 
                  alt="Logo" 
                  className="h-12 w-auto logo-flat"
                />
              </div>
              <CardTitle className="text-2xl">Crie sua conta</CardTitle>
              <CardDescription>
                Entre com seu email e senha para começar
              </CardDescription>
            </CardHeader>
          </div>
          <CardContent className="grid gap-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full mt-4 bg-[#FFD600] text-black hover:bg-[#E6C000]"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </Button>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default Register;
