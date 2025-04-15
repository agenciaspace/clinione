
import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileBarChart, 
  Users, 
  Calendar, 
  DollarSign, 
  Download,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { addDays } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Componente para date-range picker
interface DateRangePickerProps {
  className?: string;
}

const DateRangePickerDemo = ({ className }: DateRangePickerProps) => {
  const [date, setDate] = React.useState({
    from: new Date(2025, 3, 1),
    to: new Date(2025, 3, 15),
  });

  return (
    <div className={className}>
      <DatePickerWithRange date={date} setDate={setDate} />
    </div>
  )
}

// Dados mockados
const appointmentsData = [
  { date: '01/04', total: 12 },
  { date: '02/04', total: 15 },
  { date: '03/04', total: 10 },
  { date: '04/04', total: 18 },
  { date: '05/04', total: 14 },
  { date: '06/04', total: 7 },
  { date: '07/04', total: 20 },
  { date: '08/04', total: 16 },
  { date: '09/04', total: 13 },
  { date: '10/04', total: 17 },
  { date: '11/04', total: 19 },
  { date: '12/04', total: 8 },
  { date: '13/04', total: 5 },
  { date: '14/04', total: 11 },
  { date: '15/04', total: 14 },
];

const revenueData = [
  { date: '01/04', value: 1200 },
  { date: '02/04', value: 1500 },
  { date: '03/04', value: 1000 },
  { date: '04/04', value: 1800 },
  { date: '05/04', value: 1400 },
  { date: '06/04', value: 700 },
  { date: '07/04', value: 2000 },
  { date: '08/04', value: 1600 },
  { date: '09/04', value: 1300 },
  { date: '10/04', value: 1700 },
  { date: '11/04', value: 1900 },
  { date: '12/04', value: 800 },
  { date: '13/04', value: 500 },
  { date: '14/04', value: 1100 },
  { date: '15/04', value: 1400 },
];

const doctorPerformanceData = [
  { name: 'Dr. João Cardoso', appointments: 45, revenue: 9000 },
  { name: 'Dra. Ana Beatriz', appointments: 38, revenue: 7600 },
  { name: 'Dr. Carlos Eduardo', appointments: 30, revenue: 6000 },
];

const appointmentsByTypeData = [
  { name: 'Consultas', value: 65 },
  { name: 'Retornos', value: 25 },
  { name: 'Exames', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Reports = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState('appointments');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Acompanhe o desempenho da sua clínica</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Filtros e controles */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Configure seu relatório</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Período</p>
              <DateRangePickerDemo className="w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Profissional</p>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os profissionais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os profissionais</SelectItem>
                  <SelectItem value="Dr. João Cardoso">Dr. João Cardoso</SelectItem>
                  <SelectItem value="Dra. Ana Beatriz">Dra. Ana Beatriz</SelectItem>
                  <SelectItem value="Dr. Carlos Eduardo">Dr. Carlos Eduardo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Tipo de relatório</p>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant={selectedReport === 'appointments' ? 'default' : 'outline'} 
                  className="justify-start"
                  onClick={() => setSelectedReport('appointments')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendamentos
                </Button>
                <Button 
                  variant={selectedReport === 'revenue' ? 'default' : 'outline'} 
                  className="justify-start"
                  onClick={() => setSelectedReport('revenue')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financeiro
                </Button>
                <Button 
                  variant={selectedReport === 'doctors' ? 'default' : 'outline'} 
                  className="justify-start"
                  onClick={() => setSelectedReport('doctors')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Profissionais
                </Button>
              </div>
            </div>

            <Button className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar relatório
            </Button>
          </CardContent>
        </Card>

        {/* Área do relatório */}
        <div className="lg:col-span-9 space-y-6">
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">174</h3>
                <p className="text-sm text-gray-500">Consultas agendadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">R$ 22.450</h3>
                <p className="text-sm text-gray-500">Receita total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">87</h3>
                <p className="text-sm text-gray-500">Novos pacientes</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedReport === 'appointments' && 'Agendamentos por dia'}
                {selectedReport === 'revenue' && 'Receita por dia'}
                {selectedReport === 'doctors' && 'Desempenho por profissional'}
              </CardTitle>
              <CardDescription>
                {selectedReport === 'appointments' && 'Visualize o volume de agendamentos ao longo do tempo'}
                {selectedReport === 'revenue' && 'Acompanhe a receita gerada em cada dia'}
                {selectedReport === 'doctors' && 'Compare o desempenho entre os profissionais'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="chart" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="chart" className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" /> Gráfico
                  </TabsTrigger>
                  <TabsTrigger value="line" className="flex items-center">
                    <LineChart className="h-4 w-4 mr-2" /> Linha
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center">
                    <PieChart className="h-4 w-4 mr-2" /> Pizza
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chart">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {selectedReport === 'doctors' ? (
                        <BarChart
                          data={doctorPerformanceData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="appointments" fill="#8884d8" name="Consultas" />
                          <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Receita (R$)" />
                        </BarChart>
                      ) : (
                        <BarChart
                          data={selectedReport === 'appointments' ? appointmentsData : revenueData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey={selectedReport === 'appointments' ? 'total' : 'value'} 
                            fill="#8884d8" 
                            name={selectedReport === 'appointments' ? 'Consultas' : 'Receita (R$)'} 
                          />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="line">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart
                        data={selectedReport === 'appointments' ? appointmentsData : revenueData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey={selectedReport === 'appointments' ? 'total' : 'value'} 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                          name={selectedReport === 'appointments' ? 'Consultas' : 'Receita (R$)'} 
                        />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="pie">
                  <div className="h-[400px] flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={appointmentsByTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appointmentsByTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
