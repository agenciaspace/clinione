import { 
  Calendar, 
  Users, 
  UserCheck, 
  FileText,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Card from '../components/ui/Card'

export default function Dashboard() {
  // Mock data - em produção viria do Supabase
  const stats = [
    {
      name: 'Consultas Hoje',
      value: '12',
      change: '+2.1%',
      changeType: 'increase',
      icon: Calendar,
      color: 'blue'
    },
    {
      name: 'Pacientes Ativos',
      value: '248',
      change: '+15.3%',
      changeType: 'increase',
      icon: Users,
      color: 'green'
    },
    {
      name: 'Profissionais',
      value: '3',
      change: '0%',
      changeType: 'neutral',
      icon: UserCheck,
      color: 'purple'
    },
    {
      name: 'Taxa de No-Show',
      value: '8.2%',
      change: '-2.4%',
      changeType: 'decrease',
      icon: AlertCircle,
      color: 'yellow'
    }
  ]

  const recentAppointments = [
    {
      id: 1,
      patient: 'Maria Silva',
      doctor: 'Dr. João Santos',
      time: '09:00',
      status: 'confirmed',
      type: 'Consulta'
    },
    {
      id: 2,
      patient: 'Carlos Oliveira',
      doctor: 'Dra. Ana Costa',
      time: '10:30',
      status: 'pending',
      type: 'Retorno'
    },
    {
      id: 3,
      patient: 'Lucia Ferreira',
      doctor: 'Dr. João Santos',
      time: '14:00',
      status: 'completed',
      type: 'Consulta'
    },
    {
      id: 4,
      patient: 'Pedro Mendes',
      doctor: 'Dra. Ana Costa',
      time: '15:30',
      status: 'confirmed',
      type: 'Exame'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado'
      case 'pending':
        return 'Pendente'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Visão geral da sua clínica - {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${
                    stat.changeType === 'increase' ? 'text-green-500' : 
                    stat.changeType === 'decrease' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ml-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {stat.change} vs. mês anterior
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-50' :
                stat.color === 'green' ? 'bg-green-50' :
                stat.color === 'purple' ? 'bg-purple-50' :
                'bg-yellow-50'
              }`}>
                <stat.icon className={`h-6 w-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-yellow-600'
                }`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Consultas de Hoje
            </h2>
            <a 
              href="/dashboard/appointments"
              className="text-primary hover:text-primary-hover text-sm font-medium"
            >
              Ver todas
            </a>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium text-sm">
                        {appointment.patient.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-500">{appointment.doctor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {appointment.time}
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    getStatusColor(appointment.status)
                  }`}>
                    {getStatusText(appointment.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Ações Rápidas
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <a
              href="/dashboard/appointments/new"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Calendar className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-blue-900">Nova Consulta</span>
            </a>

            <a
              href="/dashboard/patients/new"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-green-900">Novo Paciente</span>
            </a>

            <a
              href="/dashboard/records/new"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-purple-900">Prontuário</span>
            </a>

            <a
              href="/dashboard/reports"
              className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-yellow-600 mb-2" />
              <span className="text-sm font-medium text-yellow-900">Relatórios</span>
            </a>
          </div>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Alertas e Lembretes
        </h2>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                3 pacientes sem confirmação
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Consultas para hoje que ainda não foram confirmadas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Taxa de no-show melhorou 15%
              </p>
              <p className="text-xs text-green-700 mt-1">
                Comparado ao mês anterior - continue assim!
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}