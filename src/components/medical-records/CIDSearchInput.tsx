import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchCIDCodes, formatCIDCode, getCIDCategories, getCIDCodesByCategory, type CIDSearchResult } from '@/utils/cid-utils';
import { supabase } from '@/integrations/supabase/client';

interface CIDSearchInputProps {
  value?: string;
  description?: string;
  onSelect: (code: string, description: string) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const CIDSearchInput: React.FC<CIDSearchInputProps> = ({
  value = '',
  description = '',
  onSelect,
  onClear,
  placeholder = 'Buscar CID...',
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cidCodes, setCidCodes] = useState<CIDSearchResult[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<CIDSearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchCIDCodes();
  }, []);

  const filterCodes = () => {
    let filtered = cidCodes;

    if (selectedCategory) {
      filtered = getCIDCodesByCategory(selectedCategory, cidCodes);
    }

    if (searchTerm.trim()) {
      filtered = searchCIDCodes(searchTerm, filtered);
    } else {
      filtered = filtered.slice(0, 20); // Limit initial results
    }

    setFilteredCodes(filtered);
  };

  useEffect(() => {
    filterCodes();
  }, [searchTerm, selectedCategory, cidCodes]);

  const fetchCIDCodes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cid_codes')
        .select('code, description, category')
        .eq('is_active', true)
        .order('code');

      if (error) {
        console.error('Error fetching CID codes:', error);
        // Fallback to local codes if database fails
        setCidCodes(searchCIDCodes(''));
      } else {
        setCidCodes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      // Fallback to local codes
      setCidCodes(searchCIDCodes(''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (code: CIDSearchResult) => {
    onSelect(code.code, code.description);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onClear();
    setSearchTerm('');
  };

  const categories = getCIDCategories(cidCodes);

  const displayValue = value ? formatCIDCode(value, description) : '';

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem] p-3"
            disabled={disabled}
          >
            {displayValue ? (
              <div className="flex items-center justify-between w-full">
                <span className="truncate text-left">{displayValue}</span>
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground">{placeholder}</span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                placeholder="Digite código ou descrição..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                className="border-0 outline-none focus:ring-0"
              />
            </div>
            
            {/* Categories filter */}
            {categories.length > 0 && (
              <div className="p-2 border-b">
                <div className="flex flex-wrap gap-1">
                  <Badge
                    variant={selectedCategory === '' ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedCategory('')}
                  >
                    Todas
                  </Badge>
                  {categories.slice(0, 6).map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                {isLoading ? 'Carregando...' : 'Nenhum código encontrado.'}
              </CommandEmpty>
              
              {filteredCodes.length > 0 && (
                <CommandGroup>
                  {filteredCodes.map((code) => (
                    <CommandItem
                      key={code.code}
                      value={`${code.code} ${code.description}`}
                      onSelect={() => handleSelect(code)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {code.code}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {code.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {code.description}
                          </p>
                        </div>
                        <Check
                          className={cn(
                            "ml-2 h-4 w-4 shrink-0",
                            value === code.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected CID display */}
      {value && description && (
        <div className="mt-2 p-2 bg-blue-50 rounded-md border">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="outline" className="font-mono mb-1">
                {value}
              </Badge>
              <p className="text-sm text-gray-700">{description}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-red-100"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};