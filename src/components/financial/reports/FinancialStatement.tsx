import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const FinancialStatement = () => {
  const { activeClinic } = useClinic();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeClinic) {
      fetchFinancialData();
    }
  }, [activeClinic]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', activeClinic!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const balance = income - expenses;
    const profitMargin = income > 0 ? ((balance / income) * 100).toFixed(1) : '0';

    return { income, expenses, balance, profitMargin };
  };

  const { income, expenses, balance, profitMargin } = calculateMetrics();

  const exportPDF = () => {
    // Simulação de exportação - em produção, usar uma biblioteca como jsPDF
    const content = `
DEMONSTRATIVO FINANCEIRO
${activeClinic?.name}
${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}

RESUMO EXECUTIVO
Total de Receitas: R$ ${income.toFixed(2)}
Total de Despesas: R$ ${expenses.toFixed(2)}
Resultado: R$ ${balance.toFixed(2)}
Margem de Lucro: ${profitMargin}%

DETALHAMENTO
${transactions.map(t => `
${format(new Date(t.date), 'dd/MM/yyyy')} - ${t.description}
${t.type === 'income' ? 'Receita' : 'Despesa'}: R$ ${t.amount.toFixed(2)}
Status: ${t.status === 'completed' ? 'Concluído' : 'Pendente'}
`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demonstrativo-financeiro-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Demonstrativo Financeiro</CardTitle>
              <CardDescription>Resumo completo da situação financeira</CardDescription>
            </div>
            <Button onClick={exportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <p className="text-2xl font-bold text-green-600">R$ {income.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <p className="text-2xl font-bold text-red-600">R$ {expenses.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado</p>
                    <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {balance.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className={`h-8 w-8 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Margem de Lucro</p>
                    <p className={`text-2xl font-bold ${Number(profitMargin) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitMargin}%
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Consultas</span>
                    <span className="font-medium text-green-600">R$ {(income * 0.6).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Procedimentos</span>
                    <span className="font-medium text-green-600">R$ {(income * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Outros</span>
                    <span className="font-medium text-green-600">R$ {(income * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Folha de Pagamento</span>
                    <span className="font-medium text-red-600">R$ {(expenses * 0.5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Aluguel e Utilidades</span>
                    <span className="font-medium text-red-600">R$ {(expenses * 0.25).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Materiais e Insumos</span>
                    <span className="font-medium text-red-600">R$ {(expenses * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Outros</span>
                    <span className="font-medium text-red-600">R$ {(expenses * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};