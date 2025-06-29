import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus,
  Filter,
  Wallet,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useClinic } from '@/contexts/ClinicContext';
import { Transaction } from '@/types';

interface FinancialCategory {
  id: string;
  clinic_id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  is_active: boolean;
}

interface ExtendedTransaction extends Transaction {
  category?: FinancialCategory;
}

interface FinancialWithCategoriesProps {
  transactions: ExtendedTransaction[];
  onTransactionAdded: (transaction: ExtendedTransaction) => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export function FinancialWithCategories({ 
  transactions, 
  onTransactionAdded,
  isDialogOpen,
  setIsDialogOpen 
}: FinancialWithCategoriesProps) {
  const { activeClinic } = useClinic();
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  // Form states
  const [newTransactionDescription, setNewTransactionDescription] = useState('');
  const [newTransactionAmount, setNewTransactionAmount] = useState('');
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('income');
  const [newTransactionStatus, setNewTransactionStatus] = useState<'completed' | 'pending'>('completed');
  const [newTransactionCategoryId, setNewTransactionCategoryId] = useState<string>('');
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      if (!activeClinic) return;

      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from('financial_categories')
          .select('*')
          .eq('clinic_id', activeClinic.id)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erro ao carregar categorias');
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, [activeClinic]);

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(cat => 
    cat.type === newTransactionType || cat.type === 'both'
  );

  // Add transaction with category
  const addTransaction = async () => {
    if (!activeClinic) return;
    
    if (!newTransactionDescription.trim()) {
      toast.error('A descrição é obrigatória');
      return;
    }
    
    if (!newTransactionAmount || isNaN(Number(newTransactionAmount)) || Number(newTransactionAmount) <= 0) {
      toast.error('Valor inválido');
      return;
    }

    if (!newTransactionCategoryId) {
      toast.error('Selecione uma categoria');
      return;
    }

    try {
      const newTransaction = {
        clinic_id: activeClinic.id,
        description: newTransactionDescription,
        amount: Number(newTransactionAmount),
        type: newTransactionType,
        status: newTransactionStatus,
        category_id: newTransactionCategoryId,
        date: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(newTransaction)
        .select(`
          *,
          category:financial_categories(*)
        `);

      if (error) throw error;

      if (data && data[0]) {
        onTransactionAdded(data[0] as ExtendedTransaction);
        
        // Reset form
        setNewTransactionDescription('');
        setNewTransactionAmount('');
        setNewTransactionType('income');
        setNewTransactionStatus('completed');
        setNewTransactionCategoryId('');
        setIsDialogOpen(false);
        
        toast.success('Transação adicionada com sucesso');
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Erro ao adicionar transação');
    }
  };

  // Calculate totals by category
  const calculateCategoryTotals = () => {
    const totals: Record<string, { income: number; expense: number; category: FinancialCategory }> = {};
    
    transactions.forEach(transaction => {
      if (transaction.category) {
        const catId = transaction.category.id;
        if (!totals[catId]) {
          totals[catId] = {
            income: 0,
            expense: 0,
            category: transaction.category
          };
        }
        
        if (transaction.type === 'income') {
          totals[catId].income += transaction.amount;
        } else {
          totals[catId].expense += transaction.amount;
        }
      }
    });
    
    return totals;
  };

  const categoryTotals = calculateCategoryTotals();

  return (
    <>
      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(categoryTotals).map(([catId, data]) => (
          <Card key={catId} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="h-8 w-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: data.category.color + '20' }}
                    >
                      <Tag className="h-4 w-4" style={{ color: data.category.color }} />
                    </div>
                    <h4 className="font-medium text-sm">{data.category.name}</h4>
                  </div>
                  {data.income > 0 && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <ArrowUpRight className="h-3 w-3" />
                      <span>R$ {data.income.toFixed(2)}</span>
                    </div>
                  )}
                  {data.expense > 0 && (
                    <div className="flex items-center gap-1 text-red-600 text-sm">
                      <ArrowDownRight className="h-3 w-3" />
                      <span>R$ {data.expense.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction Dialog with Categories */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onValueChange={(value) => {
                  setNewTransactionType(value as 'income' | 'expense');
                  setNewTransactionCategoryId(''); // Reset category when type changes
                }}
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
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={newTransactionCategoryId}
                onValueChange={setNewTransactionCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <SelectItem value="loading" disabled>Carregando...</SelectItem>
                  ) : filteredCategories.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhuma categoria disponível</SelectItem>
                  ) : (
                    filteredCategories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={addTransaction}>
              Adicionar transação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 