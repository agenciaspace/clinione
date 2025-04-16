
import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/contexts/ClinicContext';

// Componente para date-range picker
interface DateRangePickerProps {
  className?: string;
}

const DateRangePickerDemo = ({ className }: DateRangePickerProps) => {
  const [date, setDate] = React.useState({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 15)),
  });

  return (
    <div className={className}>
      <DatePickerWithRange date={date} setDate={setDate} />
    </div>
  )
}

interface ReportData {
  date: string;
  total?: number;
  value?: number;
}

interface DoctorPerformance {
  name: string;
  appointments: number;
  revenue: number;
}

interface AppointmentType {
  name: string;
  value: number;
}

const Reports = () => {
  const { activeClinic } = useClinic();
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [selectedReport, setSelectedReport] = useState('appointments');
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentsData, setAppointmentsData] = useState<ReportData[]>([]);
  const [revenueData, setRevenueData] = useState<ReportData[]>([]);
  const [doctorPerformanceData, setDoctorPerformanceData] = useState<DoctorPerformance[]>([]);
  const [appointmentsByTypeData, setAppointmentsByTypeData] = useState<AppointmentType[]>([]);

  useEffect(() => {
    if (activeClinic) {
      fetchReportData();
    } else {
      // Reset data when no clinic is selected
      resetReportData();
    }
  }, [activeClinic, selectedReport, selectedDoctor]);
  
  const resetReportData = () => {
    setAppointmentsData([]);
    setRevenueData([]);
    setDoctorPerformanceData([]);
    setAppointmentsByTypeData([]);
  };

  const fetchReportData = async () => {
    if (!activeClinic) return;
    
    setIsLoading(true);
    
    try {
      // Simulando chamadas de API com timeouts
      // Em um ambiente real, estas seriam chamadas reais para o Supabase ou outra API
      setTimeout(() => {
        setAppointmentsData([]);
        setRevenueData([]);
        setDoctorPerformanceData([]);
        setAppointmentsByTypeData([
          { name: 'Consultas', value: 0 },
          { name: 'Retornos', value: 0 },
          { name: 'Exames', value: 0 },
        ]);
        
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Erro ao buscar dados de relatórios:", error);
      setIsLoading(false);
    }
  };

  // Função para exportar relatórios
  const handleExportReport = () => {
    // Aqui seria implementada a lógica de exportação de relatórios
    alert("Funcionalidade de exportação será implementada em breve!");
  };

  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">
          {activeClinic 
            ? `Acompanhe o desempenho da clínica ${activeClinic.name}`
            : 'Selecione uma clínica para visualizar relatórios'}
        </p>
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
                  {/* Aqui seriam carregados os médicos da clínica ativa */}
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

            <Button className="w-full" disabled={!activeClinic} onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar relatório
            </Button>
          </CardContent>
        </Card>

        {/* Área do relatório */}
        <div className="lg:col-span-9 space-y-6">
          {activeClinic ? (
            <>
              {/* Cards de resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{isLoading ? "..." : "0"}</h3>
                    <p className="text-sm text-gray-500">Consultas agendadas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{isLoading ? "..." : "R$ 0"}</h3>
                    <p className="text-sm text-gray-500">Receita total</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                      <Users className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{isLoading ? "..." : "0"}</h3>
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
                  {isLoading ? (
                    <div className="h-[400px] flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
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
                        {appointmentsData.length > 0 || revenueData.length > 0 || doctorPerformanceData.length > 0 ? (
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
                        ) : (
                          <div className="h-[400px] flex flex-col items-center justify-center">
                            <FileBarChart className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">Sem dados para exibir neste período</p>
                            <p className="text-gray-400 text-sm">Ajuste os filtros ou adicione dados para visualizar relatórios</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="line">
                        {appointmentsData.length > 0 || revenueData.length > 0 ? (
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
                        ) : (
                          <div className="h-[400px] flex flex-col items-center justify-center">
                            <LineChart className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">Sem dados para exibir neste período</p>
                            <p className="text-gray-400 text-sm">Ajuste os filtros ou adicione dados para visualizar relatórios</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="pie">
                        {appointmentsByTypeData.length > 0 && appointmentsByTypeData.some(item => item.value > 0) ? (
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
                        ) : (
                          <div className="h-[400px] flex flex-col items-center justify-center">
                            <PieChart className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-gray-500">Sem dados para exibir neste período</p>
                            <p className="text-gray-400 text-sm">Ajuste os filtros ou adicione dados para visualizar relatórios</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <FileBarChart className="h-12 w-12 mx-auto text-gray-400" />
                </div>
                <h3 className="text-lg font-medium">Nenhuma clínica selecionada</h3>
                <p className="text-gray-500 mt-2">
                  Selecione uma clínica para visualizar os relatórios disponíveis.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
