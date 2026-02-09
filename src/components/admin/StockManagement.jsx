import React, { useState, useEffect } from 'react';
import { AlertCircle, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockProducts } from '@/data/mockProducts';
import { useAdminData } from '@/contexts/AdminDataContext';

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const { toast } = useToast();
  const { getCachedData, setCachedData, setLoading: setCacheLoading } = useAdminData();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    // Check cache first
    const cachedProducts = getCachedData('products');
    if (cachedProducts) {
      setProducts(cachedProducts);
      setLoading(false);
      return;
    }

    setCacheLoading('products', true);
    try {
      let firestoreData = [];
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        firestoreData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (e) {
        console.warn("Firestore fetch failed", e);
      }

      // Start with Firestore products
      const finalProducts = [...firestoreData];

      // Merge local storage products
      const storedProducts = localStorage.getItem('bakery_products');
      if (storedProducts) {
        try {
          const localItems = JSON.parse(storedProducts);
          localItems.forEach(localP => {
            const exists = finalProducts.some(fp => fp.id === localP.id || fp.name === localP.name);
            if (!exists) {
              finalProducts.push({ ...localP, isLocal: true });
            }
          });
        } catch (e) {
          console.error("Error parsing local products", e);
        }
      }

      // Merge Mock Products (Defaults)
      mockProducts.forEach(mockP => {
        const exists = finalProducts.some(p => p.id === mockP.id || p.name === mockP.name);
        if (!exists) {
          finalProducts.push({ ...mockP, isMock: true });
        }
      });

      // Sort by name
      finalProducts.sort((a, b) => a.name.localeCompare(b.name));

      if (finalProducts.length > 0) {
        setProducts(finalProducts);
        setCachedData('products', finalProducts);
      } else {
        setProducts(mockProducts);
        setCachedData('products', mockProducts);
      }
    } catch (error) {
      console.warn("Error fetching products (mock mode):", error);
      setProducts(mockProducts);
      setCachedData('products', mockProducts);

      if (error.code !== 'permission-denied' && error.code !== 'unavailable') {
        toast({
          title: 'Error loading products',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
      setCacheLoading('products', false);
    }
  };

  const updateStock = async (productId, newQuantity) => {
    setUpdating(prev => ({ ...prev, [productId]: true }));

    try {
      // Update in Firestore
      try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, { stock_quantity: parseInt(newQuantity) });
      } catch (e) {
        console.warn("Firestore update failed (mock mode?)", e);
      }

      toast({
        title: 'Stock Updated',
        description: 'Stock quantity has been updated successfully',
      });

      // Optimistic update
      const updatedProducts = products.map(p => p.id === productId ? { ...p, stock_quantity: parseInt(newQuantity) } : p);
      setProducts(updatedProducts);
      setCachedData('products', updatedProducts);

    } catch (error) {
      toast({
        title: 'Error updating stock',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setUpdating(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleStockChange = (productId, value) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === productId ? { ...p, stock_quantity: value } : p
      )
    );
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stock Management</h2>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No products to manage</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Current Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Update Stock</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isLowStock = product.stock_quantity < 5;
                const isOutOfStock = product.stock_quantity === 0;

                return (
                  <tr
                    key={product.id}
                    className={`border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isLowStock ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                      } ${isOutOfStock ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40" />
                          )}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${isOutOfStock ? 'text-red-600 dark:text-red-400' :
                        isLowStock ? 'text-amber-600 dark:text-amber-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                        {product.stock_quantity} units
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        type="number"
                        value={product.stock_quantity}
                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                        className="w-32 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${isOutOfStock
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : isLowStock
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        }`}>
                        {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => updateStock(product.id, product.stock_quantity)}
                        disabled={updating[product.id]}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {updating[product.id] ? 'Saving...' : 'Save'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockManagement;