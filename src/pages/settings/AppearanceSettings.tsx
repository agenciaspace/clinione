import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Monitor } from 'lucide-react';

export const AppearanceSettings = () => {
  const [theme, setTheme] = useState('light');
  const [language, setLanguage] = useState('pt-BR');
  const [fontSize, setFontSize] = useState('medium');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Aparência</h2>
        <p className="text-gray-500">Personalize a aparência da interface</p>
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
                theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setTheme('light')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Sun className="h-8 w-8" />
                <span className="text-sm font-medium">Claro</span>
              </div>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setTheme('dark')}
            >
              <div className="flex flex-col items-center space-y-2">
                <Moon className="h-8 w-8" />
                <span className="text-sm font-medium">Escuro</span>
              </div>
            </div>
            
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setTheme('system')}
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
            <Select value={language} onValueChange={setLanguage}>
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
            <Select defaultValue="dd/mm/yyyy">
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
            <Select defaultValue="24h">
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
            <Select value={fontSize} onValueChange={setFontSize}>
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
            <Switch />
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
            <Switch />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Modo compacto</h4>
              <p className="text-sm text-muted-foreground">
                Interface mais densa com menos espaçamento
              </p>
            </div>
            <Switch />
          </div>
          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Barra lateral sempre visível</h4>
              <p className="text-sm text-muted-foreground">
                Manter a barra lateral aberta em telas grandes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Salvar preferências</Button>
      </div>
    </div>
  );
}; 