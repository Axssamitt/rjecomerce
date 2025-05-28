
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '../integrations/supabase/client';

interface Category {
  id: number;
  name: string;
}

interface CategoryComboboxProps {
  value?: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
}

const CategoryCombobox: React.FC<CategoryComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Selecionar categoria..."
}) => {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      
      setCategories(prev => [...prev, data]);
      onValueChange(data.id);
      setOpen(false);
      setSearchValue('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === value);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = searchValue && 
    !filteredCategories.some(cat => 
      cat.name.toLowerCase() === searchValue.toLowerCase()
    );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-dark-800 border-gold-500 text-white hover:bg-dark-600"
        >
          {selectedCategory ? selectedCategory.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-dark-700 border-gold-500">
        <Command className="bg-dark-700">
          <CommandInput 
            placeholder="Buscar categoria..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty className="text-gray-400 py-6 text-center">
              {loading ? 'Carregando...' : 'Nenhuma categoria encontrada.'}
            </CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onValueChange(category.id === value ? null : category.id);
                    setOpen(false);
                    setSearchValue('');
                  }}
                  className="text-white hover:bg-dark-600"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
              {showCreateOption && (
                <CommandItem
                  onSelect={() => createCategory(searchValue)}
                  className="text-gold-500 hover:bg-dark-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar "{searchValue}"
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CategoryCombobox;
