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
import { useIsMobile } from '@/hooks/use-mobile';

type PeriodOption = '7d' | '30d' | '90d' | 'all';

export const FinancialForecastDashboard = () => {
  const { activeClinic } = useClinic();
  const { forecasts, isLoading } = useFinancialQueries(activeClinic?.id);
  const [period, setPeriod] = useState<PeriodOption>('30d');
  const isMobile = useIsMobile();

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
    <div className="space-y-4 sm:space-y-6">
      <div className={`${
        isMobile 
          ? 'flex flex-col space-y-4' 
          : 'flex justify-between items-center'
      }`}>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}>
          Previsibilidade Financeira
        </h2>
        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodOption)}>
          <SelectTrigger className={isMobile ? 'w-full' : 'w-[180px]'}>
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

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1 sm:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        <Card>
          <CardContent className={isMobile ? 'pt-4 px-4' : 'pt-6'}>
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                  A receber (previsto)
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  R$ {totalForecast.toFixed(2)}
                </p>
              </div>
              <div className={`${
                isMobile ? 'h-8 w-8' : 'h-10 w-10'
              } rounded-full flex items-center justify-center bg-green-100`}>
                <Calendar className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-700`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className={isMobile ? 'pt-4 px-4' : 'pt-6'}>
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                  Enviado
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  R$ {totalSent.toFixed(2)}
                </p>
              </div>
              <div className={`${
                isMobile ? 'h-8 w-8' : 'h-10 w-10'
              } rounded-full flex items-center justify-center bg-blue-100`}>
                <ArrowUpRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-blue-700`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className={isMobile ? 'pt-4 px-4' : 'pt-6'}>
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                  Recebido
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  R$ {totalPaid.toFixed(2)}
                </p>
              </div>
              <div className={`${
                isMobile ? 'h-8 w-8' : 'h-10 w-10'
              } rounded-full flex items-center justify-center bg-green-100`}>
                <Wallet2 className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-green-700`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className={isMobile ? 'pt-4 px-4' : 'pt-6'}>
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-muted-foreground`}>
                  Glosado
                </p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>
                  R$ {totalDenied.toFixed(2)}
                </p>
              </div>
              <div className={`${
                isMobile ? 'h-8 w-8' : 'h-10 w-10'
              } rounded-full flex items-center justify-center bg-red-100`}>
                <ArrowDownRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-red-700`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className={isMobile ? 'px-4 py-3' : ''}>
          <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>
            Previsões financeiras
          </CardTitle>
          <CardDescription className={isMobile ? 'text-sm' : ''}>
            Lista de previsões financeiras para os próximos {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : 'meses'}
          </CardDescription>
        </CardHeader>
        <CardContent className={isMobile ? 'px-4 pb-4' : ''}>
          {filteredForecasts.length > 0 ? (
            <div className="space-y-4">
              {isMobile ? (
                // Mobile: Card layout
                <div className="space-y-3">
                  {filteredForecasts.slice(0, 10).map((forecast) => (
                    <Card key={forecast.id} className="border">
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{forecast.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(forecast.expected_payment_date), 'dd/MM/yyyy')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">R$ {forecast.value.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
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
                            <span className="text-xs text-muted-foreground">
                              {forecast.insurance?.name || (forecast.payment_type === 'private' ? 'Particular' : '-')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // Desktop: Table layout
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data prevista</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pagador</TableHead>
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
                </div>
              )}
              
              {filteredForecasts.length > 10 && (
                <div className="text-center pt-4">
                  <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                    Mostrando 10 de {filteredForecasts.length} previsões
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-8 ${isMobile ? 'py-6' : ''}`}>
              <BarChart3 className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto text-gray-300 mb-4`} />
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Nenhuma previsão financeira encontrada para o período selecionado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
