import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockProducts } from '@/data/mockProducts';

const AddProductForm = ({ onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    image_url: ''
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
        description: 'Product image has been uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback to local base64 for demo
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData(prev => ({ ...prev, image_url: base64String }));
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
      const newProduct = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        image_url: formData.image_url,
        created_at: new Date().toISOString()
      };

      // Try adding to Firestore
      try {
        await addDoc(collection(db, 'products'), newProduct);
        toast({
          title: 'Product Added',
          description: `${formData.name} has been added successfully`,
        });
      } catch (error) {
        console.warn("Firestore add failed, using local storage", error);
        toast({
          title: 'Product Added (Local)',
          description: `${formData.name} added to local storage (Firestore failed)`,
        });
      }

      // ALWAYS Update LocalStorage for hybrid/demo mode consistency
      const storedProducts = localStorage.getItem('bakery_products');
      const currentProducts = storedProducts ? JSON.parse(storedProducts) : [...mockProducts];
      // Generate a random ID for local storage if we didn't get one from Firestore (or even if we did, for consistency in this hybrid app)
      const localProduct = {
        ...newProduct,
        id: Math.floor(Math.random() * 10000)
      };
      const updatedProducts = [localProduct, ...currentProducts];
      localStorage.setItem('bakery_products', JSON.stringify(updatedProducts));

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: 'Error adding product',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-6 bg-gray-50 dark:bg-slate-700/50 rounded-xl border-2 border-amber-200 dark:border-slate-600">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h3>
        <Button size="sm" variant="ghost" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-slate-600">
          <X className="w-5 h-5 dark:text-gray-200" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="dark:text-gray-200">Product Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            placeholder="Sourdough Bread"
          />
        </div>

        <div>
          <Label htmlFor="price" className="dark:text-gray-200">Price (Rs.)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
            className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            placeholder="4.99"
          />
        </div>

        <div>
          <Label htmlFor="stock_quantity" className="dark:text-gray-200">Stock Quantity</Label>
          <Input
            id="stock_quantity"
            name="stock_quantity"
            type="number"
            value={formData.stock_quantity}
            onChange={handleChange}
            required
            className="mt-1 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            placeholder="50"
          />
        </div>

        <div>
          <Label htmlFor="image" className="dark:text-gray-200">Product Image</Label>
          <div className="mt-1">
            <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-amber-500 dark:hover:border-amber-500 transition-colors dark:bg-slate-800">
              <Upload className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formData.image_url ? 'Change Image' : 'Upload Image'}
              </span>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="description" className="dark:text-gray-200">Description</Label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 dark:text-white dark:bg-slate-800"
            placeholder="Fresh baked sourdough with a crispy crust..."
          />
        </div>

        <div className="md:col-span-2 flex gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} className="dark:bg-slate-800 dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;