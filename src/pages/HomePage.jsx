import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, AlertCircle, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

import { mockProducts } from '@/data/mockProducts';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    let firestoreData = [];
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      firestoreData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Error loading products from Firebase:', error);
    }

    let finalProducts = [...firestoreData];

    const storedProducts = localStorage.getItem('bakery_products');
    if (storedProducts) {
      try {
        const localItems = JSON.parse(storedProducts);
        localItems.forEach(localP => {
          const exists = finalProducts.some(p => p.id === localP.id || p.name === localP.name);
          if (!exists) {
            finalProducts.push({ ...localP, isLocal: true });
          }
        });
      } catch (e) {
        console.error("Error parsing local products", e);
      }
    }

    mockProducts.forEach(mockP => {
      const exists = finalProducts.some(p => p.id === mockP.id || p.name === mockP.name);
      if (!exists) {
        finalProducts.push({ ...mockP, isMock: true });
      }
    });

    setProducts(finalProducts);
    setLoading(false);
  };

  // Extract categories dynamically
  const categories = useMemo(() => {
    const cats = ["All"];
    products.forEach(p => {
      if (p.category && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter(p => p.category === activeCategory);
  }, [activeCategory, products]);

  const handleAddToCart = (product) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: 'Out of Stock',
        description: `${product.name} is currently out of stock`,
        variant: 'destructive'
      });
      return;
    }

    addToCart(product);
    toast({
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart`,
    });
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-500' };
    if (quantity < 5) return { text: 'Low Stock', color: 'text-amber-500' };
    return { text: 'In Stock', color: 'text-green-500' };
  };

  return (
    <>
      <Helmet>
        <title>Home - Rasara Bakery</title>
        <meta name="description" content="Fresh baked goods made daily with love. Browse our selection of artisan breads, pastries, and desserts." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Hero Section with Animated Baker Character */}
        <section className="relative h-[450px] md:h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2072&auto=format&fit=crop" alt="Bakery Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          </div>
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center text-white z-10">
              <motion.h1
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
              >
                Rasara Bakery
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xl md:text-2xl font-light text-amber-100 mb-6"
              >
                Artisan Bakes & Sweet Delights
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <a
                  href="#products"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  Browse Our Menu
                </a>
              </motion.div>
            </div>

            {/* Right Side - Animated 3D Baker Character */}
            <motion.div
              className="hidden md:flex items-end justify-center z-10"
              initial={{ opacity: 0, scale: 0.3, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.4,
              }}
            >
              <motion.img
                src="/images/baker-character.png"
                alt="Rasara Bakery Chef"
                className="h-[300px] md:h-[380px] lg:h-[420px] rounded-2xl object-cover shadow-2xl cursor-pointer select-none"
                style={{ filter: 'drop-shadow(0 10px 25px rgba(245, 158, 11, 0.3))' }}
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  },
                }}
                whileHover={{
                  scale: 1.08,
                  rotate: [0, -3, 3, 0],
                  transition: { duration: 0.4 },
                }}
                whileTap={{ scale: 0.95 }}
                drag
                dragConstraints={{ top: -10, bottom: 10, left: -10, right: 10 }}
                dragElastic={0.1}
              />
            </motion.div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-50 dark:from-slate-950 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          />
        </section>

        {/* Gallery Section */}
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${activeCategory === cat
                  ? 'bg-amber-600 text-white shadow-lg scale-105 ring-2 ring-amber-600 ring-offset-2 dark:ring-offset-slate-900'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No products found in this category.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock_quantity);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      key={product.id}
                      className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Image Container with Zoom Effect */}
                      <div className="aspect-[4/3] overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-amber-50 dark:bg-slate-700">
                            <ShoppingCart className="w-12 h-12 text-amber-200" />
                          </div>
                        )}
                        {/* Overlay Gradient on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Quick Add Button (appears on hover) */}
                        <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="icon"
                            className="rounded-full bg-white text-amber-600 hover:bg-amber-100 hover:text-amber-700 shadow-lg"
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                          <div className="flex items-center text-amber-400 text-xs">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="ml-1">4.8</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 min-h-[40px]">
                          {product.description || 'Delightful artisan pastry.'}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            Rs.{parseFloat(product.price).toFixed(2)}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </>
  );
};

export default HomePage;