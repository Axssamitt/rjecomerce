
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImage?: string;
  onImageRemoved?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageUploaded, 
  currentImage, 
  onImageRemoved 
}) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onImageUploaded(data.publicUrl);
      
      toast({
        title: "Sucesso",
        description: "Imagem enviada com sucesso!",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    if (onImageRemoved) {
      onImageRemoved();
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt="Product preview" 
            className="w-32 h-32 object-cover rounded-lg border border-gold-500"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 border-2 border-dashed border-gold-500 rounded-lg flex items-center justify-center">
          <ImageIcon size={24} className="text-gold-500" />
        </div>
      )}
      
      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={uploadImage}
          disabled={uploading}
          className="hidden"
        />
        <div className="flex items-center justify-center px-4 py-2 border border-gold-500 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors">
          <Upload size={16} className="mr-2" />
          {uploading ? 'Enviando...' : 'Escolher Imagem'}
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;
