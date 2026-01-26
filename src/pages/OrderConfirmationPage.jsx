import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    navigate('/');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Order Confirmed - Rasara Bakery</title>
        <meta name="description" content="Your order has been confirmed" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto px-4"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            </motion.div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Order Confirmed!
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Thank you for your order! We've received your request and will start preparing it shortly.
            </p>

            <div className="bg-amber-50 dark:bg-slate-700 rounded-lg p-6 mb-8">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Order Number</p>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-500">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <div className="space-y-3 mb-8 text-left">
              <div className="flex justify-between border-b dark:border-slate-600 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Customer Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.customer_name}</span>
              </div>
              <div className="flex justify-between border-b dark:border-slate-600 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Email</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.customer_email}</span>
              </div>
              <div className="flex justify-between border-b dark:border-slate-600 pb-2">
                <span className="text-gray-600 dark:text-gray-300">Total Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">Rs.{parseFloat(order.total_price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Estimated Delivery</span>
                <span className="font-medium text-gray-900 dark:text-white">2-3 business days</span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              A confirmation email has been sent to <strong>{order.customer_email}</strong>
            </p>

            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;