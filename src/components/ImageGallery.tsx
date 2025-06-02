
import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2 } from 'lucide-react';

interface ImageGalleryProps {
  onImageSelected: (url: string) => void;
  selectedImage?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onImageSelected, selectedImage }) => {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('products', {
          limit: 50,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      const imageUrls = data
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .map(file => {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`products/${file.name}`);
          return urlData.publicUrl;
        });

      setImages(imageUrls);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Erro ao carregar imagens",
        description: "Não foi possível carregar as imagens salvas.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        <span className="ml-2 text-gold-500">Carregando imagens...</span>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center text-gray-400 p-4">
        <p>Nenhuma imagem salva encontrada.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gold-500">Imagens Salvas</h4>
      <div className="grid grid-cols-3 gap-4 max-h-60 overflow-y-auto">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative cursor-pointer group"
            onClick={() => onImageSelected(imageUrl)}
          >
            <img
              src={imageUrl}
              alt={`Saved image ${index + 1}`}
              className={`w-full h-20 object-cover rounded-lg border-2 transition-all ${
                selectedImage === imageUrl
                  ? 'border-gold-500 ring-2 ring-gold-500 ring-opacity-50'
                  : 'border-gray-300 hover:border-gold-500'
              }`}
            />
            {selectedImage === imageUrl && (
              <div className="absolute inset-0 bg-gold-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                <Check className="h-6 w-6 text-gold-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
