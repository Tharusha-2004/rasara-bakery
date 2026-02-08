import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { mockProducts } from '@/data/mockProducts';
import AddProductForm from './AddProductForm';
import EditProductModal from './EditProductModal';
import { useAdminData } from '@/contexts/AdminDataContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const { toast } = useToast();
  const { getCachedData, setCachedData, setLoading: setCacheLoading, invalidateCache } = useAdminData();

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
      const querySnapshot = await getDocs(collection(db, 'products'));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (data && data.length > 0) {
        setProducts(data);
        setCachedData('products', data);
      } else {
        // Fallback to mock data/local storage if Firestore is empty or fails
        const storedProducts = localStorage.getItem('bakery_products');
        if (storedProducts) {
          const parsedProducts = JSON.parse(storedProducts);
          setProducts(parsedProducts);
          setCachedData('products', parsedProducts);
        } else {
          setProducts(mockProducts);
          setCachedData('products', mockProducts);
        }
      }
    } catch (error) {
      console.warn("Firestore error, falling back to local/mock:", error);
      // Fallback to mock data/local storage
      const storedProducts = localStorage.getItem('bakery_products');
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        setProducts(parsedProducts);
        setCachedData('products', parsedProducts);
      } else {
        setProducts(mockProducts);
        setCachedData('products', mockProducts);
      }

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

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      // Try to delete from Firestore
      try {
        await deleteDoc(doc(db, "products", deletingProduct.id));
      } catch (e) {
        console.warn("Could not delete from Firestore (might be mock mode)", e);
      }

      toast({
        title: 'Product Deleted',
        description: `${deletingProduct.name} has been removed`,
      });

      // Update LocalStorage for demo mode
      const updatedProducts = products.filter(p => p.id !== deletingProduct.id);
      setProducts(updatedProducts); // Optimistic update
      localStorage.setItem('bakery_products', JSON.stringify(updatedProducts));

      // Invalidate cache after delete
      invalidateCache('products');
    } catch (error) {
      toast({
        title: 'Error deleting product',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setDeletingProduct(null);
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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              if (confirm('This will reset all product data to defaults. Your added products will be lost. Continue?')) {
                // ... existing logic ...
                setLoading(true);
                try {
                  const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
                    !import.meta.env.VITE_SUPABASE_URL.includes('your_project_url');

                  if (!isConfigured) {
                    localStorage.removeItem('bakery_products');
                    window.location.reload();
                    return;
                  }

                  // ... rest of logic ...
                  const { error: deleteError } = await supabase
                    .from('products')
                    .delete()
                    .gt('id', 0);

                  if (deleteError) throw deleteError;

                  const productsToInsert = mockProducts.map(({ id, category, ...rest }) => ({
                    ...rest,
                    price: parseFloat(rest.price),
                    stock_quantity: parseInt(rest.stock_quantity)
                  }));

                  const { error: insertError } = await supabase
                    .from('products')
                    .insert(productsToInsert);

                  if (insertError) throw insertError;

                  toast({
                    title: 'Defaults Restored',
                    description: 'Product database has been reset to default values.',
                  });

                  fetchProducts();
                } catch (error) {
                  // ... error handling ...
                  console.error('Error restoring defaults:', error);
                  toast({
                    title: 'Error restoring defaults',
                    description: error.message,
                    variant: 'destructive'
                  });
                } finally {
                  setLoading(false);
                }
              }
            }}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700"
          >
            Restore Defaults
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onSuccess={() => {
            invalidateCache('products');
            fetchProducts();
          }}
        />
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-300">No products yet</p>
          <p className="text-gray-500 dark:text-gray-400">Add your first product to get started</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Image</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Price</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700">
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
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Rs.{parseFloat(product.price).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${product.stock_quantity === 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      : product.stock_quantity < 5
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}>
                      {product.stock_quantity} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setDeletingProduct(product)}
                        className="bg-red-500 hover:bg-red-600 text-white border-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            invalidateCache('products');
            fetchProducts();
          }}
        />
      )}

      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;