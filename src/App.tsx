/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ShoppingBag, Settings, ShoppingCart, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import Store from './components/Store';
import Admin from './components/Admin';
import { Bag } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync cart count from local storage
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartCount(cart.reduce((acc: number, item: any) => acc + item.quantity, 0));
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    const handleOpenCart = () => setIsCartOpen(true);
    window.addEventListener('open-cart', handleOpenCart);
    return () => {
      window.removeEventListener('cart-updated', updateCartCount);
      window.removeEventListener('open-cart', handleOpenCart);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-soft-bg text-[#2d3436] font-sans">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="bg-brand-primary p-2 rounded-2xl transform group-hover:rotate-12 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-display font-black tracking-tighter text-brand-primary">CORDUROY<span className="text-brand-secondary">STUDIO</span></span>
              </Link>
              
              <div className="flex items-center space-x-2 md:space-x-4">
                <Link to="/" className="flex items-center px-4 py-2 text-sm font-bold text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-xl transition-all">
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Shop</span>
                </Link>
                <Link to="/admin" className="flex items-center px-4 py-2 text-sm font-bold text-gray-500 hover:text-brand-secondary hover:bg-brand-secondary/5 rounded-xl transition-all">
                  <Settings className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
                <div className="relative group ml-2">
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="bg-brand-accent p-3 rounded-2xl shadow-lg shadow-brand-accent/30 hover:scale-105 active:scale-95 transition-all outline-none cursor-pointer"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-800" />
                    {cartCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-brand-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-black border-4 border-white"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Store isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-[#e5e1da] mt-20 py-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-[#8b7e6a] font-serif italic">Crafted with care & corduroy</p>
            <p className="text-xs text-[#b8b0a1] mt-2 tracking-widest uppercase">© 2026 Velvet & Corduroy Bag Studio</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

