import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { NotificationService, EmailTemplate } from '@/utils/notification-service';
import { useClinic } from '@/contexts/ClinicContext';
import { Code, Eye, Save, RotateCcw } from 'lucide-react';

interface EmailTemplateEditorProps {
  isOpen: boolean;
  onClose: () => void;
  templateType: string;
  templateTitle: string;
  templateDescription: string;
}

const DEFAULT_TEMPLATES = {
  appointment_confirmation: {
    subject: 'Confirmação de Agendamento - {{clinic_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">Agendamento Confirmado</h2>
        
        <p>Olá <strong>{{patient_name}}</strong>,</p>
        
        <p>Seu agendamento foi confirmado com sucesso!</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e293b;">Detalhes do Agendamento</h3>
          <p><strong>Clínica:</strong> {{clinic_name}}</p>
          <p><strong>Médico:</strong> {{doctor_name}}</p>
          <p><strong>Data:</strong> {{appointment_date}}</p>
          <p><strong>Horário:</strong> {{appointment_time}}</p>
          <p><strong>Tipo:</strong> {{appointment_type}}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Importante:</strong> Chegue com 15 minutos de antecedência.</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h4 style="color: #1e293b;">Contato da Clínica</h4>
          <p>Telefone: {{clinic_phone}}</p>
          <p>Email: {{clinic_email}}</p>
          <p>Endereço: {{clinic_address}}</p>
        </div>
        
        <p style="margin-top: 30px; color: #64748b;">
          Atenciosamente,<br>
          Equipe {{clinic_name}}
        </p>
      </div>
    `,
    text_content: `Agendamento Confirmado

Olá {{patient_name}},

Seu agendamento foi confirmado com sucesso!

Detalhes do Agendamento:
- Clínica: {{clinic_name}}
- Médico: {{doctor_name}}
- Data: {{appointment_date}}
- Horário: {{appointment_time}}
- Tipo: {{appointment_type}}

Importante: Chegue com 15 minutos de antecedência.

Contato da Clínica:
Telefone: {{clinic_phone}}
Email: {{clinic_email}}
Endereço: {{clinic_address}}

Atenciosamente,
Equipe {{clinic_name}}`,
    variables: ['patient_name', 'clinic_name', 'doctor_name', 'appointment_date', 'appointment_time', 'appointment_type', 'clinic_phone', 'clinic_email', 'clinic_address']
  },
  appointment_reminder: {
    subject: 'Lembrete de Consulta - {{clinic_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">🔔 Lembrete de Consulta</h2>
        
        <p>Olá <strong>{{patient_name}}</strong>,</p>
        
        <p>Este é um lembrete de que você tem uma consulta agendada para <strong>amanhã</strong>.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Detalhes da Consulta</h3>
          <p><strong>Clínica:</strong> {{clinic_name}}</p>
          <p><strong>Médico:</strong> {{doctor_name}}</p>
          <p><strong>Data:</strong> {{appointment_date}}</p>
          <p><strong>Horário:</strong> {{appointment_time}}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Lembre-se:</strong> Chegue com 15 minutos de antecedência e traga seus documentos.</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h4 style="color: #1e293b;">Precisa remarcar?</h4>
          <p>Entre em contato conosco:</p>
          <p>Telefone: {{clinic_phone}}</p>
          <p>Email: {{clinic_email}}</p>
        </div>
        
        <p style="margin-top: 30px; color: #64748b;">
          Atenciosamente,<br>
          Equipe {{clinic_name}}
        </p>
      </div>
    `,
    text_content: `🔔 Lembrete de Consulta

Olá {{patient_name}},

Este é um lembrete de que você tem uma consulta agendada para amanhã.

Detalhes da Consulta:
- Clínica: {{clinic_name}}
- Médico: {{doctor_name}}
- Data: {{appointment_date}}
- Horário: {{appointment_time}}

Lembre-se: Chegue com 15 minutos de antecedência e traga seus documentos.

Precisa remarcar?
Entre em contato conosco:
Telefone: {{clinic_phone}}
Email: {{clinic_email}}

Atenciosamente,
Equipe {{clinic_name}}`,
    variables: ['patient_name', 'clinic_name', 'doctor_name', 'appointment_date', 'appointment_time', 'clinic_phone', 'clinic_email']
  },
  appointment_cancellation: {
    subject: 'Cancelamento de Consulta - {{clinic_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626; margin-bottom: 20px;">Consulta Cancelada</h2>
        
        <p>Olá <strong>{{patient_name}}</strong>,</p>
        
        <p>Informamos que sua consulta foi cancelada.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #dc2626;">Consulta Cancelada</h3>
          <p><strong>Clínica:</strong> {{clinic_name}}</p>
          <p><strong>Médico:</strong> {{doctor_name}}</p>
          <p><strong>Data:</strong> {{appointment_date}}</p>
          <p><strong>Horário:</strong> {{appointment_time}}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #0369a1;">Precisa reagendar?</h4>
          <p>Entre em contato conosco para agendar uma nova consulta:</p>
          <p>Telefone: {{clinic_phone}}</p>
          <p>Email: {{clinic_email}}</p>
        </div>
        
        <p style="margin-top: 30px; color: #64748b;">
          Pedimos desculpas por qualquer inconveniente.<br><br>
          Atenciosamente,<br>
          Equipe {{clinic_name}}
        </p>
      </div>
    `,
    text_content: `Consulta Cancelada

Olá {{patient_name}},

Informamos que sua consulta foi cancelada.

Consulta Cancelada:
- Clínica: {{clinic_name}}
- Médico: {{doctor_name}}
- Data: {{appointment_date}}
- Horário: {{appointment_time}}

Precisa reagendar?
Entre em contato conosco para agendar uma nova consulta:
Telefone: {{clinic_phone}}
Email: {{clinic_email}}

Pedimos desculpas por qualquer inconveniente.

Atenciosamente,
Equipe {{clinic_name}}`,
    variables: ['patient_name', 'clinic_name', 'doctor_name', 'appointment_date', 'appointment_time', 'clinic_phone', 'clinic_email']
  },
  appointment_reschedule: {
    subject: 'Reagendamento de Consulta - {{clinic_name}}',
    html_content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0369a1; margin-bottom: 20px;">Consulta Reagendada</h2>
        
        <p>Olá <strong>{{patient_name}}</strong>,</p>
        
        <p>Sua consulta foi reagendada com sucesso!</p>
        
        <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #0369a1;">Novos Detalhes da Consulta</h3>
          <p><strong>Clínica:</strong> {{clinic_name}}</p>
          <p><strong>Médico:</strong> {{doctor_name}}</p>
          <p><strong>Nova Data:</strong> {{appointment_date}}</p>
          <p><strong>Novo Horário:</strong> {{appointment_time}}</p>
          <p><strong>Tipo:</strong> {{appointment_type}}</p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Importante:</strong> Chegue com 15 minutos de antecedência.</p>
        </div>
        
        <div style="margin-top: 30px;">
          <h4 style="color: #1e293b;">Contato da Clínica</h4>
          <p>Telefone: {{clinic_phone}}</p>
          <p>Email: {{clinic_email}}</p>
          <p>Endereço: {{clinic_address}}</p>
        </div>
        
        <p style="margin-top: 30px; color: #64748b;">
          Atenciosamente,<br>
          Equipe {{clinic_name}}
        </p>
      </div>
    `,
    text_content: `Consulta Reagendada

Olá {{patient_name}},

Sua consulta foi reagendada com sucesso!

Novos Detalhes da Consulta:
- Clínica: {{clinic_name}}
- Médico: {{doctor_name}}
- Nova Data: {{appointment_date}}
- Novo Horário: {{appointment_time}}
- Tipo: {{appointment_type}}

Importante: Chegue com 15 minutos de antecedência.

Contato da Clínica:
Telefone: {{clinic_phone}}
Email: {{clinic_email}}
Endereço: {{clinic_address}}

Atenciosamente,
Equipe {{clinic_name}}`,
    variables: ['patient_name', 'clinic_name', 'doctor_name', 'appointment_date', 'appointment_time', 'appointment_type', 'clinic_phone', 'clinic_email', 'clinic_address']
  }
};

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  isOpen,
  onClose,
  templateType,
  templateTitle,
  templateDescription
}) => {
  const { activeClinic } = useClinic();
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('edit');

  useEffect(() => {
    if (isOpen && activeClinic) {
      loadTemplate();
    }
  }, [isOpen, activeClinic, templateType]);

  const loadTemplate = async () => {
    if (!activeClinic) return;

    try {
      const existingTemplate = await NotificationService.getEmailTemplate(activeClinic.id, templateType);
      
      if (existingTemplate) {
        setTemplate(existingTemplate);
      } else {
        // Use default template
        const defaultTemplate = DEFAULT_TEMPLATES[templateType as keyof typeof DEFAULT_TEMPLATES];
        if (defaultTemplate) {
          setTemplate({
            clinic_id: activeClinic.id,
            template_type: templateType as any,
            subject: defaultTemplate.subject,
            html_content: defaultTemplate.html_content,
            text_content: defaultTemplate.text_content,
            variables: defaultTemplate.variables,
            is_active: true
          });
        }
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast.error('Erro ao carregar template');
    }
  };

  const handleSave = async () => {
    if (!template || !activeClinic) return;

    setLoading(true);
    try {
      await NotificationService.saveEmailTemplate(template);
      toast.success('Template salvo com sucesso!');
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const defaultTemplate = DEFAULT_TEMPLATES[templateType as keyof typeof DEFAULT_TEMPLATES];
    if (defaultTemplate && activeClinic) {
      setTemplate({
        clinic_id: activeClinic.id,
        template_type: templateType as any,
        subject: defaultTemplate.subject,
        html_content: defaultTemplate.html_content,
        text_content: defaultTemplate.text_content,
        variables: defaultTemplate.variables,
        is_active: true
      });
      toast.success('Template resetado para o padrão');
    }
  };

  const handleInputChange = (field: keyof EmailTemplate, value: string) => {
    if (!template) return;
    
    setTemplate({
      ...template,
      [field]: value
    });
  };

  const renderPreview = () => {
    if (!template) return null;

    // Create sample data for preview
    const sampleData = {
      patient_name: 'João Silva',
      clinic_name: activeClinic?.name || 'Clínica Exemplo',
      doctor_name: 'Dr. Maria Santos',
      appointment_date: '15/01/2024',
      appointment_time: '14:30',
      appointment_type: 'Presencial',
      clinic_phone: '(11) 99999-9999',
      clinic_email: 'contato@clinica.com',
      clinic_address: 'Rua das Flores, 123 - Centro'
    };

    let previewContent = template.html_content;
    Object.entries(sampleData).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return (
      <div className="border rounded-lg p-4 bg-white">
        <div dangerouslySetInnerHTML={{ __html: previewContent }} />
      </div>
    );
  };

  if (!template) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Editar Template: {templateTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Editar</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
              <TabsTrigger value="variables">Variáveis</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="flex-1 overflow-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto do Email</Label>
                <Input
                  id="subject"
                  value={template.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Digite o assunto do email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="html_content">Conteúdo HTML</Label>
                <Textarea
                  id="html_content"
                  value={template.html_content}
                  onChange={(e) => handleInputChange('html_content', e.target.value)}
                  placeholder="Digite o conteúdo HTML do email"
                  className="min-h-[300px] font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="text_content">Conteúdo Texto (alternativo)</Label>
                <Textarea
                  id="text_content"
                  value={template.text_content || ''}
                  onChange={(e) => handleInputChange('text_content', e.target.value)}
                  placeholder="Digite o conteúdo em texto simples (opcional)"
                  className="min-h-[150px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-auto">
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">Assunto:</h4>
                  <p className="text-sm">{template.subject.replace(/{{(\w+)}}/g, (match, key) => {
                    const sampleData: Record<string, string> = {
                      patient_name: 'João Silva',
                      clinic_name: activeClinic?.name || 'Clínica Exemplo',
                      doctor_name: 'Dr. Maria Santos'
                    };
                    return sampleData[key] || match;
                  })}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Conteúdo:</h4>
                  {renderPreview()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="variables" className="flex-1 overflow-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Variáveis Disponíveis</CardTitle>
                  <CardDescription>
                    Use estas variáveis em seu template. Elas serão substituídas pelos valores reais quando o email for enviado.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {template.variables.map((variable) => (
                      <div key={variable} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {`{{${variable}}}`}
                          </code>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Como usar:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Digite <code>{`{{nome_da_variavel}}`}</code> no seu template</li>
                      <li>• As variáveis são substituídas automaticamente</li>
                      <li>• Use tanto no assunto quanto no conteúdo</li>
                      <li>• Variáveis não encontradas aparecerão como texto normal</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar para Padrão
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Template'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};