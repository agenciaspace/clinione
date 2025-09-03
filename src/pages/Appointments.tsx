import { useState, useEffect } from 'react'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import AppointmentModal from '../components/appointments/AppointmentModal'
import { useAppointments } from '../hooks/useAppointments'

export default function Appointments() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('day')
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [professionalFilter, setProfessionalFilter] = useState('')

  const {
    appointments,
    patients,
    professionals,
    services,
    loading,
    error,
    loadAppointments,
    createAppointment
  } = useAppointments()

  // Carregar agendamentos quando a data mudar
  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0]
    loadAppointments(dateString)
  }, [selectedDate])

  // Filtrar appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchTerm || 
      appointment.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.professional?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = !statusFilter || appointment.status === statusFilter
    
    const matchesProfessional = !professionalFilter || appointment.professional_id === professionalFilter

    return matchesSearch && matchesStatus && matchesProfessional
  })

  const handleCreateAppointment = async (data: any) => {
    await createAppointment(data)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Agendado'
      case 'confirmed':
        return 'Confirmado'
      case 'completed':
        return 'Concluído'
      case 'cancelled':
        return 'Cancelado'
      case 'no_show':
        return 'Faltou'
      default:
        return status
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setSelectedDate(newDate)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gerencie consultas e compromissos</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button 
            size="sm"
            onClick={() => setShowNewAppointmentModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Date Navigation and View Toggle */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredAppointments.length} consulta{filteredAppointments.length !== 1 ? 's' : ''}
              </p>
            </div>

            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 sm:mt-0 flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewType('day')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewType === 'day'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewType === 'week'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                viewType === 'month'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mês
            </button>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por paciente, médico ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-2">
            <select 
              value={professionalFilter}
              onChange={(e) => setProfessionalFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os profissionais</option>
              {professionals.map(professional => (
                <option key={professional.id} value={professional.id}>
                  {professional.name}
                </option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              <option value="scheduled">Agendado</option>
              <option value="confirmed">Confirmado</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
              <option value="no_show">Faltou</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-red-900">Erro ao carregar agendamentos</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-12 text-center">
          <div className="animate-spin mx-auto mb-4 h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Carregando agendamentos...</p>
        </Card>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {!loading && filteredAppointments.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma consulta agendada
            </h3>
            <p className="text-gray-600 mb-6">
              Você não possui consultas para esta data.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agendar Nova Consulta
            </Button>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Time */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {appointment.appointment_time}
                    </div>
                    <div className="text-xs text-gray-500">
                      {appointment.service?.duration || 30}min
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">
                        {appointment.patient?.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase() || '??'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.patient?.name || 'Paciente não encontrado'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {appointment.professional?.name || 'Profissional não encontrado'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {appointment.patient?.phone || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          Consultório
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex items-start space-x-4">
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${
                      getStatusColor(appointment.status)
                    }`}>
                      {getStatusText(appointment.status)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {appointment.service?.name || 'Serviço'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    <strong>Observações:</strong> {appointment.notes}
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add more appointments indicator */}
      {filteredAppointments.length > 0 && (
        <div className="text-center py-4">
          <Button variant="outline">
            Ver mais consultas
          </Button>
        </div>
      )}

      {/* New Appointment Modal */}
      <AppointmentModal
        isOpen={showNewAppointmentModal}
        onClose={() => setShowNewAppointmentModal(false)}
        onSubmit={handleCreateAppointment}
        patients={patients}
        professionals={professionals}
        services={services}
        loading={loading}
        selectedDate={selectedDate.toISOString().split('T')[0]}
      />
    </div>
  )
}