import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Archive, 
  RotateCcw, 
  FileText, 
  Clock, 
  User, 
  AlertTriangle,
  Search,
  Calendar,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUserArchival } from '@/hooks/useUserArchival';
import { useClinic } from '@/contexts/ClinicContext';
import { toast } from '@/components/ui/sonner';

interface ArchivedUser {
  id: string;
  user_id: string;
  role: string;
  is_archived: boolean;
  archived_at: string;
  archived_by: string;
  archival_reason: string;
  original_user_data: any;
}

export const ArchivedUsersManager: React.FC = () => {
  const { activeClinic } = useClinic();
  const {
    getArchivedUsers,
    getArchivedMedicalData,
    restoreUser,
    deleteExpiredArchivedData,
    isLoading
  } = useUserArchival();

  const [archivedUsers, setArchivedUsers] = useState<ArchivedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ArchivedUser | null>(null);
  const [medicalDataCount, setMedicalDataCount] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showMedicalDataModal, setShowMedicalDataModal] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [userToRestore, setUserToRestore] = useState<ArchivedUser | null>(null);

  useEffect(() => {
    if (activeClinic) {
      loadArchivedUsers();
    }
  }, [activeClinic]);

  const loadArchivedUsers = async () => {
    if (!activeClinic) return;

    const users = await getArchivedUsers(activeClinic.id);
    setArchivedUsers(users);

    // Load medical data count for each user
    const counts: { [key: string]: number } = {};
    for (const user of users) {
      const medicalData = await getArchivedMedicalData(activeClinic.id);
      counts[user.user_id] = medicalData.filter(d => d.archived_user_data?.id === user.user_id).length;
    }
    setMedicalDataCount(counts);
  };

  const handleRestoreUser = async (user: ArchivedUser) => {
    setUserToRestore(user);
    setShowRestoreDialog(true);
  };

  const confirmRestore = async () => {
    if (!userToRestore || !activeClinic) return;

    const success = await restoreUser(userToRestore.user_id, activeClinic.id);
    if (success) {
      await loadArchivedUsers();
    }
    
    setShowRestoreDialog(false);
    setUserToRestore(null);
  };

  const handleViewMedicalData = async (user: ArchivedUser) => {
    setSelectedUser(user);
    setShowMedicalDataModal(true);
  };

  const handleCleanupExpiredData = async () => {
    const deletedCount = await deleteExpiredArchivedData();
    if (deletedCount > 0) {
      await loadArchivedUsers();
    }
  };

  const filteredUsers = archivedUsers.filter(user => {
    const userData = user.original_user_data;
    const searchLower = searchTerm.toLowerCase();
    
    return (
      userData?.email?.toLowerCase().includes(searchLower) ||
      userData?.raw_user_meta_data?.name?.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.archival_reason?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleColor = (role: string) => {
    const colors = {
      owner: 'bg-purple-500',
      admin: 'bg-blue-500',
      doctor: 'bg-green-500',
      staff: 'bg-orange-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatRetentionDate = (archivedDate: string) => {
    const archived = new Date(archivedDate);
    const retention = new Date(archived);
    retention.setFullYear(retention.getFullYear() + 5);
    return format(retention, "dd/MM/yyyy", { locale: ptBR });
  };

  if (!activeClinic) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Selecione uma clínica para gerenciar usuários arquivados</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Archive className="h-5 w-5" />
                <span>Usuários Arquivados</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Usuários removidos do sistema com dados médicos preservados por questões legais
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCleanupExpiredData}
              >
                <Clock className="h-4 w-4 mr-2" />
                Limpar Expirados
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Legal Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800">Retenção Legal de Dados Médicos</p>
              <p className="text-amber-700 mt-1">
                Conforme legislação brasileira, prontuários médicos devem ser preservados por 5 anos. 
                Dados arquivados só podem ser permanentemente removidos após este período.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, função ou motivo do arquivamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Archived Users List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuários Arquivados ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-8">
              <p>Carregando usuários arquivados...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário arquivado encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => {
                const userData = user.original_user_data;
                const medicalCount = medicalDataCount[user.user_id] || 0;
                
                return (
                  <div
                    key={user.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {userData?.raw_user_meta_data?.name || userData?.email || 'Usuário sem nome'}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`${getRoleColor(user.role)} text-white`}
                          >
                            {user.role}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p><strong>Email:</strong> {userData?.email}</p>
                          <p><strong>Arquivado em:</strong> {formatDate(user.archived_at)}</p>
                          <p><strong>Motivo:</strong> {user.archival_reason}</p>
                          <p><strong>Retenção até:</strong> {formatRetentionDate(user.archived_at)}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewMedicalData(user)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Ver Dados ({medicalCount})
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleRestoreUser(user)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restaurar
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja restaurar este usuário? Ele voltará a ter acesso ao sistema
              e todos os seus dados médicos arquivados serão reativados.
              
              {userToRestore && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p><strong>Usuário:</strong> {userToRestore.original_user_data?.email}</p>
                  <p><strong>Função:</strong> {userToRestore.role}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore}>
              Restaurar Usuário
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Medical Data Modal */}
      <Dialog open={showMedicalDataModal} onOpenChange={setShowMedicalDataModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados Médicos Arquivados</DialogTitle>
            <DialogDescription>
              Dados médicos preservados para {selectedUser?.original_user_data?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Usuário:</strong> {selectedUser?.original_user_data?.email}
              </div>
              <div>
                <strong>Função:</strong> {selectedUser?.role}
              </div>
              <div>
                <strong>Arquivado em:</strong> {selectedUser && formatDate(selectedUser.archived_at)}
              </div>
              <div>
                <strong>Retenção até:</strong> {selectedUser && formatRetentionDate(selectedUser.archived_at)}
              </div>
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Os dados médicos são preservados conforme exigências legais e só podem ser 
                permanentemente removidos após 5 anos da data de arquivamento.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMedicalDataModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
