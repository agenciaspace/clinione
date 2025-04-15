
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Receipt, 
  PieChart,
  Filter,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { BadgeDollarSign, Wallet, Store, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { toast } from '@/components/ui/sonner';

// Dados mockados para exemplo
const mockTransactions = [
  {
    id: '1',
    date: new Date(2025, 3, 15),
    description: 'Consulta - Maria Silva',
    type: 'income',
    amount: 250,
    category: 'Consultas',
    paymentMethod: 'Cartão de crédito',
    status: 'completed'
  },
  {
    id: '2',
    date: new Date(2025, 3, 14),
    description: 'Consulta - João Pereira',
    type: 'income',
    amount: 250,
    category: 'Consultas',
    paymentMethod: 'Pix',
    status: 'completed'
  },
  {
    id: '3',
    date: new Date(2025, 3, 14),
    description: 'Exame - Pedro Santos',
    type: 'income',
    amount: 150,
    category: 'Exames',
    paymentMethod: 'Dinheiro',
    status: 'completed'
  },
  {
    id: '4',
    date: new Date(2025, 3, 13),
    description: 'Material de escritório',
    type: 'expense',
    amount: 120,
    category: 'Despesas operacionais',
    paymentMethod: 'Cartão de crédito',
    status: 'completed'
  },
  {
    id: '5',
    date: new Date(2025, 3, 10),
    description: 'Aluguel',
    type: 'expense',
    amount: 2000,
    category: 'Aluguel',
    paymentMethod: 'Transferência',
    status: 'completed'
  },
  {
    id: '6',
    date: new Date(2025, 3, 5),
    description: 'Salários',
    type: 'expense',
    amount: 5000,
    category: 'Pessoal',
    paymentMethod: 'Transferência',
    status: 'completed'
  },
];

// Dados para o gráfico de pizza
const categoryData = [
  { name: 'Consultas', value: 8500, color: '#8884d8' },
  { name: 'Exames', value: 3500, color: '#82ca9d' },
  { name: 'Procedimentos', value: 5200, color: '#ffc658' },
  { name: 'Outros', value: 1800, color: '#ff8042' }
];

const expensesData = [
  { name: 'Pessoal', value: 5000, color: '#ff8042' },
  { name: 'Aluguel', value: 2000, color: '#ffc658' },
  { name: 'Materiais', value: 1200, color: '#82ca9d' },
  { name: 'Serviços', value: 800, color: '#8884d8' }
];

interface TransactionFormData {
  id?: string;
  description: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  paymentMethod: string;
  date: Date;
}

const Financial = () => {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  } | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 3, 15),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    type: 'income',
    amount: 0,
    category: '',
    paymentMethod: '',
    date: new Date(),
  });

  // Calcular totais
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  
  const balance = income - expenses;

  // Filtrar transações
  const filteredTransactions = transactions.filter(transaction => {
    // Filtro por texto
    const textMatch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por tipo
    const typeMatch = !filterType || 
                     (filterType === 'income' && transaction.type === 'income') || 
                     (filterType === 'expense' && transaction.type === 'expense');
    
    // Filtro por data
    const dateMatch = !dateRange || 
                     (transaction.date >= dateRange.from && 
                      transaction.date <= dateRange.to);
    
    return textMatch && typeMatch && dateMatch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTransaction = () => {
    setFormData({
      description: '',
      type: 'income',
      amount: 0,
      category: '',
      paymentMethod: '',
      date: new Date(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction = {
      id: `${Date.now()}`,
      date: formData.date,
      description: formData.description,
      type: formData.type,
      amount: formData.amount,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      status: 'completed' as const
    };
    
    setTransactions([newTransaction, ...transactions]);
    toast(formData.type === 'income' ? "Receita adicionada com sucesso" : "Despesa adicionada com sucesso");
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500">Gerencie as finanças da sua clínica</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className={balance >= 0 ? "border-l-4 border-l-green-500" : "border-l-4 border-l-red-500"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Saldo</p>
                <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className={`h-12 w-12 rounded-full ${balance >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Receitas</p>
                <h3 className="text-2xl font-bold text-blue-600">
                  R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ArrowDown className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Despesas</p>
                <h3 className="text-2xl font-bold text-amber-600">
                  R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <ArrowUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transações</CardTitle>
                <CardDescription>Gerencie suas receitas e despesas</CardDescription>
              </div>
              <Button onClick={handleAddTransaction}>
                <Plus className="mr-2 h-4 w-4" /> Nova transação
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar transações..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Todos os tipos" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={undefined}>Todos os tipos</SelectItem>
                      <SelectItem value="income">Receitas</SelectItem>
                      <SelectItem value="expense">Despesas</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{format(transaction.date, 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Nenhuma transação encontrada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <p className="text-sm text-gray-500">
                Exibindo {filteredTransactions.length} de {transactions.length} transações
              </p>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo financeiro</CardTitle>
              <CardDescription>Distribuição das receitas e despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="income">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">Receitas</TabsTrigger>
                  <TabsTrigger value="expense">Despesas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="income" className="space-y-4">
                  <div className="h-[220px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {categoryData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          R$ {item.value.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="expense" className="space-y-4">
                  <div className="h-[220px] mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={expensesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {expensesData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">
                          R$ {item.value.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <span>Cartão de crédito</span>
                  </div>
                  <span className="font-medium">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                      <BadgeDollarSign className="h-4 w-4" />
                    </div>
                    <span>Pix</span>
                  </div>
                  <span className="font-medium">35%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
                      <Receipt className="h-4 w-4" />
                    </div>
                    <span>Dinheiro</span>
                  </div>
                  <span className="font-medium">15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                      <Store className="h-4 w-4" />
                    </div>
                    <span>Outros</span>
                  </div>
                  <span className="font-medium">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova transação</DialogTitle>
            <DialogDescription>
              Adicione uma nova receita ou despesa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input 
                      id="amount" 
                      name="amount" 
                      type="number" 
                      step="0.01" 
                      value={formData.amount || ''} 
                      onChange={handleInputChange} 
                      className="pl-10" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.type === 'income' ? (
                        <>
                          <SelectItem value="Consultas">Consultas</SelectItem>
                          <SelectItem value="Exames">Exames</SelectItem>
                          <SelectItem value="Procedimentos">Procedimentos</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="Pessoal">Pessoal</SelectItem>
                          <SelectItem value="Aluguel">Aluguel</SelectItem>
                          <SelectItem value="Materiais">Materiais</SelectItem>
                          <SelectItem value="Serviços">Serviços</SelectItem>
                          <SelectItem value="Outros">Outros</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de pagamento</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de crédito">Cartão de crédito</SelectItem>
                      <SelectItem value="Cartão de débito">Cartão de débito</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {formData.type === 'income' ? 'Adicionar receita' : 'Adicionar despesa'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Financial;
