
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  Building2, 
  FileText, 
  Globe, 
  CheckCircle, 
  ArrowRight, 
  Smartphone,
  BarChart4,
  MessageSquare,
  LineChart,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-healthblue-600">ClínicaDigitalHub</div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-gray-700 hover:text-healthblue-600 font-medium">Funcionalidades</a>
            <a href="#benefits" className="text-gray-700 hover:text-healthblue-600 font-medium">Benefícios</a>
            <a href="#pricing" className="text-gray-700 hover:text-healthblue-600 font-medium">Planos</a>
            <Link to="/login" className="text-healthblue-600 hover:text-healthblue-700 font-medium">Entrar</Link>
            <Link to="/register">
              <Button>Cadastre-se</Button>
            </Link>
          </nav>
          
          <div className="md:hidden">
            <Button variant="ghost">
              <span className="sr-only">Menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12">
              <Badge className="mb-4">Nova Plataforma</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Gestão completa para sua clínica e presença online
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Centraliza o gerenciamento da sua clínica e ofereça experiências excepcionais para seus pacientes com nossa plataforma tudo-em-um.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Começar agora
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Conheça os recursos
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 mt-12 md:mt-0">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-healthblue-100 rounded-full filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-healthgreen-100 rounded-full filter blur-3xl opacity-30"></div>
                <img 
                  src="https://cdn.gpteng.co/project_asset/df99da28-b92c-46f8-b879-b7e4e4b7e469/dashboard-mockup.png" 
                  alt="Dashboard da Clínica" 
                  className="relative z-10 rounded-lg shadow-xl w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo que você precisa em um único lugar</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma foi desenvolvida com foco nas necessidades reais de clínicas de pequeno e médio porte.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <Calendar className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Agendamento Inteligente</CardTitle>
                <CardDescription>
                  Sistema completo de agendamento e gestão de consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Agendamento online 24/7 para pacientes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Lembretes automáticos por SMS e e-mail</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Check-in digital e gestão de filas</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Users className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Gestão de Pacientes</CardTitle>
                <CardDescription>
                  Cadastro completo e histórico de atendimentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Cadastro detalhado de pacientes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Histórico médico e de atendimentos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Acesso a exames e resultados</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Globe className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Presença Online</CardTitle>
                <CardDescription>
                  Site profissional para sua clínica
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Página personalizada para sua clínica</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Integração com agendamento online</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Perfil dos profissionais e serviços</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <FileText className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Prontuário Eletrônico</CardTitle>
                <CardDescription>
                  Registros digitais seguros e organizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Prontuário eletrônico completo</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Anamnese e evolução do paciente</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Segurança e conformidade com LGPD</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <Smartphone className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Comunicação Integrada</CardTitle>
                <CardDescription>
                  Canais de comunicação eficientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Notificações personalizáveis</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Integração com WhatsApp</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Comunicação interna da equipe</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <BarChart4 className="h-10 w-10 text-healthblue-600 mb-2" />
                <CardTitle>Relatórios e Análises</CardTitle>
                <CardDescription>
                  Dados para decisões estratégicas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Dashboard com indicadores chave</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Análise de desempenho financeiro</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Relatórios personalizáveis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Benefícios para sua clínica</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Potencialize seus resultados e ofereça uma experiência superior para seus pacientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-healthblue-50 rounded-full mb-4">
                <Clock className="h-8 w-8 text-healthblue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Economize Tempo</h3>
              <p className="text-gray-600">
                Automatize processos administrativos e foque no que realmente importa: o atendimento ao paciente.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-healthblue-50 rounded-full mb-4">
                <LineChart className="h-8 w-8 text-healthblue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Aumente Receitas</h3>
              <p className="text-gray-600">
                Reduza faltas, otimize sua agenda e aumente a satisfação e fidelização dos pacientes.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-healthblue-50 rounded-full mb-4">
                <Users className="h-8 w-8 text-healthblue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Melhore a Experiência</h3>
              <p className="text-gray-600">
                Ofereça um atendimento mais eficiente e personalizado para cada paciente.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="inline-block p-3 bg-healthblue-50 rounded-full mb-4">
                <Globe className="h-8 w-8 text-healthblue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fortaleça sua Marca</h3>
              <p className="text-gray-600">
                Crie uma presença online profissional e aumente a visibilidade da sua clínica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Planos para todos os tamanhos de clínica</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para as necessidades da sua clínica
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-gray-100">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Essencial</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">R$149</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <CardDescription>
                  Ideal para clínicas iniciantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Agenda para 1 profissional</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Cadastro de até 500 pacientes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Página online básica</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-healthblue-600 relative">
              <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                <Badge className="bg-healthblue-600 text-white mx-auto block w-fit">Mais Escolhido</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Clínica</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">R$249</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <CardDescription>
                  Para clínicas em crescimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Agenda para até 5 profissionais</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Pacientes ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Página online personalizada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Teleconsulta integrada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Relatórios básicos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button className="w-full">
                  Comece Agora
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-gray-100">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Empresarial</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">R$499</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <CardDescription>
                  Para clínicas de médio porte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Profissionais ilimitados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Multiplas unidades</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Integrações personalizadas</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Relatórios avançados</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>API completa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-healthgreen-500 mr-2 shrink-0 mt-0.5" />
                    <span>Gerente de sucesso dedicado</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  Entre em Contato
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-healthblue-600 to-healthblue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Pronto para transformar sua clínica?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já estão usando nossa plataforma para melhorar a gestão e crescer.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Experimente Grátis
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 w-full sm:w-auto">
              <MessageSquare className="mr-2 h-5 w-5" />
              Fale com um Consultor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ClínicaDigitalHub</h3>
              <p className="text-gray-400 mb-4">
                Transformando a gestão de clínicas com tecnologia inteligente e focada no paciente.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Produto</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Funcionalidades</a></li>
                <li><a href="#benefits" className="text-gray-400 hover:text-white">Benefícios</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Planos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrações</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Clientes</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Trabalhe conosco</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Suporte</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentação</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} ClínicaDigitalHub. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
