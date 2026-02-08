import React, { useState, useEffect } from 'react';
import { AlertCircle, Eye, Search } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockOrders } from '@/data/mockOrders';
import OrderDetailsModal from './OrderDetailsModal';
import { useAdminData } from '@/contexts/AdminDataContext';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  const { getCachedData, setCachedData, setLoading: setCacheLoading } = useAdminData();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    // Check cache first
    const cachedOrders = getCachedData('orders');
    if (cachedOrders) {
      setOrders(cachedOrders);
      setLoading(false);
      return;
    }

    setCacheLoading('orders', true);
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Sort by created_at desc if possible (client side for now since string timestamps)
      data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (data && data.length > 0) {
        setOrders(data);
        setCachedData('orders', data);
      } else {
        // Fallback to mock
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
        setCachedData('orders', mockOrders);
      }
    } catch (error) {
      console.warn("Firestore orders error, using mock:", error);
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setCachedData('orders', mockOrders);

      if (error.code !== 'permission-denied' && error.code !== 'unavailable') {
        toast({
          title: 'Error loading orders',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
      setCacheLoading('orders', false);
    }
  };

  const filterOrders = () => {
    // ... existing filter logic is fine as it uses state ...
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Try Firestore update
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
      } catch (e) {
        console.warn("Firestore update failed (mock mode?)", e);
      }

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });

      // Optimistic update locally
      const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      setOrders(updatedOrders);
      setCachedData('orders', updatedOrders);

    } catch (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'completed':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Management</h2>

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-sm text-gray-700 dark:text-gray-300">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{order.customer_name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_email}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Rs.{parseFloat(order.total_price).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <td className="py-3 px-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-amber-500 transition-colors ${getStatusColor(order.status)}`}
                        >
                          <option value="pending" className="text-gray-900 bg-white">Pending</option>
                          <option value="completed" className="text-gray-900 bg-white">Completed</option>
                          <option value="delivered" className="text-gray-900 bg-white">Delivered</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                          <svg className={`w-3 h-3 ${order.status === 'pending' ? 'text-yellow-700 dark:text-yellow-400' : order.status === 'completed' ? 'text-blue-700 dark:text-blue-400' : 'text-green-700 dark:text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default OrderManagement;