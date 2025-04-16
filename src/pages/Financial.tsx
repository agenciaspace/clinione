
import React, { useState } from 'react';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClinic } from '@/contexts/ClinicContext';

// Dados mockados para as transações
const mockTransactions = [
  {
    id: '1',
    date: '2025-04-15',
    description: 'Consulta - João Silva',
    type: 'income',
    status: 'completed',
    amount: 250
  },
  {
    id: '2',
    date: '2025-04-14',
    description: 'Consulta - Maria Oliveira',
    type: 'income',
    status: 'completed',
    amount: 300
  },
  {
    id: '3',
    date: '2025-04-13',
    description: 'Exame - Pedro Santos',
    type: 'income',
    status: 'pending',
    amount: 150
  },
  {
    id: '4',
    date: '2025-04-12',
    description: 'Material de escritório',
    type: 'expense',
    status: 'completed',
    amount: 85
  },
  {
    id: '5',
    date: '2025-04-10',
    description: 'Pagamento de água',
    type: 'expense',
    status: 'completed',
    amount: 120
  }
];

const Financial = () => {
  const { activeClinic } = useClinic();
  const [activeTab, setActiveTab] = useState('overview');

  // Em uma aplicação real, esses dados seriam filtrados com base na clínica selecionada
  const transactions = mockTransactions;

  // Cálculos para o dashboard financeiro
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
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
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
                    <p className="text-xs text-green-600 flex items-center mt-4">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> 12% em relação ao mês anterior
                    </p>
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
                    <p className="text-xs text-red-600 flex items-center mt-4">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> 8% em relação ao mês anterior
                    </p>
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
                      3 pagamentos pendentes
                    </p>
                  </CardContent>
                </Card>
              </div>

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
                        <p className="text-sm text-gray-500 mt-2">Gráfico de receitas e despesas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="flex justify-between items-center">
                      <span>Últimas transações</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      {transactions.slice(0, 3).map(transaction => (
                        <div key={transaction.id} className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${
                              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'income' ? (
                                <ArrowUpRight className={`h-5 w-5 ${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`} />
                              ) : (
                                <ArrowDownRight className={`h-5 w-5 ${
                                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                }`} />
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Transações</h2>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Exportar
                  </Button>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> Nova transação
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Faturas</CardTitle>
                  <CardDescription>Gerencie faturas e recebimentos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Receipt className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma fatura encontrada</h3>
                    <p className="text-gray-500 max-w-md mt-2">
                      Você ainda não tem faturas registradas. Clique no botão abaixo para criar sua primeira fatura.
                    </p>
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" /> Criar fatura
                    </Button>
                  </div>
                </CardContent>
              </Card>
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
