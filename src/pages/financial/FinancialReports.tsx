import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { BarChart, FileText, BanknoteIcon, DollarSign } from 'lucide-react';
import { RevenueReport } from '@/components/financial/reports/RevenueReport';
import { FinancialStatement } from '@/components/financial/reports/FinancialStatement';
import { CashFlow } from '@/components/financial/reports/CashFlow';
import { OverdueReport } from '@/components/financial/reports/OverdueReport';

const FinancialReports = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<'revenue' | 'statement' | 'cashflow' | 'overdue' | null>(null);

  const renderReport = () => {
    switch (selectedReport) {
      case 'revenue':
        return <RevenueReport />;
      case 'statement':
        return <FinancialStatement />;
      case 'cashflow':
        return <CashFlow />;
      case 'overdue':
        return <OverdueReport />;
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Relatórios financeiros</CardTitle>
              <CardDescription>Analise o desempenho financeiro da sua clínica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => setSelectedReport('revenue')}
                >
                  <BarChart className="h-10 w-10 mb-2" />
                  <span className="font-medium">Relatório de receitas</span>
                  <span className="text-sm text-gray-500">Análise detalhada de receitas</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => setSelectedReport('statement')}
                >
                  <FileText className="h-10 w-10 mb-2" />
                  <span className="font-medium">Demonstrativo financeiro</span>
                  <span className="text-sm text-gray-500">Resumo financeiro completo</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => setSelectedReport('cashflow')}
                >
                  <BanknoteIcon className="h-10 w-10 mb-2" />
                  <span className="font-medium">Fluxo de caixa</span>
                  <span className="text-sm text-gray-500">Entradas e saídas de recursos</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center justify-center"
                  onClick={() => setSelectedReport('overdue')}
                >
                  <DollarSign className="h-10 w-10 mb-2" />
                  <span className="font-medium">Inadimplência</span>
                  <span className="text-sm text-gray-500">Controle de contas a receber</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500">Relatórios financeiros detalhados</p>
      </div>

      <Tabs value="reports" className="space-y-6" onValueChange={(value) => {
        const routes = {
          'overview': '/dashboard/financial',
          'transactions': '/dashboard/financial/transactions',
          'forecasts': '/dashboard/financial/forecasts',
          'reports': '/dashboard/financial/reports'
        };
        navigate(routes[value as keyof typeof routes]);
      }}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="forecasts">Previsibilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {selectedReport && (
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => setSelectedReport(null)}
          >
            ← Voltar aos relatórios
          </Button>
        )}
        {renderReport()}
      </div>
    </DashboardLayout>
  );
};

export default FinancialReports;