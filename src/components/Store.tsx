import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Plus, Minus, X, Check, Search } from 'lucide-react';
import { Bag } from '../types';

export default function Store({ isCartOpen, setIsCartOpen }: { isCartOpen: boolean, setIsCartOpen: (open: boolean) => void }) {
  const [bags, setBags] = useState<Bag[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bags')
      .then(res => res.json())
      .then(data => setBags(data));
    
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const addToCart = (bag: Bag) => {
    const bagId = bag._id || (bag as any).id;
    const existing = cart.find(item => item.bagId === bagId);
    if (existing) {
      saveCart(cart.map(item => item.bagId === bagId ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cart, { bagId: bagId, name: bag.name, price: bag.price, quantity: 1, imageUrl: bag.imageUrl }]);
    }
    setAddedId(bagId);
    setTimeout(() => setAddedId(null), 2000);
  };

  const updateQuantity = (bagId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.bagId === bagId) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0);
    saveCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const [selectedCategory, setSelectedCategory] = useState('All Bags');

  const filteredBags = bags.filter(bag => {
    const matchesSearch = bag.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         bag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Bags' || bag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckout = async (e: FormEvent) => {
    e.preventDefault();
    setOrderStatus('submitting');
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const order = {
      customerName: formData.get('name'),
      email: formData.get('email'),
      address: formData.get('address'),
      items: cart,
      total: total
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        setOrderStatus('success');
        saveCart([]);
        setTimeout(() => {
          setOrderStatus('idle');
          setIsCartOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setOrderStatus('idle');
    }
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative h-[65vh] rounded-[2rem] overflow-hidden group shadow-2xl shadow-brand-primary/10">
        <img 
          src="/input_file_2.png" 
          alt="Corduroy Bags Collection" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/60 to-transparent flex items-center p-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl text-left"
          >
            <span className="inline-block bg-brand-accent text-gray-800 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">New Season Arrival</span>
            <h1 className="text-5xl md:text-7xl font-display font-black text-white mb-6 leading-tight">Vibrant <br/>Corduroy <br/><span className="text-brand-accent">Studio</span></h1>
            <p className="text-xl text-white/90 font-light mb-10 max-w-md">Indulge in the finest handcrafted textures designed to complement your boldest adventures.</p>
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-brand-primary px-10 py-4 rounded-2xl font-black text-lg hover:bg-brand-accent hover:text-gray-800 transition-all transform hover:-rotate-3 active:scale-95 shadow-xl"
            >
              Start Exploring
            </button>
          </motion.div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="flex flex-wrap justify-center gap-4">
        {['All Bags', 'Classic', 'Daily', 'Limited', 'Special'].map((cat, i) => (
          <button 
            key={i} 
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full border-2 transition-all font-bold text-sm ${selectedCategory === cat ? 'border-brand-primary bg-brand-primary text-white shadow-lg' : 'border-gray-100 bg-white text-gray-400 hover:border-brand-secondary hover:text-brand-secondary'}`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Featured Images Grid - More playful */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="h-96 rounded-3xl overflow-hidden relative group shadow-xl">
           <img src="/input_file_0.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" referrerPolicy="no-referrer" />
           <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-brand-primary to-transparent">
             <span className="text-white font-display font-black text-2xl">The Meow Series</span>
             <p className="text-white/80 text-xs mt-1">Limited cat-inspired embroidery</p>
           </div>
         </div>
         <div className="h-96 rounded-3xl overflow-hidden relative group shadow-xl -rotate-2 hover:rotate-0 transition-transform">
           <img src="/input_file_4.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" referrerPolicy="no-referrer" />
           <div className="absolute inset-0 bg-brand-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-brand-secondary to-transparent">
             <span className="text-white font-display font-black text-2xl">Stitch Edition</span>
             <p className="text-white/80 text-xs mt-1">Playful pop-culture designs</p>
           </div>
         </div>
         <div className="h-96 rounded-3xl overflow-hidden relative group shadow-xl rotate-2 hover:rotate-0 transition-transform">
           <img src="/input_file_6.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125" referrerPolicy="no-referrer" />
           <div className="absolute inset-0 bg-brand-neutral/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-brand-neutral to-transparent">
             <span className="text-white font-display font-black text-2xl">Corduroy Texture</span>
             <p className="text-white/80 text-xs mt-1">Rich colors and soft feel</p>
           </div>
         </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-2xl mx-auto w-full">
        <div className="relative group">
          <div className="absolute inset-0 bg-brand-secondary/10 rounded-[2rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-secondary transition-colors" />
          <input 
            type="text"
            placeholder="Find your perfect bag texture..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="relative w-full pl-16 pr-6 py-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-xl focus:outline-none focus:border-brand-secondary transition-all font-medium text-lg placeholder:text-gray-300"
          />
        </div>
      </section>

      {/* Products list */}
      <section id="products">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-display font-black text-gray-800 tracking-tight">Our Curated <span className="text-brand-primary underline decoration-brand-accent">Pieces</span></h2>
            <p className="text-gray-400 mt-2 font-medium">Bags that tell a story of craftsmanship.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-3 bg-brand-accent text-gray-800 px-8 py-4 rounded-2xl font-black shadow-lg shadow-brand-accent/30 relative"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>View Cart</span>
            {cart.length > 0 && (
              <span className="bg-brand-primary text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full absolute -top-3 -right-3 border-4 border-white shadow-md">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </motion.button>
        </div>

        {filteredBags.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {filteredBags.map((bag, i) => (
              <motion.div 
                key={bag._id || (bag as any).id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white rounded-[2.5rem] p-5 shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col h-full transform hover:-translate-y-2"
              >
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-gray-50 relative">
                  <img 
                    src={bag.imageUrl} 
                    alt={bag.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm">
                    <span className="text-xs font-black text-brand-primary uppercase tracking-wider">{bag.category}</span>
                  </div>
                </div>
                <div className="flex-1 px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-display font-black text-xl text-gray-800 leading-tight group-hover:text-brand-primary transition-colors">{bag.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-black text-brand-secondary">${bag.price}</span>
                    <span className="text-gray-300 text-xs line-through">${Math.round(bag.price * 1.2)}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed italic">"{bag.description}"</p>
                </div>
                <button 
                  onClick={() => addToCart(bag)}
                  className={`w-full py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest shadow-xl shadow-gray-200 ${addedId === (bag._id || (bag as any).id) ? 'bg-brand-neutral text-white' : 'bg-gray-800 text-white group-hover:bg-brand-primary'}`}
                >
                  {addedId === (bag._id || (bag as any).id) ? 'Added! ✓' : 'Quick Add +'}
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center text-gray-300 bg-white rounded-[3rem] border-4 border-dashed border-gray-100">
            <Search className="w-20 h-20 mx-auto mb-6 opacity-10" />
            <p className="font-display font-black text-2xl uppercase tracking-tighter">Nothing found for piece "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')} className="mt-4 text-brand-primary font-bold hover:underline">Clear Search</button>
          </div>
        )}
      </section>

      {/* Cart Modal - Colorful updates */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl p-10 flex flex-col rounded-l-[3rem]"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-display font-black text-gray-800 tracking-tighter">Your <span className="text-brand-primary">Loot!</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="p-3 bg-gray-50 hover:bg-brand-primary/10 rounded-2xl transition-colors group">
                  <X className="w-6 h-6 text-gray-400 group-hover:text-brand-primary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-300">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <ShoppingCart className="w-10 h-10 opacity-20" />
                    </div>
                    <p className="font-display font-black text-xl uppercase tracking-tighter">Empty Bag!</p>
                    <p className="text-sm mt-1">Go find some corduroy magic</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.bagId} className="flex space-x-6 group">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gray-50 shadow-md">
                        <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex justify-between">
                          <h4 className="font-display font-black text-gray-800 leading-tight">{item.name}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-100">
                            <button onClick={() => updateQuantity(item.bagId, -1)} className="p-1 hover:text-brand-primary"><Minus className="w-3 h-3" /></button>
                            <span className="text-sm font-black w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.bagId, 1)} className="p-1 hover:text-brand-primary"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="font-black text-brand-secondary text-lg">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && orderStatus !== 'success' && (
                <div className="mt-10 space-y-8">
                  <div className="bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">Total Amount</span>
                      <span className="text-4xl font-display font-black text-brand-primary">${total}</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div className="flex flex-col space-y-3">
                      <input name="name" placeholder="Who's buying?" required className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-primary focus:outline-none transition-all font-medium" />
                      <input name="email" type="email" placeholder="Your digital address (email)" required className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-primary focus:outline-none transition-all font-medium" />
                      <textarea name="address" placeholder="Where should we send the magic?" required className="w-full p-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-brand-primary focus:outline-none transition-all font-medium" rows={3} />
                    </div>
                    <button 
                      type="submit" 
                      disabled={orderStatus === 'submitting'}
                      className="group relative w-full py-5 bg-gray-800 text-white rounded-[2rem] font-black text-lg uppercase tracking-tighter hover:bg-brand-primary transition-all shadow-xl shadow-brand-primary/20"
                    >
                      {orderStatus === 'submitting' ? 'Summoning Packets...' : 'Finalize Loot!'}
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 group-hover:translate-x-2 transition-transform">
                        <Check className="w-6 h-6" />
                      </div>
                    </button>
                  </form>
                </div>
              )}

              {orderStatus === 'success' && (
                <div className="absolute inset-0 bg-white z-[80] flex flex-col items-center justify-center p-12 text-center rounded-l-[3rem]">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, 15, -15, 0] }}
                    className="w-32 h-32 bg-brand-neutral/20 rounded-full flex items-center justify-center mb-8"
                  >
                    <Check className="w-16 h-16 text-brand-neutral" />
                  </motion.div>
                  <h3 className="text-4xl font-display font-black text-gray-800 mb-4 tracking-tighter leading-tight">YAY! ORDER <br/><span className="text-brand-neutral">SECURED</span></h3>
                  <p className="text-gray-500 font-medium italic mb-8">We're preparing your corduroy pieces with extra love. Check your email shortly!</p>
                  <button 
                    onClick={() => { setIsCartOpen(false); setOrderStatus('idle'); }}
                    className="px-8 py-4 bg-gray-800 text-white rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-brand-primary transition-all"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
