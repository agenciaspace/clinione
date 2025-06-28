import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsListWithMobileSupport, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  User, 
  Lock, 
  Bell, 
  PaintBucket, 
  Languages, 
  Clock, 
  KeyRound, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Shield,
  CreditCard,
  Trash2,
  MessageSquare,
  Server,
  Webhook
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import WebhookSettings from '@/components/settings/WebhookSettings';
import { UserPhotoUpload } from '@/components/settings/UserPhotoUpload';
import { ProfileSettings } from '@/pages/settings/ProfileSettings';
import { SecuritySettings } from '@/pages/settings/SecuritySettings';
import { NotificationsSettings } from '@/pages/settings/NotificationsSettings';
import { AppearanceSettings } from '@/pages/settings/AppearanceSettings';
import { EmailSettings } from '@/pages/settings/EmailSettings';
import { WebhooksSettings } from '@/pages/settings/WebhooksSettings';

const Settings = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('profile');

  const settingsTabs = [
    {
      id: 'profile',
      label: isMobile ? 'Perfil' : 'Perfil',
      icon: User,
      component: ProfileSettings
    },
    {
      id: 'security',
      label: isMobile ? 'Segurança' : 'Segurança',
      icon: Shield,
      component: SecuritySettings
    },
    {
      id: 'notifications',
      label: isMobile ? 'Notif.' : 'Notificações',
      icon: Bell,
      component: NotificationsSettings
    },
    {
      id: 'appearance',
      label: isMobile ? 'Tema' : 'Aparência',
      icon: PaintBucket,
      component: AppearanceSettings
    },
    {
      id: 'email',
      label: 'Email',
      icon: Mail,
      component: EmailSettings
    },
    {
      id: 'webhooks',
      label: isMobile ? 'Hooks' : 'Webhooks',
      icon: Webhook,
      component: WebhooksSettings
    }
  ];

  const ActiveComponent = settingsTabs.find(tab => tab.id === activeTab)?.component || ProfileSettings;

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <div className="px-1">
            <TabsListWithMobileSupport 
              className={`${
                isMobile 
                  ? 'w-full justify-start overflow-x-auto' 
                  : 'grid w-full grid-cols-6'
              }`}
              showScrollButtons={isMobile}
            >
              {settingsTabs.map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className={`${
                    isMobile 
                      ? 'flex-shrink-0 min-w-[80px] text-xs px-2 py-2' 
                      : 'flex items-center justify-center space-x-2 text-sm'
                  }`}
                >
                  <tab.icon className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  {!isMobile && <span>{tab.label}</span>}
                  {isMobile && <span className="ml-1">{tab.label}</span>}
                </TabsTrigger>
              ))}
            </TabsListWithMobileSupport>
          </div>

          <div className="px-1">
            {settingsTabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4 sm:space-y-6">
                <div className="max-w-4xl">
                  <tab.component />
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
