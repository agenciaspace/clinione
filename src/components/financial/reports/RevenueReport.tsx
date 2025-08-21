import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Download, TrendingUp, Calendar } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const RevenueReport = () => {
  const { activeClinic } = useClinic();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    if (activeClinic) {
      fetchRevenueData();
    }
  }, [activeClinic, selectedPeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', activeClinic!.id)
        .eq('type', 'income')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    }).reduce((sum, t) => sum + t.amount, 0);

    const lastMonthRevenue = transactions.filter(t => {
      const date = new Date(t.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const year = currentMonth === 0 ? currentYear - 1 : currentYear;
      return date.getMonth() === lastMonth && date.getFullYear() === year;
    }).reduce((sum, t) => sum + t.amount, 0);

    const growth = lastMonthRevenue > 0 
      ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    return { monthlyRevenue, lastMonthRevenue, growth };
  };

  const { monthlyRevenue, lastMonthRevenue, growth } = calculateMetrics();

  const exportReport = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Valor', 'Status'],
      ...transactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
        t.description,
        `R$ ${t.amount.toFixed(2)}`,
        t.status === 'completed' ? 'Concluído' : 'Pendente'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-receitas-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
              <CardTitle>Relatório de Receitas</CardTitle>
              <CardDescription>Análise detalhada das receitas da clínica</CardDescription>
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Receita Mensal</p>
                    <p className="text-2xl font-bold">R$ {monthlyRevenue.toFixed(2)}</p>
                  </div>
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Mês Anterior</p>
                    <p className="text-2xl font-bold">R$ {lastMonthRevenue.toFixed(2)}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Crescimento</p>
                    <p className="text-2xl font-bold flex items-center">
                      {Number(growth) > 0 ? '+' : ''}{growth}%
                      <TrendingUp className={`h-4 w-4 ml-2 ${Number(growth) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhamento de Receitas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+ R$ {transaction.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.status === 'completed' ? 'Recebido' : 'Pendente'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};