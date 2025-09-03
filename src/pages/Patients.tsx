import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Clock
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Patients() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Mock patients data
  const patients = [
    {
      id: 1,
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      phone: '(11) 99999-9999',
      birthDate: '1985-05-15',
      address: 'Rua das Flores, 123 - Vila Madalena, São Paulo',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-20',
      totalVisits: 12,
      status: 'active',
      avatar: 'MS',
      medicalPlan: 'Unimed'
    },
    {
      id: 2,
      name: 'Carlos Oliveira',
      email: 'carlos.oliveira@email.com',
      phone: '(11) 88888-8888',
      birthDate: '1978-03-22',
      address: 'Av. Paulista, 456 - Bela Vista, São Paulo',
      lastVisit: '2024-01-10',
      nextAppointment: null,
      totalVisits: 8,
      status: 'active',
      avatar: 'CO',
      medicalPlan: 'Bradesco Saúde'
    },
    {
      id: 3,
      name: 'Lucia Ferreira',
      email: 'lucia.ferreira@email.com',
      phone: '(11) 77777-7777',
      birthDate: '1992-11-08',
      address: 'Rua Augusta, 789 - Consolação, São Paulo',
      lastVisit: '2023-12-20',
      nextAppointment: '2024-02-25',
      totalVisits: 5,
      status: 'inactive',
      avatar: 'LF',
      medicalPlan: 'Particular'
    },
    {
      id: 4,
      name: 'Pedro Mendes',
      email: 'pedro.mendes@email.com',
      phone: '(11) 66666-6666',
      birthDate: '1969-07-14',
      address: 'Rua Oscar Freire, 321 - Jardins, São Paulo',
      lastVisit: '2024-01-18',
      nextAppointment: '2024-02-15',
      totalVisits: 25,
      status: 'active',
      avatar: 'PM',
      medicalPlan: 'SulAmérica'
    }
  ]

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'blocked':
        return 'Bloqueado'
      default:
        return status
    }
  }

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm)
    
    const matchesFilter = selectedFilter === 'all' || patient.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    inactive: patients.filter(p => p.status === 'inactive').length,
    withAppointments: patients.filter(p => p.nextAppointment).length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-600 mt-1">Gerencie o cadastro de pacientes</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inativos</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">C/ Consultas</p>
              <p className="text-2xl font-bold text-purple-600">{stats.withAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-2">
            <select 
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todos os pacientes</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="blocked">Bloqueados</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Ordenar por</option>
              <option value="name">Nome</option>
              <option value="lastVisit">Última visita</option>
              <option value="totalVisits">Nº de consultas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros ou termos de busca.'
                : 'Comece cadastrando seu primeiro paciente.'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Paciente
              </Button>
            )}
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-lg">
                      {patient.avatar}
                    </span>
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {patient.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(patient.status)
                      }`}>
                        {getStatusText(patient.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {calculateAge(patient.birthDate)} anos • {patient.medicalPlan}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {patient.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {patient.address.split(' - ')[0]}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                      <div>
                        <span className="font-medium">Última consulta:</span> {formatDate(patient.lastVisit)}
                      </div>
                      <div>
                        <span className="font-medium">Total de consultas:</span> {patient.totalVisits}
                      </div>
                      {patient.nextAppointment && (
                        <div>
                          <span className="font-medium">Próxima consulta:</span> {formatDate(patient.nextAppointment)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
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
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Mostrando {filteredPatients.length} de {patients.length} pacientes
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Anterior
            </Button>
            <Button variant="outline" size="sm">
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}