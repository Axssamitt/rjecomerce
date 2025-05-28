
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Package, TrendingUp, Users, Clock, BarChart } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  total_products: number;
  today_page_views: number;
  week_page_views: number;
  month_page_views: number;
  today_product_views: number;
  week_product_views: number;
  month_product_views: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  views: number;
}

interface RecentActivity {
  type: 'page' | 'product';
  path: string;
  product_name?: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas gerais
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .single();

      if (statsError) throw statsError;
      setStats(statsData);

      // Buscar produtos mais visualizados
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('product_views')
        .select(`
          product_id,
          products(name)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      if (topProductsError) throw topProductsError;

      // Agrupar por produto
      const productViewCounts = topProductsData.reduce((acc, view) => {
        const productId = view.product_id;
        const productName = (view.products as any)?.name || 'Produto Desconhecido';
        
        if (!acc[productId]) {
          acc[productId] = { product_id: productId, product_name: productName, views: 0 };
        }
        acc[productId].views++;
        return acc;
      }, {} as Record<number, TopProduct>);

      const sortedProducts = Object.values(productViewCounts)
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      setTopProducts(sortedProducts);

      // Buscar atividade recente
      const [pageViewsResult, productViewsResult] = await Promise.all([
        supabase
          .from('page_views')
          .select('page_path, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('product_views')
          .select(`
            created_at,
            products(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      const activities: RecentActivity[] = [
        ...(pageViewsResult.data || []).map(pv => ({
          type: 'page' as const,
          path: pv.page_path,
          created_at: pv.created_at
        })),
        ...(productViewsResult.data || []).map(pv => ({
          type: 'product' as const,
          path: '',
          product_name: (pv.products as any)?.name || 'Produto Desconhecido',
          created_at: pv.created_at
        }))
      ];

      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentActivity(activities.slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro ao carregar dashboard",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = topProducts.map(product => ({
    name: product.product_name.length > 15 
      ? product.product_name.substring(0, 15) + '...' 
      : product.product_name,
    views: product.views
  }));

  const chartConfig = {
    views: {
      label: "Visualizações",
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gold-text mb-2">Dashboard Administrativo</h2>
        <p className="text-gray-400">Visão geral das métricas e performance da loja</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-dark-600 border-gold-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Produtos</CardTitle>
            <Package className="h-4 w-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gold-text">{stats?.total_products || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-600 border-gold-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Visitas Hoje</CardTitle>
            <Eye className="h-4 w-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gold-text">{stats?.today_page_views || 0}</div>
            <p className="text-xs text-gray-400">
              +{stats?.today_product_views || 0} produtos visualizados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-600 border-gold-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Esta Semana</CardTitle>
            <TrendingUp className="h-4 w-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gold-text">{stats?.week_page_views || 0}</div>
            <p className="text-xs text-gray-400">
              +{stats?.week_product_views || 0} produtos visualizados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-dark-600 border-gold-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Este Mês</CardTitle>
            <BarChart className="h-4 w-4 text-gold-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold gold-text">{stats?.month_page_views || 0}</div>
            <p className="text-xs text-gray-400">
              +{stats?.month_product_views || 0} produtos visualizados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Produtos Mais Visualizados */}
        <Card className="bg-dark-600 border-gold-500">
          <CardHeader>
            <CardTitle className="gold-text">Produtos Mais Visualizados (7 dias)</CardTitle>
            <CardDescription className="text-gray-400">
              Top 5 produtos com mais visualizações na última semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#d1d5db', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: '#d1d5db', fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="views" fill="#d4af37" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="bg-dark-600 border-gold-500">
          <CardHeader>
            <CardTitle className="gold-text">Atividade Recente</CardTitle>
            <CardDescription className="text-gray-400">
              Últimas visualizações de páginas e produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded bg-dark-700">
                    {activity.type === 'page' ? (
                      <Eye className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Package className="h-4 w-4 text-green-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        {activity.type === 'page' 
                          ? `Página: ${activity.path}`
                          : `Produto: ${activity.product_name}`
                        }
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  Nenhuma atividade recente
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Produtos Mais Visualizados */}
      <Card className="bg-dark-600 border-gold-500">
        <CardHeader>
          <CardTitle className="gold-text">Ranking de Produtos</CardTitle>
          <CardDescription className="text-gray-400">
            Produtos ordenados por número de visualizações nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.map((product, index) => (
                <div key={product.product_id} className="flex items-center justify-between p-3 rounded bg-dark-700">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gold-500 text-dark-900 text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-white">{product.product_name}</span>
                  </div>
                  <span className="text-gold-500 font-semibold">{product.views} visualizações</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Nenhum produto visualizado nos últimos 7 dias
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
