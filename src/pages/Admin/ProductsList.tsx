
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { Product } from '../../types/supabase';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente mais tarde.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold gold-text">Gerenciar Produtos</h2>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center p-8 bg-dark-700 rounded-lg border border-gold-500">
          <p className="text-gray-300 mb-4">Nenhum produto cadastrado.</p>
          <Link 
            to="/admin/add-product" 
            className="px-4 py-2 gold-bg text-dark-900 rounded-lg hover:bg-gold-600 transition duration-300"
          >
            Adicionar Primeiro Produto
          </Link>
        </div>
      ) : (
        <div className="bg-dark-700 rounded-lg border border-gold-500 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-gold-500">
                <TableHead className="text-gold-500 font-medium">Ações</TableHead>
                <TableHead className="text-gold-500 font-medium">Imagem</TableHead>
                <TableHead className="text-gold-500 font-medium">Nome</TableHead>
                <TableHead className="text-gold-500 font-medium">Preço</TableHead>
                <TableHead className="text-gold-500 font-medium">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-gold-500 hover:bg-dark-600">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                        className="h-8 w-8 text-gold-500 hover:text-gold-600 hover:bg-dark-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-dark-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-dark-700 border border-gold-500">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-dark-600 border-gold-500 text-white hover:bg-dark-500">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex-shrink-0 h-10 w-10">
                      {product.image_url ? (
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={product.image_url} 
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Sem imagem</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-white">{product.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm gold-text">R$ {product.price.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-300 truncate max-w-xs">
                      {product.purchase_link || 'N/A'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ProductsList;
