
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Product } from '../types/supabase';
import { useToast } from '@/hooks/use-toast';
import { usePageView } from '../hooks/useAnalytics';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Rastrear visualização da página da loja
  usePageView('/');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('Fetching products...');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          throw error;
        }

        console.log('Products fetched:', data);
        setProducts(data || []);
        setFilteredProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos. Tente novamente mais tarde.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === null) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => product.category_id === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with title and category filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold gold-text">Nossos Produtos</h1>
        <div className="w-full md:w-64">
          <CategoryFilter
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            placeholder="Filtrar por categoria..."
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">
            {selectedCategory === null 
              ? "Nenhum produto disponível no momento." 
              : "Nenhum produto encontrado nesta categoria."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;
