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
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Rastrear visualização da página da loja
  usePageView('/');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (error) {
          throw error;
        }

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

  const clearFilter = () => {
    setSelectedCategory(null);
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
      <h1 className="text-3xl font-bold mb-8 text-center gold-text">Nossos Produtos</h1>
      
      {/* Filtro de Categorias */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="w-full sm:w-80">
          <CategoryFilter
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            placeholder="Filtrar por categoria..."
          />
        </div>
        {selectedCategory && (
          <button
            onClick={clearFilter}
            className="px-4 py-2 text-sm text-gold-500 border border-gold-500 rounded-md hover:bg-gold-500 hover:text-dark-900 transition-colors"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-xl">
            {selectedCategory 
              ? "Nenhum produto encontrado nesta categoria." 
              : "Nenhum produto disponível no momento."
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
