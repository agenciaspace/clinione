
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialQueries } from '@/hooks/queries/useFinancialQueries';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownRight, ArrowUpRight, BarChart3, Calendar, Wallet2 } from 'lucide-react';
import { useClinic } from '@/contexts/ClinicContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { FinancialForecast } from '@/types/financialTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type PeriodOption = '7d' | '30d' | '90d' | 'all';

export const FinancialForecastDashboard = () => {
  const { activeClinic } = useClinic();
  const { forecasts, isLoading } = useFinancialQueries(activeClinic?.id);
  const [period, setPeriod] = useState<PeriodOption>('30d');

  if (!activeClinic || isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados financeiros...</p>
        </CardContent>
      </Card>
    );
  }

  // Filtrar previsões pelo período selecionado
  const filterByPeriod = (forecast: FinancialForecast) => {
    const today = new Date();
    const forecastDate = new Date(forecast.expected_payment_date);
    
    switch (period) {
      case '7d':
        const sevenDaysLater = new Date();
        sevenDaysLater.setDate(today.getDate() + 7);
        return forecastDate <= sevenDaysLater;
      case '30d':
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(today.getDate() + 30);
        return forecastDate <= thirtyDaysLater;
      case '90d':
        const ninetyDaysLater = new Date();
        ninetyDaysLater.setDate(today.getDate() + 90);
        return forecastDate <= ninetyDaysLater;
      case 'all':
      default:
        return true;
    }
  };

  // Filtrar forecasts pelo período
  const filteredForecasts = forecasts.filter(filterByPeriod);

  // Calcular totais por status
  const totalForecast = filteredForecasts
    .filter(f => ['forecast', 'confirmed'].includes(f.status))
    .reduce((sum, f) => sum + f.value, 0);
    
  const totalSent = filteredForecasts
    .filter(f => f.status === 'sent')
    .reduce((sum, f) => sum + f.value, 0);
    
  const totalPaid = filteredForecasts
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.value, 0);
    
  const totalDenied = filteredForecasts
    .filter(f => ['partial', 'denied'].includes(f.status))
    .reduce((sum, f) => sum + f.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Previsibilidade Financeira</h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodOption)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Próximos 7 dias</SelectItem>
            <SelectItem value="30d">Próximos 30 dias</SelectItem>
            <SelectItem value="90d">Próximos 90 dias</SelectItem>
            <SelectItem value="all">Todos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">A receber (previsto)</p>
                <p className="text-2xl font-bold">R$ {totalForecast.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100">
                <Calendar className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Enviado ao convênio</p>
                <p className="text-2xl font-bold">R$ {totalSent.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                <ArrowUpRight className="h-5 w-5 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Recebido</p>
                <p className="text-2xl font-bold">R$ {totalPaid.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-green-100">
                <Wallet2 className="h-5 w-5 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Glosado</p>
                <p className="text-2xl font-bold">R$ {totalDenied.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-red-100">
                <ArrowDownRight className="h-5 w-5 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Previsões financeiras</CardTitle>
          <CardDescription>
            Lista de previsões financeiras para os próximos {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : 'meses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredForecasts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data prevista</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredForecasts.slice(0, 10).map((forecast) => (
                  <TableRow key={forecast.id}>
                    <TableCell>
                      {format(new Date(forecast.expected_payment_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{forecast.description}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        forecast.status === 'paid' ? 'bg-green-100 text-green-800' : 
                        forecast.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        forecast.status === 'partial' || forecast.status === 'denied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {forecast.status === 'paid' ? 'Pago' :
                         forecast.status === 'forecast' ? 'Previsto' :
                         forecast.status === 'confirmed' ? 'Confirmado' :
                         forecast.status === 'sent' ? 'Enviado' :
                         forecast.status === 'partial' ? 'Glosa parcial' :
                         forecast.status === 'denied' ? 'Glosado' :
                         forecast.status === 'cancelled' ? 'Cancelado' : forecast.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {forecast.insurance?.name || (forecast.payment_type === 'private' ? 'Particular' : '-')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      R$ {forecast.value.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-muted-foreground">Nenhuma previsão encontrada para o período selecionado.</p>
            </div>
          )}

          {filteredForecasts.length > 10 && (
            <div className="mt-4 flex justify-center">
              <Button variant="outline">Ver todas ({filteredForecasts.length})</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
