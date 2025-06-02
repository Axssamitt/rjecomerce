
import { useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const usePageView = (pagePath: string) => {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await supabase.from('page_views').insert({
          page_path: pagePath,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
      } catch (error) {
        // Falha silenciosa para não afetar a experiência do usuário
        console.log('Analytics error:', error);
      }
    };

    trackPageView();
  }, [pagePath]);
};

export const trackProductView = async (productId: number) => {
  try {
    await supabase.from('product_views').insert({
      product_id: productId,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null
    });
  } catch (error) {
    // Falha silenciosa para não afetar a experiência do usuário
    console.log('Product analytics error:', error);
  }
};
