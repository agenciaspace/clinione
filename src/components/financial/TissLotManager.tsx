import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialQueries } from '@/hooks/queries/useFinancialQueries';
import { useFinancialMutations } from '@/hooks/mutations/useFinancialMutations';
import { useClinic } from '@/contexts/ClinicContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogTitle, DialogFooter, DialogContent, DialogDescription, Dialog, DialogHeader } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Check, X, Send, FilePlus2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export const TissLotManager = () => {
  const { activeClinic } = useClinic();
  const { forecasts, insuranceCompanies, tissBatches, isLoading } = useFinancialQueries(activeClinic?.id);
  const { createTissBatch, processInsuranceResponse } = useFinancialMutations(activeClinic?.id);
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<string>('');
  const [selectedForecasts, setSelectedForecasts] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [responseValues, setResponseValues] = useState({
    approvedValue: 0,
    deniedValue: 0,
  });

  // Forecasts que estão confirmadas e são de convênio (prontas para enviar)
  const eligibleForecasts = forecasts.filter(
    f => ['forecast', 'confirmed'].includes(f.status) && 
    f.payment_type === 'insurance' && 
    f.insurance_company_id && 
    !f.tiss_batch_id
  );

  const handleCreateBatch = async () => {
    if (!selectedInsurance || selectedForecasts.length === 0) return;

    await createTissBatch({
      insuranceId: selectedInsurance,
      forecastIds: selectedForecasts
    });

    setIsDialogOpen(false);
    setSelectedInsurance('');
    setSelectedForecasts([]);
  };

  const handleProcessResponse = async () => {
    if (!selectedBatch) return;
    
    await processInsuranceResponse({
      batchId: selectedBatch,
      approvedValue: responseValues.approvedValue,
      deniedValue: responseValues.deniedValue,
      // Implementação simples - em uma versão mais completa, detalharíamos cada glosa
      glosaDetails: responseValues.deniedValue > 0 ? [{
        forecastId: forecasts.find(f => f.tiss_batch_id === selectedBatch)?.id || '',
        value: responseValues.deniedValue,
        reason: 'Glosa informada pelo convênio'
      }] : undefined
    });

    setIsResponseDialogOpen(false);
    setSelectedBatch(null);
    setResponseValues({ approvedValue: 0, deniedValue: 0 });
  };

  const toggleForecastSelection = (id: string) => {
    setSelectedForecasts(prev => 
      prev.includes(id) 
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const filteredForecasts = selectedInsurance 
    ? eligibleForecasts.filter(f => f.insurance_company_id === selectedInsurance)
    : [];

  if (!activeClinic || isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando dados de lotes TISS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className={`${
          isMobile 
            ? 'flex flex-col space-y-4' 
            : 'flex flex-row items-center justify-between space-y-0'
        }`}>
          <div>
            <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>Lotes TISS</CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : 'text-base'}>
              Gerencie os lotes de envio para convênios
            </CardDescription>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? 'w-full' : 'w-auto'}
          >
            <FilePlus2 className="h-4 w-4 mr-2" /> Criar Lote
          </Button>
        </CardHeader>
        <CardContent className={isMobile ? 'p-4' : 'p-6'}>
          {tissBatches.length > 0 ? (
            <div className={isMobile ? 'space-y-4' : ''}>
              {isMobile ? (
                // Mobile: Card layout
                <div className="space-y-4">
                  {tissBatches.map((batch) => (
                    <Card key={batch.id} className="border">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">Lote #{batch.batch_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {batch.insurance?.name || '-'}
                              </p>
                            </div>
                            <Badge variant={
                              batch.status === 'preparing' ? 'outline' : 
                              batch.status === 'sent' ? 'secondary' : 
                              batch.status === 'processed' ? 'default' : 
                              'default'
                            } className="text-xs">
                              {batch.status === 'preparing' ? 'Em Preparação' : 
                               batch.status === 'sent' ? 'Enviado' : 
                               batch.status === 'processed' ? 'Processado' : 
                               'Finalizado'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                              <p className="text-muted-foreground">Data de Envio</p>
                              <p className="font-medium">
                                {format(new Date(batch.submission_date), 'dd/MM/yyyy')}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Valor Total</p>
                              <p className="font-medium">R$ {batch.total_value.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          {batch.approved_value !== null && (
                            <div>
                              <p className="text-xs text-muted-foreground">Valor Aprovado</p>
                              <p className="text-sm font-medium">R$ {batch.approved_value.toFixed(2)}</p>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-2">
                            {batch.status === 'sent' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => {
                                  setSelectedBatch(batch.id);
                                  setIsResponseDialogOpen(true);
                                }}
                              >
                                Informar Retorno
                              </Button>
                            )}
                            {batch.response_file_url && (
                              <Button variant="ghost" size="sm" className="px-2">
                                <FileText className="h-3 w-3" />
                              </Button>
                            )}
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
                        <TableHead>Número do Lote</TableHead>
                        <TableHead>Convênio</TableHead>
                        <TableHead>Data de Envio</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Valor Total</TableHead>
                        <TableHead>Valor Aprovado</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tissBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.batch_number}</TableCell>
                          <TableCell>{batch.insurance?.name || '-'}</TableCell>
                          <TableCell>
                            {format(new Date(batch.submission_date), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              batch.status === 'preparing' ? 'outline' : 
                              batch.status === 'sent' ? 'secondary' : 
                              batch.status === 'processed' ? 'default' : 
                              'default'
                            }>
                              {batch.status === 'preparing' ? 'Em Preparação' : 
                               batch.status === 'sent' ? 'Enviado' : 
                               batch.status === 'processed' ? 'Processado' : 
                               'Finalizado'}
                            </Badge>
                          </TableCell>
                          <TableCell>R$ {batch.total_value.toFixed(2)}</TableCell>
                          <TableCell>
                            {batch.approved_value !== null 
                              ? `R$ ${batch.approved_value.toFixed(2)}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {batch.status === 'sent' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBatch(batch.id);
                                    setIsResponseDialogOpen(true);
                                  }}
                                >
                                  Informar Retorno
                                </Button>
                              )}
                              {batch.response_file_url && (
                                <Button variant="ghost" size="sm">
                                  <FileText className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          ) : (
            <div className={`py-8 text-center ${isMobile ? 'py-6' : ''}`}>
              <FileText className={`${isMobile ? 'h-8 w-8' : 'h-12 w-12'} mx-auto text-gray-300 mb-2`} />
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Nenhum lote TISS encontrado.
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
                Clique em "Criar Lote" para gerar um novo lote TISS.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar novo lote */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={`${
          isMobile 
            ? 'max-w-[95vw] max-h-[90vh] overflow-y-auto' 
            : 'max-w-2xl'
        }`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              Criar Novo Lote TISS
            </DialogTitle>
            <DialogDescription className={isMobile ? 'text-sm' : ''}>
              Selecione o convênio e as consultas que serão incluídas no lote.
            </DialogDescription>
          </DialogHeader>
          
          <div className={`space-y-4 ${isMobile ? 'py-2' : 'py-4'}`}>
            <div className="space-y-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Select value={selectedInsurance} onValueChange={setSelectedInsurance}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um convênio" />
                </SelectTrigger>
                <SelectContent>
                  {insuranceCompanies.map((insurance) => (
                    <SelectItem key={insurance.id} value={insurance.id}>
                      {insurance.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInsurance && filteredForecasts.length > 0 && (
              <div className="space-y-2">
                <Label>Consultas para incluir no lote</Label>
                <div className={`border rounded-lg p-3 max-h-64 overflow-y-auto ${
                  isMobile ? 'max-h-48' : ''
                }`}>
                  {filteredForecasts.map((forecast) => (
                    <div key={forecast.id} className="flex items-center space-x-2 py-2">
                      <Checkbox
                        id={forecast.id}
                        checked={selectedForecasts.includes(forecast.id)}
                        onCheckedChange={() => toggleForecastSelection(forecast.id)}
                      />
                      <Label 
                        htmlFor={forecast.id} 
                        className={`flex-1 ${isMobile ? 'text-sm' : ''}`}
                      >
                        <div className="flex justify-between">
                          <span>{forecast.description}</span>
                          <span className="font-medium">R$ {forecast.value.toFixed(2)}</span>
                        </div>
                        <div className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          Vencimento: {format(new Date(forecast.expected_payment_date), 'dd/MM/yyyy')}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                
                {selectedForecasts.length > 0 && (
                  <div className={`p-3 bg-muted rounded-lg ${isMobile ? 'text-sm' : ''}`}>
                    <div className="flex justify-between">
                      <span>Total selecionado:</span>
                      <span className="font-medium">
                        R$ {filteredForecasts
                          .filter(f => selectedForecasts.includes(f.id))
                          .reduce((sum, f) => sum + f.value, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Consultas:</span>
                      <span>{selectedForecasts.length}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedInsurance && filteredForecasts.length === 0 && (
              <div className={`text-center py-4 text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Nenhuma consulta elegível encontrada para este convênio.
              </div>
            )}
          </div>

          <DialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className={isMobile ? 'w-full' : ''}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateBatch}
              disabled={!selectedInsurance || selectedForecasts.length === 0}
              className={isMobile ? 'w-full' : ''}
            >
              <Send className="h-4 w-4 mr-2" />
              Criar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para processar resposta do convênio */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className={isMobile ? 'max-w-[95vw]' : 'max-w-md'}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : 'text-xl'}>
              Informar Retorno do Convênio
            </DialogTitle>
            <DialogDescription className={isMobile ? 'text-sm' : ''}>
              Informe os valores aprovados e glosados pelo convênio.
            </DialogDescription>
          </DialogHeader>
          
          <div className={`space-y-4 ${isMobile ? 'py-2' : 'py-4'}`}>
            <div className="space-y-2">
              <Label htmlFor="approved">Valor Aprovado (R$)</Label>
              <Input
                id="approved"
                type="number"
                step="0.01"
                min="0"
                value={responseValues.approvedValue}
                onChange={(e) => setResponseValues(prev => ({
                  ...prev,
                  approvedValue: Number(e.target.value)
                }))}
                placeholder="0.00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="denied">Valor Glosado (R$)</Label>
              <Input
                id="denied"
                type="number"
                step="0.01"
                min="0"
                value={responseValues.deniedValue}
                onChange={(e) => setResponseValues(prev => ({
                  ...prev,
                  deniedValue: Number(e.target.value)
                }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
            <Button 
              variant="outline" 
              onClick={() => setIsResponseDialogOpen(false)}
              className={isMobile ? 'w-full' : ''}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleProcessResponse}
              className={isMobile ? 'w-full' : ''}
            >
              <Check className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
