import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CreditCard, 
  BanknoteIcon, 
  Receipt,
  FileText,
  BarChart,
  Download,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClinic } from '@/contexts/ClinicContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from '@/types';
import { FinancialForecastDashboard } from '@/components/financial/FinancialForecastDashboard';
import { webhookEvents } from '@/utils/webhook-service';

const Financial = () => {
  const { activeClinic } = useClinic();
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states for new transaction
  const [newTransactionDescription, setNewTransactionDescription] = useState('');
  const [newTransactionAmount, setNewTransactionAmount] = useState('');
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('income');
  const [newTransactionStatus, setNewTransactionStatus] = useState<'completed' | 'pending'>('completed');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch transactions from the database
  useEffect(() => {
    async function fetchTransactions() {
      if (!activeClinic) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('clinic_id', activeClinic.id);

        if (error) throw error;
        
        // Ensure correct typing
        const typedData = data as Transaction[];
        setTransactions(typedData || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Falha ao carregar transações financeiras');
      } finally {
        setLoading(false);
      }
    }

    fetchTransactions();
  }, [activeClinic]);

  // Function to add a new transaction
  const addTransaction = async () => {
    if (!activeClinic) return;
    
    // Validate input
    if (!newTransactionDescription.trim()) {
      toast.error('A descrição é obrigatória');
      return;
    }
    
    if (!newTransactionAmount || isNaN(Number(newTransactionAmount)) || Number(newTransactionAmount) <= 0) {
      toast.error('Valor inválido');
      return;
    }

    try {
      const newTransaction = {
        clinic_id: activeClinic.id,
        description: newTransactionDescription,
        amount: Number(newTransactionAmount),
        type: newTransactionType,
        status: newTransactionStatus,
        date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select();

      if (error) throw error;

      // Close dialog and reset form
      setIsDialogOpen(false);
      
      // Update local state with the new transaction
      if (data) {
        setTransactions([...data as Transaction[], ...transactions]);
        
        // Disparar webhook para integração
        webhookEvents.transactions.created(data[0], activeClinic.id);
      }
      
      // Reset form
      setNewTransactionDescription('');
      setNewTransactionAmount('');
      setNewTransactionType('income');
      setNewTransactionStatus('completed');
      
      toast.success('Transação adicionada com sucesso');
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erro ao adicionar transação');
    }
  };

  // Calculate financial metrics
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500">
          {activeClinic
            ? `Controle financeiro da clínica ${activeClinic.name}`
            : 'Selecione uma clínica para visualizar os dados financeiros'}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="forecasts">Previsibilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        {activeClinic ? (
          <>
            <TabsContent value="overview" className="space-y-6">
              {/* Cards de resumo financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Receitas</p>
                        <h3 className="text-2xl font-bold mt-1">R$ {totalIncome.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    {transactions.length > 0 ? (
                      <p className="text-xs text-green-600 flex items-center mt-4">
                        <ArrowUpRight className="h-3 w-3 mr-1" /> Receita total
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-4">
                        Sem dados de receitas
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Despesas</p>
                        <h3 className="text-2xl font-bold mt-1">R$ {totalExpense.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                    {transactions.length > 0 ? (
                      <p className="text-xs text-red-600 flex items-center mt-4">
                        <ArrowDownRight className="h-3 w-3 mr-1" /> Despesa total
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-4">
                        Sem dados de despesas
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pendente</p>
                        <h3 className="text-2xl font-bold mt-1">R$ {pendingAmount.toFixed(2)}</h3>
                      </div>
                      <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-xs text-yellow-600 flex items-center mt-4">
                      {transactions.filter(t => t.status === 'pending').length} pagamentos pendentes
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Nova seção de previsibilidade financeira */}
              <FinancialForecastDashboard />

              {/* Gráfico e últimas transações */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader className="pb-0">
                    <CardTitle>Receitas e despesas</CardTitle>
                    <CardDescription>Comparativo mensal</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-md">
                      <div className="text-center">
                        <BarChart className="h-16 w-16 mx-auto text-gray-300" />
                        <p className="text-sm text-gray-500 mt-2">
                          {transactions.length > 0 
                            ? 'Gráfico de receitas e despesas' 
                            : 'Sem dados para exibir o gráfico'}
                        </p>
                        {transactions.length === 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-4" 
                            onClick={() => setActiveTab('transactions')}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Adicionar transação
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="flex justify-between items-center">
                      <span>Últimas transações</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setActiveTab('transactions')}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {loading ? (
                      <div className="py-8 text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Carregando transações...</p>
                      </div>
                    ) : transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 3).map(transaction => (
                          <div key={transaction.id} className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {transaction.type === 'income' ? (
                                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium">{transaction.description}</p>
                                <p className="text-xs text-gray-500">{
                                  new Date(transaction.date).toLocaleDateString('pt-BR')
                                }</p>
                              </div>
                            </div>
                            <p className={`font-medium ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                            </p>
                          </div>
                        ))}

                        {transactions.length > 3 && (
                          <Button 
                            variant="ghost" 
                            className="w-full" 
                            onClick={() => setActiveTab('transactions')}
                          >
                            Ver todas
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="py-8 text-center">
                        <p className="text-sm text-gray-500">Nenhuma transação registrada</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-4" 
                          onClick={() => setActiveTab('transactions')}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Adicionar transação
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transações</h2>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={transactions.length === 0}>
                    <Download className="h-4 w-4 mr-2" /> Exportar
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" /> Nova transação
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar nova transação</DialogTitle>
                        <DialogDescription>
                          Preencha os detalhes da transação abaixo
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="description">Descrição</Label>
                          <Input
                            id="description"
                            value={newTransactionDescription}
                            onChange={(e) => setNewTransactionDescription(e.target.value)}
                            placeholder="Ex: Consulta - João Silva"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Valor (R$)</Label>
                          <Input
                            id="amount"
                            value={newTransactionAmount}
                            onChange={(e) => setNewTransactionAmount(e.target.value)}
                            placeholder="0,00"
                            type="number"
                            step="0.01"
                            min="0"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">Tipo</Label>
                          <Select 
                            value={newTransactionType}
                            onValueChange={(value) => setNewTransactionType(value as 'income' | 'expense')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="status">Status</Label>
                          <Select 
                            value={newTransactionStatus}
                            onValueChange={(value) => setNewTransactionStatus(value as 'completed' | 'pending')}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">Concluído</SelectItem>
                              <SelectItem value="pending">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={addTransaction}>Adicionar transação</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="py-12 text-center">
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent mx-auto"></div>
                      <p className="text-gray-500 mt-4">Carregando transações...</p>
                    </div>
                  ) : transactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell>{new Date(transaction.date).toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              {transaction.type === 'income' ? (
                                <span className="inline-flex items-center text-green-600">
                                  <ArrowUpRight className="h-4 w-4 mr-1" /> Receita
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-red-600">
                                  <ArrowDownRight className="h-4 w-4 mr-1" /> Despesa
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transaction.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                              </span>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Receipt className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium">Nenhuma transação encontrada</h3>
                      <p className="text-gray-500 max-w-md mt-2">
                        Você ainda não tem transações registradas. Clique no botão acima para criar sua primeira transação.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="forecasts" className="space-y-4">
              <FinancialForecastDashboard />
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios financeiros</CardTitle>
                  <CardDescription>Analise o desempenho financeiro da sua clínica</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
                      <BarChart className="h-10 w-10 mb-2" />
                      <span className="font-medium">Relatório de receitas</span>
                      <span className="text-sm text-gray-500">Análise detalhada de receitas</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
                      <FileText className="h-10 w-10 mb-2" />
                      <span className="font-medium">Demonstrativo financeiro</span>
                      <span className="text-sm text-gray-500">Resumo financeiro completo</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
                      <BanknoteIcon className="h-10 w-10 mb-2" />
                      <span className="font-medium">Fluxo de caixa</span>
                      <span className="text-sm text-gray-500">Entradas e saídas de recursos</span>
                    </Button>
                    
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center justify-center">
                      <DollarSign className="h-10 w-10 mb-2" />
                      <span className="font-medium">Inadimplência</span>
                      <span className="text-sm text-gray-500">Controle de contas a receber</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <Card className="mt-4">
            <CardContent className="p-8 text-center">
              <div className="mb-4">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">Nenhuma clínica selecionada</h3>
              <p className="text-gray-500 mt-2">
                Selecione uma clínica para visualizar os dados financeiros.
              </p>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </DashboardLayout>
  );
};

export default Financial;
