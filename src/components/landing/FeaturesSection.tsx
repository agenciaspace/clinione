
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, 
  Users, 
  FileText, 
  Globe, 
  CheckCircle, 
  Smartphone,
  BarChart4
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Agendamento Inteligente',
    description: 'Sistema completo de agendamento e gestão de consultas',
    benefits: [
      'Agendamento online 24/7 para pacientes',
      'Lembretes automáticos por SMS e e-mail',
      'Check-in digital e gestão de filas'
    ]
  },
  {
    icon: Users,
    title: 'Gestão de Pacientes',
    description: 'Cadastro completo e histórico de atendimentos',
    benefits: [
      'Cadastro detalhado de pacientes',
      'Histórico médico e de atendimentos',
      'Acesso a exames e resultados'
    ]
  },
  {
    icon: Globe,
    title: 'Presença Online',
    description: 'Site profissional para sua clínica',
    benefits: [
      'Página personalizada para sua clínica',
      'Integração com agendamento online',
      'Perfil dos profissionais e serviços'
    ]
  },
  {
    icon: FileText,
    title: 'Prontuário Eletrônico',
    description: 'Registros digitais seguros e organizados',
    benefits: [
      'Prontuário eletrônico completo',
      'Anamnese e evolução do paciente',
      'Segurança e conformidade com LGPD'
    ]
  },
  {
    icon: Smartphone,
    title: 'Comunicação Integrada',
    description: 'Canais de comunicação eficientes',
    benefits: [
      'Notificações personalizáveis',
      'Integração com WhatsApp',
      'Comunicação interna da equipe'
    ]
  },
  {
    icon: BarChart4,
    title: 'Relatórios e Análises',
    description: 'Dados para decisões estratégicas',
    benefits: [
      'Dashboard com indicadores chave',
      'Análise de desempenho financeiro',
      'Relatórios personalizáveis'
    ]
  }
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Tudo que você precisa em um único lugar
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma foi desenvolvida com foco nas necessidades reais de clínicas de pequeno e médio porte.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <feature.icon className="h-10 w-10 text-[#FFD400] mb-2" />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FFD400] mr-2 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
