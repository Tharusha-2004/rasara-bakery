import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: "Please upload an image smaller than 2MB.",
        variant: 'destructive'
      });
      return;
    }

    try {
      // Firebase Storage upload
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const storageRef = ref(storage, `product-images/${fileName}`);

      // Show preview while uploading
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
      };
      reader.readAsDataURL(file);

      // Upload to Firebase
      const snapshot = await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(snapshot.ref);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));

      toast({
        title: 'Image Uploaded',
        description: 'Product image has been updated',
      });
    } catch (error) {
      console.error("Upload failed", error);
      // Fallback to local base64 for demo
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result }));
        toast({
          title: 'Image Selected (Local)',
          description: 'Image stored locally (Firebase upload failed)',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url
      };

      // Try updating Firestore
      try {
        const productRef = doc(db, 'products', product.id);
        await updateDoc(productRef, updatedData);
        toast({
          title: 'Product Updated',
          description: `${formData.name} has been updated successfully`,
        });
      } catch (error) {
        console.warn("Firestore update failed, using local storage", error);
        toast({
          title: 'Product Updated (Local)',
          description: `${formData.name} updated in local storage (Firestore failed)`,
        });
      }

      // ALWAYS Update LocalStorage for hybrid/demo mode consistency
      const storedProducts = localStorage.getItem('bakery_products');
      if (storedProducts) {
        const products = JSON.parse(storedProducts);
        const updatedProducts = products.map(p =>
          p.id === product.id
            ? { ...p, ...updatedData }
            : p
        );
        localStorage.setItem('bakery_products', JSON.stringify(updatedProducts));
      }

      onSuccess();
      onClose();
    } catch (error) {
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