
import React, { useState } from 'react';
import { Product } from '../types/supabase';
import { AspectRatio } from './ui/aspect-ratio';
import { useIsMobile } from '../hooks/use-mobile';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const isMobile = useIsMobile();

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
            <span className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>Sem imagem</span>
          </div>
        )}
      </AspectRatio>
      
      <div className={`${isMobile ? 'p-2' : 'p-6'}`}>
        <h3 className={`font-semibold gold-text mb-2 ${isMobile ? 'text-sm' : 'text-xl'}`}>
          {product.name}
        </h3>
        
        {product.description && (
          <div className={`${isMobile ? 'mb-2' : 'mb-4'}`}>
            <p 
              className={`text-gray-300 cursor-pointer transition-all duration-300 ${
                isMobile ? 'text-xs leading-tight' : 'text-sm'
              } ${
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
            {product.description.length > (isMobile ? 100 : 150) && (
              <button 
                onClick={toggleDescription}
                className={`text-gold-500 mt-1 hover:text-gold-600 transition-colors ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver mais'}
              </button>
            )}
          </div>
        )}
        
        <div className={`flex ${isMobile ? 'flex-col gap-1' : 'justify-between items-center'}`}>
          <span className={`font-bold gold-text ${isMobile ? 'text-lg' : 'text-2xl'}`}>
            R$ {product.price.toFixed(2)}
          </span>
          {product.purchase_link && (
            <a 
              href={product.purchase_link} 
              target="_blank" 
              rel="noopener noreferrer"
              className={`gold-bg text-dark-900 rounded-lg hover:bg-gold-600 transition duration-300 text-center ${
                isMobile ? 'px-2 py-1 text-xs mt-1' : 'px-4 py-2'
              }`}
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
