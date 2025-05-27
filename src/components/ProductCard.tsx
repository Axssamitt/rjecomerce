
import React, { useState } from 'react';
import { Product } from '../types/supabase';
import { AspectRatio } from './ui/aspect-ratio';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <div className="product-card bg-dark-700 rounded-xl shadow-md overflow-hidden transition duration-300 border border-gold-500">
      <AspectRatio ratio={1} className="overflow-hidden">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}
      </AspectRatio>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold gold-text mb-2">{product.name}</h3>
        
        {product.description && (
          <div className="mb-4">
            <p 
              className={`text-gray-300 cursor-pointer transition-all duration-300 ${
                isDescriptionExpanded 
                  ? '' 
                  : 'line-clamp-3 overflow-hidden'
              }`}
              onClick={toggleDescription}
              style={{
                display: '-webkit-box',
                WebkitLineClamp: isDescriptionExpanded ? 'unset' : 3,
                WebkitBoxOrient: 'vertical',
                overflow: isDescriptionExpanded ? 'visible' : 'hidden'
              }}
            >
              {product.description}
            </p>
            {product.description.length > 150 && (
              <button 
                onClick={toggleDescription}
                className="text-gold-500 text-sm mt-1 hover:text-gold-600 transition-colors"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold gold-text">R$ {product.price.toFixed(2)}</span>
          {product.purchase_link && (
            <a 
              href={product.purchase_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 gold-bg text-dark-900 rounded-lg hover:bg-gold-600 transition duration-300"
            >
              Comprar Agora
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
