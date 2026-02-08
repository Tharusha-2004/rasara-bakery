import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data with nested items
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        // Snapshot product details to preserve history even if product changes
        products: {
          name: item.name,
          image_url: item.image_url
        }
      }));

      const newOrder = {
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        delivery_address: formData.address,
        status: 'pending',
        total_price: total,
        created_at: new Date().toISOString(),
        items: orderItems // Nest items directly in order document
      };

      // Create order in Firestore
      const docRef = await addDoc(collection(db, 'orders'), newOrder);
      const orderId = docRef.id;

      // Update product stock (Client-side transaction simulation)
      for (const item of cartItems) {
        try {
          const productRef = doc(db, 'products', item.id);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock_quantity;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(productRef, { stock_quantity: newStock });
          }
        } catch (stockError) {
          console.error(`Failed to update stock for ${item.name}`, stockError);
        }
      }

      // Clear cart
      clearCart();

      // Show success and navigate
      toast({
        title: 'Order Placed Successfully!',
        description: `Your order #${orderId.slice(0, 8)} has been received`,
      });

      // Pass the order object with the generated ID
      navigate('/order-confirmation', { state: { order: { ...newOrder, id: orderId } } });
    } catch (error) {
      console.error("Order placement error", error);
      toast({
        title: 'Error placing order',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Checkout - Rasara Bakery</title>
        <meta name="description" content="Complete your order" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Delivery Information</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="dark:text-gray-300">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="dark:text-gray-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="dark:text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="mt-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="dark:text-gray-300">Delivery Address</Label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-gray-400"
                    placeholder="123 Main St, Apt 4B, City, State 12345"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  {loading ? 'Processing...' : 'Place Order'}
                </Button>
              </form>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{item.name} × {item.quantity}</span>
                    <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax (8%)</span>
                  <span>Rs.{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                  <span>Total</span>
                  <span className="text-amber-600 dark:text-amber-500">Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 dark:bg-slate-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Estimated Delivery:</strong> 2-3 business days
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;