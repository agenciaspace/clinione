
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

const plans = [
  {
    title: 'Essencial',
    price: '149',
    description: 'Ideal para clínicas iniciantes',
    features: [
      'Agenda para 1 profissional',
      'Cadastro de até 500 pacientes',
      'Página online básica',
      'Suporte por email'
    ],
    buttonText: 'Começar Grátis',
    buttonVariant: 'outline' as const
  },
  {
    title: 'Clínica',
    price: '249',
    description: 'Para clínicas em crescimento',
    features: [
      'Agenda para até 5 profissionais',
      'Pacientes ilimitados',
      'Página online personalizada',
      'Teleconsulta integrada',
      'Relatórios básicos',
      'Suporte prioritário'
    ],
    buttonText: 'Comece Agora',
    buttonVariant: 'default' as const,
    highlight: true
  },
  {
    title: 'Empresarial',
    price: '499',
    description: 'Para clínicas de médio porte',
    features: [
      'Profissionais ilimitados',
      'Multiplas unidades',
      'Integrações personalizadas',
      'Relatórios avançados',
      'API completa',
      'Gerente de sucesso dedicado'
    ],
    buttonText: 'Entre em Contato',
    buttonVariant: 'outline' as const
  }
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Planos para todos os tamanhos de clínica
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Escolha o plano ideal para as necessidades da sua clínica
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`border-2 ${plan.highlight ? 'border-[#FFD400]' : 'border-gray-100'} relative`}>
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 transform -translate-y-1/2">
                  <Badge className="bg-[#FFD400] text-[#0A0A0A] mx-auto block w-fit">
                    Mais Escolhido
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.title}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">R${plan.price}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-[#FFD400] mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={plan.buttonVariant} className="w-full">
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
