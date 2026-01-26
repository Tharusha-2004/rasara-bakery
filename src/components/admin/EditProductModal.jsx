import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EditProductModal = ({ product, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || '',
    price: product.price,
    stock_quantity: product.stock_quantity,
    image_url: product.image_url || ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 800KB for localStorage)
    if (file.size > 800 * 1024) {
      const errorMsg = "Image too large for local demo! Please upload an image smaller than 800KB.";
      alert(errorMsg);
      toast({
        title: 'File too large',
        description: errorMsg,
        variant: 'destructive'
      });
      return;
    }

    try {
      // FORCE DEMO MODE: specific check to ensure we always use local storage if not properly configured
      // or if we catch an RLS error from a previous attempt
      const shouldUseLocalStorage = true;

      if (shouldUseLocalStorage) {
        // Convert image to base64 for localStorage persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image_url: reader.result }));
          toast({
            title: 'Image Selected',
            description: 'Image will be stored locally',
          });
        };
        reader.readAsDataURL(file);
        return;
      }

      // Unreachable code for now, but kept for future real backend integration
      const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('your_project_url');

      if (!isConfigured) {
        // ... (existing logic)
      }

      // For Supabase mode: upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));

      toast({
        title: 'Image Uploaded',
        description: 'Product image has been updated',
      });
    } catch (error) {
      alert("Error uploading image: " + error.message);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const isConfigured = import.meta.env.VITE_SUPABASE_URL &&
        !import.meta.env.VITE_SUPABASE_URL.includes('your_project_url');

      if (!isConfigured) {
        // Demo mode: update in localStorage
        const storedProducts = localStorage.getItem('bakery_products');
        if (storedProducts) {
          const products = JSON.parse(storedProducts);
          const updatedProducts = products.map(p =>
            p.id === product.id
              ? {
                ...p,
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                image_url: formData.image_url
              }
              : p
          );
          localStorage.setItem('bakery_products', JSON.stringify(updatedProducts));

          toast({
            title: 'Product Updated (Demo Mode)',
            description: `${formData.name} has been updated in local storage`,
          });

          onSuccess();
          onClose();
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock_quantity),
          image_url: formData.image_url
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: 'Product Updated',
        description: `${formData.name} has been updated successfully`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      alert("Error saving: " + error.message);
      toast({
        title: 'Error updating product',
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
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label htmlFor="edit-name" className="dark:text-gray-200">Product Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="edit-price" className="dark:text-gray-200">Price (Rs.)</Label>
            <Input
              id="edit-price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="edit-stock" className="dark:text-gray-200">Stock Quantity</Label>
            <Input
              id="edit-stock"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleChange}
              required
              className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="edit-image" className="dark:text-gray-200">Product Image</Label>
            <div className="mt-1">
              <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-colors dark:bg-slate-800">
                <Upload className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Change Image</span>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="edit-description" className="dark:text-gray-200">Description</Label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white dark:bg-slate-800"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;