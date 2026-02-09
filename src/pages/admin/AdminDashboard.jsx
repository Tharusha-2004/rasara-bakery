import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Package, BarChart3, ShoppingCart, TrendingUp } from 'lucide-react';
import { AdminDataProvider } from '@/contexts/AdminDataContext';
import ProductManagement from '@/components/admin/ProductManagement';
import StockManagement from '@/components/admin/StockManagement';
import OrderManagement from '@/components/admin/OrderManagement';
import SalesHistory from '@/components/admin/SalesHistory';
import ConnectionStatus from '@/components/admin/ConnectionStatus';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');

  const tabs = [
    { id: 'products', label: 'Products', icon: Package },
    { id: 'stock', label: 'Stock', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'sales', label: 'Sales', icon: TrendingUp }
  ];

  return (
    <AdminDataProvider>
      <Helmet>
        <title>Admin Dashboard - Rasara Bakery</title>
        <meta name="description" content="Manage your bakery" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your bakery products, orders, and sales</p>
            </motion.div>

            <ConnectionStatus />
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg mb-6 p-2">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content - Render all but only show active */}
          <div>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{ display: activeTab === 'products' ? 'block' : 'none' }}
            >
              <ProductManagement />
            </motion.div>

            <motion.div
              style={{ display: activeTab === 'stock' ? 'block' : 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === 'stock' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <StockManagement />
            </motion.div>

            <motion.div
              style={{ display: activeTab === 'orders' ? 'block' : 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === 'orders' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <OrderManagement />
            </motion.div>

            <motion.div
              style={{ display: activeTab === 'sales' ? 'block' : 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: activeTab === 'sales' ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SalesHistory />
            </motion.div>
          </div>
        </div>
      </div>
    </AdminDataProvider>
  );
};

export default AdminDashboard;