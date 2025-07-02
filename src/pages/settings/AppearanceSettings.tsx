import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from '@/components/ui/sonner';

export const AppearanceSettings = () => {
  const { settings, updateSettings } = useTheme();

  const handleSavePreferences = () => {
    toast.success("Preferências salvas", {
      description: "Suas configurações de aparência foram salvas com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Aparência</h2>
        <p className="text-gray-500 dark:text-gray-400">Personalize a aparência da interface</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tema</CardTitle>
          <CardDescription>Escolha como você quer que a interface apareça</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                settings.theme === 'light' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => updateSettings({ theme: 'light' })}
            >
              <div className="flex flex-col items-center space-y-2">
                <Sun className="h-8 w-8" />
                <span className="text-sm font-medium">Claro</span>
              </div>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                settings.theme === 'dark' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => updateSettings({ theme: 'dark' })}
            >
              <div className="flex flex-col items-center space-y-2">
                <Moon className="h-8 w-8" />
                <span className="text-sm font-medium">Escuro</span>
              </div>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                settings.theme === 'system' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => updateSettings({ theme: 'system' })}
            >
              <div className="flex flex-col items-center space-y-2">
                <Monitor className="h-8 w-8" />
                <span className="text-sm font-medium">Sistema</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Idioma e região</CardTitle>
          <CardDescription>Configure seu idioma e formatação regional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Idioma da interface</Label>
            <Select value={settings.language} onValueChange={(value) => updateSettings({ language: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                <SelectItem value="en-US">English (United States)</SelectItem>
                <SelectItem value="es-ES">Español (España)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato de data</Label>
            <Select value={settings.dateFormat} onValueChange={(value) => updateSettings({ dateFormat: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/mm/yyyy">DD/MM/AAAA</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/AAAA</SelectItem>
                <SelectItem value="yyyy-mm-dd">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Formato de hora</Label>
            <Select value={settings.timeFormat} onValueChange={(value) => updateSettings({ timeFormat: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24 horas</SelectItem>
                <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipografia</CardTitle>
          <CardDescription>Ajuste o tamanho e estilo do texto</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tamanho da fonte</Label>
            <Select value={settings.fontSize} onValueChange={(value: any) => updateSettings({ fontSize: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Pequeno</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="extra-large">Extra grande</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Fonte com serifa</h4>
              <p className="text-sm text-muted-foreground">
                Use uma fonte com serifa para melhor legibilidade
              </p>
            </div>
            <Switch 
              checked={settings.serifFont}
              onCheckedChange={(checked) => updateSettings({ serifFont: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalização avançada</CardTitle>
          <CardDescription>Opções adicionais de personalização</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Animações reduzidas</h4>
              <p className="text-sm text-muted-foreground">
                Reduzir animações para melhor performance
              </p>
            </div>
            <Switch 
              checked={settings.reducedAnimations}
              onCheckedChange={(checked) => updateSettings({ reducedAnimations: checked })}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Modo compacto</h4>
              <p className="text-sm text-muted-foreground">
                Interface mais densa com menos espaçamento
              </p>
            </div>
            <Switch 
              checked={settings.compactMode}
              onCheckedChange={(checked) => updateSettings({ compactMode: checked })}
            />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Barra lateral sempre visível</h4>
              <p className="text-sm text-muted-foreground">
                Manter a barra lateral aberta em telas grandes
              </p>
            </div>
            <Switch 
              checked={settings.sidebarAlwaysVisible}
              onCheckedChange={(checked) => updateSettings({ sidebarAlwaysVisible: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSavePreferences}>Salvar preferências</Button>
      </div>
    </div>
  );
}; 