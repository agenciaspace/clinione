import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, MapPin, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  name: string;
  address: string;
  phone: string;
  is_primary: boolean;
}

interface DoctorAddressesProps {
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
  doctorName: string;
}

export function DoctorAddresses({ addresses, onChange, doctorName }: DoctorAddressesProps) {
  const [newAddress, setNewAddress] = useState<Address>({
    name: '',
    address: '',
    phone: '',
    is_primary: false
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.address) {
      toast.error('Por favor, preencha o nome e endereço');
      return;
    }

    // Se este for o primeiro endereço ou marcado como principal, desmarque outros
    let updatedAddresses = [...addresses];
    if (newAddress.is_primary || addresses.length === 0) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, is_primary: false }));
      newAddress.is_primary = true;
    }

    onChange([...updatedAddresses, newAddress]);
    setNewAddress({
      name: '',
      address: '',
      phone: '',
      is_primary: false
    });
    setIsAdding(false);
    toast.success('Endereço adicionado com sucesso');
  };

  const handleRemoveAddress = (index: number) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    
    // Se removemos o endereço principal e ainda há endereços, marque o primeiro como principal
    if (addresses[index].is_primary && updatedAddresses.length > 0) {
      updatedAddresses[0].is_primary = true;
    }
    
    onChange(updatedAddresses);
    toast.success('Endereço removido');
  };

  const handleSetPrimary = (index: number) => {
    const updatedAddresses = addresses.map((addr, i) => ({
      ...addr,
      is_primary: i === index
    }));
    onChange(updatedAddresses);
    toast.success('Endereço principal atualizado');
  };

  const handleUpdateAddress = (index: number, field: keyof Address, value: string | boolean) => {
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = {
      ...updatedAddresses[index],
      [field]: value
    };
    onChange(updatedAddresses);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereços de Atendimento
          </span>
          <Button
            type="button"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum endereço cadastrado. Clique em "Adicionar" para incluir um endereço.
          </p>
        )}

        {/* Lista de endereços existentes */}
        {addresses.map((address, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    value={address.name}
                    onChange={(e) => handleUpdateAddress(index, 'name', e.target.value)}
                    placeholder="Nome do local"
                    className="font-medium"
                  />
                  {address.is_primary && (
                    <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      <Star className="h-3 w-3" />
                      Principal
                    </span>
                  )}
                </div>
                <Input
                  value={address.address}
                  onChange={(e) => handleUpdateAddress(index, 'address', e.target.value)}
                  placeholder="Endereço completo"
                  className="text-sm"
                />
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    value={address.phone}
                    onChange={(e) => handleUpdateAddress(index, 'phone', e.target.value)}
                    placeholder="Telefone (opcional)"
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                {!address.is_primary && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(index)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAddress(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Formulário para adicionar novo endereço */}
        {isAdding && (
          <div className="border-2 border-dashed rounded-lg p-4 space-y-3 bg-muted/50">
            <h4 className="font-medium text-sm">Novo Endereço</h4>
            <div className="space-y-2">
              <div>
                <Label htmlFor="new-name">Nome do Local *</Label>
                <Input
                  id="new-name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  placeholder="Ex: Consultório Principal, Hospital São José"
                />
              </div>
              <div>
                <Label htmlFor="new-address">Endereço *</Label>
                <Input
                  id="new-address"
                  value={newAddress.address}
                  onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                  placeholder="Rua, número, bairro, cidade/estado"
                />
              </div>
              <div>
                <Label htmlFor="new-phone">Telefone</Label>
                <Input
                  id="new-phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="(11) 1234-5678"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="new-primary"
                  checked={newAddress.is_primary || addresses.length === 0}
                  onCheckedChange={(checked) => setNewAddress({ ...newAddress, is_primary: checked })}
                  disabled={addresses.length === 0}
                />
                <Label htmlFor="new-primary">
                  Definir como endereço principal
                </Label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={handleAddAddress}
              >
                Salvar Endereço
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewAddress({
                    name: '',
                    address: '',
                    phone: '',
                    is_primary: false
                  });
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {addresses.length > 0 && (
          <p className="text-xs text-muted-foreground">
            * O endereço principal será exibido por padrão nos agendamentos
          </p>
        )}
      </CardContent>
    </Card>
  );
} 