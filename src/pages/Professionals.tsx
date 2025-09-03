import { useState } from 'react'
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Star,
  MapPin,
  Award
} from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

export default function Professionals() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')

  // Mock professionals data
  const professionals = [
    {
      id: 1,
      name: 'Dr. João Santos',
      email: 'joao.santos@clinica.com',
      phone: '(11) 99999-0001',
      crm: 'CRM/SP 123456',
      specialty: 'Cardiologia',
      subSpecialty: 'Ecocardiografia',
      experience: 15,
      education: 'USP - Faculdade de Medicina',
      status: 'active',
      avatar: 'JS',
      rating: 4.8,
      totalPatients: 245,
      appointmentsToday: 8,
      schedule: {
        monday: '08:00-17:00',
        tuesday: '08:00-17:00',
        wednesday: '08:00-12:00',
        thursday: '08:00-17:00',
        friday: '08:00-16:00'
      },
      location: 'Consultório 1'
    },
    {
      id: 2,
      name: 'Dra. Ana Costa',
      email: 'ana.costa@clinica.com',
      phone: '(11) 99999-0002',
      crm: 'CRM/SP 234567',
      specialty: 'Ginecologia',
      subSpecialty: 'Obstetrícia',
      experience: 12,
      education: 'UNIFESP - Escola Paulista de Medicina',
      status: 'active',
      avatar: 'AC',
      rating: 4.9,
      totalPatients: 189,
      appointmentsToday: 6,
      schedule: {
        monday: '09:00-18:00',
        tuesday: '09:00-18:00',
        wednesday: '14:00-20:00',
        thursday: '09:00-18:00',
        friday: '09:00-15:00'
      },
      location: 'Consultório 2'
    },
    {
      id: 3,
      name: 'Dr. Ricardo Lima',
      email: 'ricardo.lima@clinica.com',
      phone: '(11) 99999-0003',
      crm: 'CRM/SP 345678',
      specialty: 'Ortopedia',
      subSpecialty: 'Cirurgia da Mão',
      experience: 8,
      education: 'FMUSP - Faculdade de Medicina',
      status: 'vacation',
      avatar: 'RL',
      rating: 4.7,
      totalPatients: 156,
      appointmentsToday: 0,
      schedule: {
        monday: '13:00-19:00',
        tuesday: '13:00-19:00',
        wednesday: '08:00-14:00',
        thursday: '13:00-19:00',
        friday: 'Folga'
      },
      location: 'Consultório 3'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'vacation':
        return 'bg-blue-100 text-blue-800'
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
      case 'vacation':
        return 'Férias'
      case 'inactive':
        return 'Inativo'
      case 'blocked':
        return 'Bloqueado'
      default:
        return status
    }
  }

  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.crm.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            professional.specialty.toLowerCase() === selectedSpecialty.toLowerCase()
    
    return matchesSearch && matchesSpecialty
  })

  const specialties = [...new Set(professionals.map(p => p.specialty))]

  const stats = {
    total: professionals.length,
    active: professionals.filter(p => p.status === 'active').length,
    totalAppointments: professionals.reduce((sum, p) => sum + p.appointmentsToday, 0),
    avgRating: (professionals.reduce((sum, p) => sum + p.rating, 0) / professionals.length).toFixed(1)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-1">Gerencie médicos e profissionais da clínica</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Horários
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Profissional
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
            <UserCheck className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultas Hoje</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
              <div className="flex items-center">
                <p className="text-2xl font-bold text-yellow-600 mr-1">{stats.avgRating}</p>
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
              </div>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
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
                placeholder="Buscar por nome, especialidade ou CRM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-2">
            <select 
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todas as especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Status</option>
              <option value="active">Ativo</option>
              <option value="vacation">Férias</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Professionals List */}
      <div className="space-y-4">
        {filteredProfessionals.length === 0 ? (
          <Card className="p-12 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Tente ajustar os filtros ou termos de busca.'
                : 'Comece cadastrando seu primeiro profissional.'
              }
            </p>
            {!searchTerm && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Profissional
              </Button>
            )}
          </Card>
        ) : (
          filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium text-lg">
                      {professional.avatar}
                    </span>
                  </div>

                  {/* Professional Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {professional.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        getStatusColor(professional.status)
                      }`}>
                        {getStatusText(professional.status)}
                      </span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium text-gray-700">{professional.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {professional.specialty} • {professional.subSpecialty}
                    </p>
                    
                    <p className="text-sm text-gray-500">
                      {professional.crm} • {professional.experience} anos de experiência
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {professional.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {professional.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {professional.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        {professional.education}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {professional.appointmentsToday} consultas hoje
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <UserCheck className="h-4 w-4 mr-2" />
                        {professional.totalPatients} pacientes
                      </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Horários desta semana:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                        <div>
                          <span className="font-medium">Seg:</span> {professional.schedule.monday}
                        </div>
                        <div>
                          <span className="font-medium">Ter:</span> {professional.schedule.tuesday}
                        </div>
                        <div>
                          <span className="font-medium">Qua:</span> {professional.schedule.wednesday}
                        </div>
                        <div>
                          <span className="font-medium">Qui:</span> {professional.schedule.thursday}
                        </div>
                        <div>
                          <span className="font-medium">Sex:</span> {professional.schedule.friday}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalhes">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Horários">
                    <Calendar className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" fullWidth>
            <Calendar className="h-4 w-4 mr-2" />
            Gerenciar Horários
          </Button>
          <Button variant="outline" fullWidth>
            <Award className="h-4 w-4 mr-2" />
            Relatório de Performance
          </Button>
          <Button variant="outline" fullWidth>
            <Clock className="h-4 w-4 mr-2" />
            Plantões e Escalas
          </Button>
        </div>
      </Card>
    </div>
  )
}