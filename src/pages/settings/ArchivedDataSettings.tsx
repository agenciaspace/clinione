import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArchivedUsersManager } from '@/components/admin/ArchivedUsersManager';
import { Archive, Shield, Clock, FileText } from 'lucide-react';

export const ArchivedDataSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dados Arquivados</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie usuários arquivados e dados médicos preservados para conformidade legal
        </p>
      </div>

      {/* Legal Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Conformidade Legal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Prontuários Médicos</p>
                <p className="text-blue-700">Devem ser preservados por 5 anos conforme CFM</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Archive className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Arquivamento Seguro</p>
                <p className="text-blue-700">Dados protegidos mesmo após remoção do usuário</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">Remoção Automática</p>
                <p className="text-blue-700">Dados removidos após período legal obrigatório</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Arquivamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <h4 className="font-medium">Remoção do Usuário</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Usuário é removido do sistema por admin/owner
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <h4 className="font-medium">Arquivamento Automático</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Todos os dados médicos são automaticamente arquivados
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <h4 className="font-medium">Preservação Legal</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Dados mantidos por 5 anos para conformidade
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  4
                </div>
                <h4 className="font-medium">Remoção Final</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Dados removidos permanentemente após prazo legal
                </p>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Dados Preservados no Arquivamento:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Prontuários médicos e consultas</li>
                <li>Informações do usuário (nome, email, função)</li>
                <li>Dados de pacientes associados</li>
                <li>Histórico de auditoria</li>
                <li>Metadados de criação e modificação</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archived Users Manager */}
      <ArchivedUsersManager />
    </div>
  );
};