
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileBarChart, Users, Calendar, DollarSign, Download } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClinic } from '@/contexts/ClinicContext';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { useDoctors } from '@/hooks/useDoctors';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChartContainer, ChartTooltipContent, ChartTooltip } from '@/components/ui/chart';

const Reports = () => {
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const [selectedDoctor, setSelectedDoctor] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });

  const { allAppointments, isLoading: isLoadingAppointments } = useAppointments(null, selectedDoctor);
  const { patients } = usePatients(activeClinic?.id);
  const { doctors, isLoading: isLoadingDoctors } = useDoctors();

  const hasValidDateRange = dateRange?.from && dateRange?.to;
  
  const filteredAppointments = hasValidDateRange 
    ? allAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return isWithinInterval(appointmentDate, {
          start: dateRange.from!,
          end: dateRange.to!
        });
      })
    : [];

  const totalAppointments = filteredAppointments.length;
  const confirmedAppointments = filteredAppointments.filter(app => app.status === 'confirmed').length;
  const cancelledAppointments = filteredAppointments.filter(app => app.status === 'cancelled').length;
  const pendingAppointments = filteredAppointments.filter(app => 
    app.status !== 'confirmed' && app.status !== 'cancelled'
  ).length;

  const appointmentsByDay = filteredAppointments.reduce((acc: any[], appointment) => {
    const date = format(new Date(appointment.date), 'dd/MM');
    const existingDay = acc.find(item => item.date === date);
    
    if (existingDay) {
      existingDay.total += 1;
    } else {
      acc.push({ date, total: 1 });
    }
    
    return acc;
  }, []);

  const appointmentsByStatus = [
    { name: 'Confirmados', value: confirmedAppointments },
    { name: 'Cancelados', value: cancelledAppointments },
    { name: 'Agendados', value: pendingAppointments }
  ].filter(item => item.value > 0);

  const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

  const isLoading = isLoadingAppointments || isLoadingDoctors;

  // Remova o formatPieLabel e use renderizações de legenda personalizadas
  // para melhorar a responsividade

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

      {activeClinic ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{totalAppointments}</h3>
                <p className="text-sm text-gray-500">Total de agendamentos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{patients.length}</h3>
                <p className="text-sm text-gray-500">Pacientes cadastrados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-4">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{confirmedAppointments}</h3>
                <p className="text-sm text-gray-500">Consultas confirmadas</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                </div>
                <Select 
                  value={selectedDoctor} 
                  onValueChange={setSelectedDoctor}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Todos os profissionais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os profissionais</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" disabled={isLoading}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar dados
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Agendamentos por dia</CardTitle>
                <CardDescription>
                  Distribuição de agendamentos no período selecionado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
                  </div>
                ) : appointmentsByDay.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <BarChart 
                        data={appointmentsByDay}
                        margin={{ 
                          top: 5, 
                          right: isMobile ? 10 : 30, 
                          left: isMobile ? 0 : 20, 
                          bottom: 5 
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          height={50}
                        />
                        <YAxis
                          tick={{ fontSize: isMobile ? 10 : 12 }}
                          width={isMobile ? 30 : 40}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border rounded shadow text-xs md:text-sm">
                                  <p>Data: {payload[0].payload.date}</p>
                                  <p>Total: {payload[0].value} agendamentos</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ fontSize: isMobile ? 10 : 12 }}
                        />
                        <Bar dataKey="total" fill="#3B82F6" name="Agendamentos" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center">
                    <FileBarChart className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Sem dados para o período selecionado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Status dos agendamentos</CardTitle>
                <CardDescription>
                  Distribuição dos agendamentos por status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
                  </div>
                ) : totalAppointments > 0 && appointmentsByStatus.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={appointmentsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          // Removendo o label que estava dentro do gráfico
                          label={false}
                          outerRadius={isMobile ? 70 : 90}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {appointmentsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload;
                              return (
                                <div className="bg-white p-2 border rounded shadow text-xs md:text-sm">
                                  <p>Status: {item.name}</p>
                                  <p>Quantidade: {item.value}</p>
                                  <p>Porcentagem: {((item.value / totalAppointments) * 100).toFixed(1)}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend 
                          content={(props) => {
                            const { payload = [] } = props;
                            
                            if (!payload || payload.length === 0) return null;
                            
                            return (
                              <div className="flex flex-col gap-2 p-2 mt-4">
                                <div className="flex flex-wrap gap-4 justify-center">
                                  {payload.map((entry, index) => (
                                    <div 
                                      key={`legend-${index}`} 
                                      className="flex items-center gap-2 text-xs md:text-sm"
                                    >
                                      <div 
                                        className="w-3 h-3 rounded" 
                                        style={{ backgroundColor: entry.color }}
                                      />
                                      <span>{entry.value}</span>
                                      <span className="font-bold ml-1">
                                        {((entry.payload.value / totalAppointments) * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                                  {appointmentsByStatus.map((status, i) => (
                                    <div key={`status-count-${i}`} className="flex items-center">
                                      <span className="font-medium" style={{ color: COLORS[i % COLORS.length] }}>
                                        {status.name}: {status.value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center">
                    <FileBarChart className="h-16 w-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 text-center">Sem dados para o período selecionado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
    </DashboardLayout>
  );
};

export default Reports;
