import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, DollarSign, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useAdminData } from '@/contexts/AdminDataContext';

const SalesHistory = () => {
  const [salesData, setSalesData] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    topProduct: null
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getCachedData, setCachedData, setLoading: setCacheLoading } = useAdminData();

  useEffect(() => {
    fetchSalesData();
    fetchStats();
  }, []);

  const fetchSalesData = async () => {
    // Check cache first
    const cachedSalesData = getCachedData('salesData');
    if (cachedSalesData) {
      setSalesData(cachedSalesData);
      setLoading(false);
      return;
    }

    setCacheLoading('salesData', true);
    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('your_project_url');

      if (!isConfigured) {
        // Mock sales data
        setSalesData([]);
        setCachedData('salesData', []);
        setLoading(false);
        return;
      }

      // Query order_items with product details instead of sales_history
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            price
          ),
          orders (
            created_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSalesData(data || []);
      setCachedData('salesData', data || []);
    } catch (error) {
      toast({
        title: 'Error loading sales data',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setCacheLoading('salesData', false);
    }
  };

  const fetchStats = async () => {
    // Check cache first
    const cachedStats = getCachedData('stats');
    if (cachedStats) {
      setStats(cachedStats);
      return;
    }

    setCacheLoading('stats', true);
    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('your_project_url');

      if (!isConfigured) {
        const mockStats = {
          totalRevenue: 70.50,
          totalOrders: 2,
          topProduct: { name: "Bread", quantity: 2 }
        };
        setStats(mockStats);
        setCachedData('stats', mockStats);
        return;
      }

      // Get total orders and revenue
      const { data: orders } = await supabase
        .from('orders')
        .select('total_price');

      const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_price), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Get top product
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products (
            name
          )
        `);

      const productSales = {};
      orderItems?.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            name: item.products?.name,
            quantity: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity;
      });

      const topProduct = Object.values(productSales).sort((a, b) => b.quantity - a.quantity)[0];

      const statsData = {
        totalRevenue,
        totalOrders,
        topProduct
      };
      setStats(statsData);
      setCachedData('stats', statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setCacheLoading('stats', false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold">Rs.{stats.totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Total Orders</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-80">Top Product</span>
          </div>
          <p className="text-lg font-bold truncate">
            {stats.topProduct?.name || 'N/A'}
          </p>
          {stats.topProduct && (
            <p className="text-sm opacity-80">{stats.topProduct.quantity} sold</p>
          )}
        </div>
      </div>

      {/* Sales History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sales History</h2>

        {salesData.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">No sales data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantity Sold</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((sale) => (
                  <tr key={sale.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                      {sale.products?.name || 'Unknown Product'}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {sale.quantity} units
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      Rs.{parseFloat(sale.price_at_purchase).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(sale.orders?.created_at || sale.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesHistory;