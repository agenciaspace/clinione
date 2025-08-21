import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Download, Clock, DollarSign } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/components/ui/sonner';

export const OverdueReport = () => {
  const { activeClinic } = useClinic();
  const [overdueTransactions, setOverdueTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeClinic) {
      fetchOverdueData();
    }
  }, [activeClinic]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOverdueData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('clinic_id', activeClinic!.id)
        .eq('type', 'income')
        .eq('status', 'pending')
        .order('date', { ascending: true });

      if (error) throw error;
      setOverdueTransactions(data as Transaction[] || []);
    } catch (error) {
      console.error('Error fetching overdue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsReceived = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'completed' })
        .eq('id', transactionId);

      if (error) throw error;
      
      toast.success('Pagamento marcado como recebido');
      fetchOverdueData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Erro ao atualizar status do pagamento');
    }
  };

  const calculateMetrics = () => {
    const totalOverdue = overdueTransactions.reduce((sum, t) => sum + t.amount, 0);
    const overdueCount = overdueTransactions.length;
    const averageDaysOverdue = overdueTransactions.reduce((sum, t) => {
      return sum + differenceInDays(new Date(), new Date(t.date));
    }, 0) / (overdueCount || 1);

    return { totalOverdue, overdueCount, averageDaysOverdue };
  };

  const { totalOverdue, overdueCount, averageDaysOverdue } = calculateMetrics();

  const exportReport = () => {
    const csvContent = [
      ['Data', 'Descrição', 'Valor', 'Dias em Atraso'],
      ...overdueTransactions.map(t => [
        format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR }),
        t.description,
        `R$ ${t.amount.toFixed(2)}`,
        differenceInDays(new Date(), new Date(t.date))
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inadimplencia-${format(new Date(), 'yyyy-MM-dd')}.csv`;
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
              <CardTitle>Relatório de Inadimplência</CardTitle>
              <CardDescription>Controle de contas a receber em atraso</CardDescription>
            </div>
            <Button onClick={exportReport} variant="outline" disabled={overdueCount === 0}>
              <Download className="h-4 w-4 mr-2" /> Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">R$ {totalOverdue.toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade</p>
                    <p className="text-2xl font-bold text-orange-600">{overdueCount}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Média de Atraso</p>
                    <p className="text-2xl font-bold text-yellow-600">{Math.round(averageDaysOverdue)} dias</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {overdueCount === 0 ? (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-green-900">Nenhuma inadimplência!</h3>
                <p className="text-green-700 mt-2">
                  Todos os pagamentos estão em dia. Excelente gestão financeira!
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pagamentos Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTransactions.map((transaction) => {
                    const daysOverdue = differenceInDays(new Date(), new Date(transaction.date));
                    const urgencyClass = daysOverdue > 30 ? 'border-red-500' : daysOverdue > 15 ? 'border-orange-500' : 'border-yellow-500';
                    
                    return (
                      <div key={transaction.id} className={`border-l-4 ${urgencyClass} pl-4 py-3 bg-gray-50 rounded-r-lg`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-sm text-muted-foreground">
                                Vencido há {daysOverdue} {daysOverdue === 1 ? 'dia' : 'dias'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Data: {format(new Date(transaction.date), "dd 'de' MMMM", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-red-600">R$ {transaction.amount.toFixed(2)}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsReceived(transaction.id)}
                            >
                              Marcar como recebido
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};