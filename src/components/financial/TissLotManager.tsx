
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

export const TissLotManager = () => {
  const { activeClinic } = useClinic();
  const { forecasts, insuranceCompanies, tissBatches, isLoading } = useFinancialQueries(activeClinic?.id);
  const { createTissBatch, processInsuranceResponse } = useFinancialMutations(activeClinic?.id);
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
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Lotes TISS</CardTitle>
            <CardDescription>Gerencie os lotes de envio para convênios</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <FilePlus2 className="h-4 w-4 mr-2" /> Criar Lote
          </Button>
        </CardHeader>
        <CardContent>
          {tissBatches.length > 0 ? (
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
                        'success'
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="text-muted-foreground">Nenhum lote TISS encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique em "Criar Lote" para gerar um novo lote TISS.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar novo lote */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Lote TISS</DialogTitle>
            <DialogDescription>
              Selecione o convênio e as consultas que serão incluídas no lote.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="insurance">Convênio</Label>
              <Select 
                value={selectedInsurance} 
                onValueChange={(value) => {
                  setSelectedInsurance(value);
                  setSelectedForecasts([]);
                }}
              >
                <SelectTrigger id="insurance">
                  <SelectValue placeholder="Selecione o convênio" />
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

            {selectedInsurance && (
              <div className="space-y-2">
                <Label>Selecione as previsões a incluir no lote</Label>
                <Card>
                  <CardContent className="p-0">
                    {filteredForecasts.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Data Prevista</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredForecasts.map((forecast) => (
                            <TableRow key={forecast.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedForecasts.includes(forecast.id)}
                                  onCheckedChange={() => toggleForecastSelection(forecast.id)}
                                />
                              </TableCell>
                              <TableCell>{forecast.description}</TableCell>
                              <TableCell>
                                {format(new Date(forecast.expected_payment_date), 'dd/MM/yyyy')}
                              </TableCell>
                              <TableCell className="text-right">
                                R$ {forecast.value.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="py-6 text-center">
                        <p className="text-muted-foreground">
                          Não há previsões elegíveis para este convênio.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Total selecionado: {selectedForecasts.length} item(ns)</span>
                  <span>
                    Valor total: R$ {
                      filteredForecasts
                        .filter(f => selectedForecasts.includes(f.id))
                        .reduce((sum, f) => sum + f.value, 0)
                        .toFixed(2)
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button 
              onClick={handleCreateBatch}
              disabled={!selectedInsurance || selectedForecasts.length === 0}
            >
              <Send className="h-4 w-4 mr-2" /> Criar Lote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para informar retorno do convênio */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Informar Retorno do Convênio</DialogTitle>
            <DialogDescription>
              Informe os valores aprovados e glosados pelo convênio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="approvedValue">Valor Aprovado (R$)</Label>
              <Input
                id="approvedValue"
                type="number"
                step="0.01"
                min="0"
                value={responseValues.approvedValue}
                onChange={(e) => setResponseValues(prev => ({ 
                  ...prev, 
                  approvedValue: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deniedValue">Valor Glosado (R$)</Label>
              <Input
                id="deniedValue"
                type="number"
                step="0.01"
                min="0"
                value={responseValues.deniedValue}
                onChange={(e) => setResponseValues(prev => ({ 
                  ...prev, 
                  deniedValue: parseFloat(e.target.value) || 0 
                }))}
              />
            </div>

            {responseValues.deniedValue > 0 && (
              <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                <p>
                  Valores glosados serão registrados e poderão ser analisados para 
                  recurso. Na implementação completa, seria possível registrar detalhes específicos 
                  para cada glosa.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button onClick={handleProcessResponse}>
              <Check className="h-4 w-4 mr-2" /> Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
