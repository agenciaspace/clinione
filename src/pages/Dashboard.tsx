import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useClinic } from '@/contexts/ClinicContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  todayAppointments: number;
  tomorrowAppointments: number;
  weekAppointments: number;
  totalPatients: number;
  totalDoctors: number;
  recentAppointments: any[];
}

const Dashboard = () => {
  const { user } = useAuth();
  const { activeClinic } = useClinic();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    tomorrowAppointments: 0,
    weekAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    recentAppointments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeClinic) {
      fetchDashboardStats();
    }
  }, [activeClinic]);

  const fetchDashboardStats = async () => {
    if (!activeClinic) return;
    
    setIsLoading(true);
    try {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const weekEnd = addDays(today, 7);
      
      // Get today's appointments
      const { data: todayAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .gte('date', format(today, 'yyyy-MM-dd') + 'T00:00:00.000Z')
        .lt('date', format(today, 'yyyy-MM-dd') + 'T23:59:59.999Z')
        .neq('status', 'cancelled');

      // Get tomorrow's appointments
      const { data: tomorrowAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .gte('date', format(tomorrow, 'yyyy-MM-dd') + 'T00:00:00.000Z')
        .lt('date', format(tomorrow, 'yyyy-MM-dd') + 'T23:59:59.999Z')
        .neq('status', 'cancelled');

      // Get week's appointments
      const { data: weekAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .gte('date', format(today, 'yyyy-MM-dd') + 'T00:00:00.000Z')
        .lt('date', format(weekEnd, 'yyyy-MM-dd') + 'T23:59:59.999Z')
        .neq('status', 'cancelled');

      // Get total patients
      const { data: patients } = await supabase
        .from('patients')
        .select('id')
        .eq('clinic_id', activeClinic.id);

      // Get total doctors
      const { data: doctors } = await supabase
        .from('doctors')
        .select('id')
        .eq('clinic_id', activeClinic.id);

      // Get recent appointments for quick view
      const { data: recentAppts } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', activeClinic.id)
        .gte('date', format(today, 'yyyy-MM-dd') + 'T00:00:00.000Z')
        .order('date', { ascending: true })
        .limit(5);

      setStats({
        todayAppointments: todayAppts?.length || 0,
        tomorrowAppointments: tomorrowAppts?.length || 0,
        weekAppointments: weekAppts?.length || 0,
        totalPatients: patients?.length || 0,
        totalDoctors: doctors?.length || 0,
        recentAppointments: recentAppts || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAppointmentTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ptBR });
  };

  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, 'dd/MM', { locale: ptBR });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-foreground`}>
              Dashboard
            </h1>
            <p className={`${isMobile ? 'text-sm' : 'text-base'} text-muted-foreground`}>
              {activeClinic 
                ? `Visão geral da ${activeClinic.name}`
                : 'Selecione uma clínica para ver o resumo'
              }
            </p>
          </div>
          
          {activeClinic && (
            <div className="flex gap-2">
              <Button asChild size={isMobile ? "sm" : "default"}>
                <Link to="/dashboard/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  {isMobile ? 'Agenda' : 'Ver Agenda'}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      {!activeClinic ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Selecione uma clínica no menu lateral para visualizar o dashboard
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className={`grid gap-4 mb-6 ${
            isMobile ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'
          }`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoje</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.todayAppointments}</div>
                <p className="text-xs text-muted-foreground">agendamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Amanhã</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tomorrowAppointments}</div>
                <p className="text-xs text-muted-foreground">agendamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.weekAppointments}</div>
                <p className="text-xs text-muted-foreground">agendamentos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pacientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Médicos</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDoctors}</div>
                <p className="text-xs text-muted-foreground">ativos</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Appointments and Quick Actions */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Recent Appointments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Próximos Agendamentos</CardTitle>
                  <CardDescription>
                    Agendamentos para os próximos dias
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard/calendar">
                    Ver Todos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
                    ))}
                  </div>
                ) : stats.recentAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{appointment.patient_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.doctor_name || 'Médico não definido'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatAppointmentDate(appointment.date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatAppointmentTime(appointment.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Nenhum agendamento próximo
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/dashboard/calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Calendário Completo
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/dashboard/patients">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Pacientes
                  </Link>
                </Button>
                
                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/dashboard/doctors">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Gerenciar Médicos
                  </Link>
                </Button>

                <Button asChild className="w-full justify-start" variant="outline">
                  <Link to="/dashboard/reports">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
