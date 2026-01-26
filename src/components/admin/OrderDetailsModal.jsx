import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const OrderDetailsModal = ({ order, onClose }) => {
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderItems();
  }, [order.id]);

  const fetchOrderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          products (
            name,
            image_url
          )
        `)
        .eq('order_id', order.id);

      if (error) throw error;
      setOrderItems(data || []);
    } catch (error) {
      toast({
        title: 'Error loading order items',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* Order Info */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
              <p className="font-mono font-medium text-gray-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-medium capitalize text-gray-900 dark:text-white">{order.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{order.customer_email}</p>
            </div>
            {order.customer_phone && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.customer_phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
              <p className="font-medium text-gray-900 dark:text-white">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            {order.delivery_address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Address</p>
                <p className="font-medium text-gray-900 dark:text-white">{order.delivery_address}</p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Order Items</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.products?.name || 'Product'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Quantity: {item.quantity} × Rs.{parseFloat(item.price_at_purchase).toFixed(2)}
                      </p>
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Rs.{(item.quantity * parseFloat(item.price_at_purchase)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total */}
          <div className="border-t dark:border-slate-700 pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-amber-600 dark:text-amber-500">Rs.{parseFloat(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;