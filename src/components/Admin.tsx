import { useState, useEffect, FormEvent, ChangeEvent, Fragment } from 'react';
import { motion } from 'motion/react';
import { Package, ClipboardList, Plus, Trash2, Edit3, X, Save, TrendingUp, ShoppingBag, Clock, Upload } from 'lucide-react';
import { Bag, Order } from '../types';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'bags' | 'orders'>('bags');
  const [bags, setBags] = useState<Bag[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const bagsRes = await fetch('/api/bags');
    const ordersRes = await fetch('/api/orders');
    setBags(await bagsRes.json());
    setOrders(await ordersRes.json());
  };

  const handleBagSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    let finalImageUrl = editingBag?.imageUrl || '';

    // Upload image if a new one is selected
    if (selectedFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      } catch (err) {
        console.error("Upload failed", err);
        setIsUploading(false);
        return;
      }
    }

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const bagData = {
      name: formData.get('name'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
      imageUrl: finalImageUrl,
      category: formData.get('category'),
      stock: Number(formData.get('stock')),
    };

    const method = editingBag ? 'PUT' : 'POST';
    const url = editingBag ? `/api/bags/${(editingBag as any)._id || (editingBag as any).id}` : '/api/bags';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bagData)
    });

    setIsUploading(false);
    setIsFormOpen(false);
    setEditingBag(null);
    setSelectedFile(null);
    setPreviewUrl('');
    fetchData();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const deleteBag = async (id: string) => {
    if (confirm('Are you sure you want to delete this bag?')) {
      await fetch(`/api/bags/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Admin Header & Stats */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-4xl font-display font-black text-gray-800 tracking-tighter uppercase">Studio <span className="text-brand-primary">Command</span></h1>
            <p className="text-gray-400 mt-2 font-medium italic">"Precision in every stitch, excellence in every order."</p>
          </div>
          <div className="grid grid-cols-2 md:flex gap-6">
            <div className="bg-brand-neutral/10 p-6 rounded-[2rem] flex flex-col items-center justify-center min-w-[140px] border border-brand-neutral/20">
              <TrendingUp className="w-8 h-8 text-brand-neutral mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-brand-neutral/60">Revenue</p>
              <p className="text-2xl font-display font-black text-gray-800">${totalRevenue}</p>
            </div>
            <div className="bg-brand-secondary/10 p-6 rounded-[2rem] flex flex-col items-center justify-center min-w-[140px] border border-brand-secondary/20">
              <ShoppingBag className="w-8 h-8 text-brand-secondary mb-2" />
              <p className="text-[10px] uppercase font-black tracking-widest text-brand-secondary/60">Orders</p>
              <p className="text-2xl font-display font-black text-gray-800">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-4 mt-12 p-2 bg-gray-50 rounded-2xl w-fit border border-gray-100">
          <button 
            onClick={() => setActiveTab('bags')}
            className={`flex items-center space-x-3 px-8 py-3 rounded-xl transition-all font-black text-sm uppercase tracking-tighter ${activeTab === 'bags' ? 'bg-gray-800 text-white shadow-xl shadow-gray-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            <Package className="w-4 h-4" />
            <span>Vault</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center space-x-3 px-8 py-3 rounded-xl transition-all font-black text-sm uppercase tracking-tighter ${activeTab === 'orders' ? 'bg-gray-800 text-white shadow-xl shadow-gray-400' : 'text-gray-400 hover:text-gray-800'}`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Ledger</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'bags' ? (
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-display font-black text-gray-800">Inventory Status</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setEditingBag(null); setIsFormOpen(true); }}
              className="flex items-center space-x-3 bg-brand-primary text-white px-8 py-4 rounded-2xl hover:brightness-110 shadow-lg shadow-brand-primary/20 font-black"
            >
              <Plus className="w-5 h-5" />
              <span>Forge New Bag</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bags.map((bag) => (
              <div key={(bag as any)._id || (bag as any).id} className="group bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all transform hover:-translate-y-2">
                <div className="h-56 overflow-hidden bg-gray-50 relative">
                  <img src={bag.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-secondary border border-brand-secondary/20">
                    {bag.category}
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-display font-black text-gray-800 leading-tight">{bag.name}</h3>
                      <div className="flex items-center mt-1 text-xs font-bold text-gray-300">
                        <Package className="w-3 h-3 mr-1" />
                        <span>Supply: {bag.stock} units</span>
                      </div>
                    </div>
                    <span className="text-2xl font-display font-black text-brand-primary">${bag.price}</span>
                  </div>
                  <div className="flex justify-end space-x-3 pt-6 border-t border-gray-50">
                    <button 
                      onClick={() => { setEditingBag(bag); setIsFormOpen(true); }}
                      className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteBag((bag as any)._id || (bag as any).id)}
                      className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Reference</th>
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Ambassador</th>
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Tribute</th>
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Lifecycle</th>
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Timeline</th>
                  <th className="px-8 py-6 font-display font-black text-gray-400 uppercase tracking-widest text-[10px]">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <Fragment key={(order as any)._id || (order as any).id}>
                  <tr className="hover:bg-soft-bg/50 transition-colors cursor-pointer" onClick={() => setExpandedOrder(expandedOrder === ((order as any)._id || (order as any).id) ? null : ((order as any)._id || (order as any).id))}>
                    <td className="px-8 py-6">
                      <span className="font-display font-black text-brand-secondary">#{(order as any)._id?.slice(-4) || (order as any).id?.slice(-4)}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-800">{order.customerName}</span>
                        <span className="text-xs text-gray-400 font-medium">{order.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-display font-black text-gray-800 text-lg">${order.total}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-brand-neutral/10 text-brand-neutral border border-brand-neutral/20' : 
                        order.status === 'shipped' ? 'bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20' : 
                        order.status === 'cancelled' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' : 'bg-brand-accent/10 text-gray-600 border border-brand-accent/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-gray-400 font-bold text-xs uppercase italic">
                        <Clock className="w-3 h-3 mr-2" />
                        {new Date(order.createdAt!).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateOrderStatus((order as any)._id || (order as any).id, e.target.value)}
                        className="bg-gray-50 border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase p-2 focus:border-brand-secondary transition-all outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  {expandedOrder === ((order as any)._id || (order as any).id) && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="px-8 py-4">
                        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-inner flex flex-col space-y-4 animate-in fade-in slide-in-from-top-2">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Order Items ({order.items.length})</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <div className="flex items-center space-x-3">
                                  <span className="bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded-lg">x{item.quantity}</span>
                                  <span className="font-bold text-gray-700 text-sm">{item.name}</span>
                                </div>
                                <span className="text-gray-400 font-black text-xs">${item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-4 border-t border-gray-100">
                             <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Shipping Destination</span>
                             <p className="text-sm font-medium text-gray-600 mt-2 italic">"{order.address}"</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {orders.length === 0 && (
            <div className="p-32 text-center text-gray-300">
              <ClipboardList className="w-24 h-24 opacity-10 mx-auto mb-6" />
              <p className="font-display font-black text-2xl tracking-tighter uppercase">No legends written yet...</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Bag Slider/Modal - Colorful improvements */}
      {isFormOpen && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-xl z-[100]" onClick={() => { setIsFormOpen(false); setSelectedFile(null); setPreviewUrl(''); }} />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[110] shadow-2xl p-12 flex flex-col rounded-l-[3rem]"
          >
            <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-50">
              <h2 className="text-3xl font-display font-black text-gray-800 tracking-tighter uppercase">{editingBag ? 'Refine' : 'Forge'} <span className="text-brand-primary">Bag</span></h2>
              <button onClick={() => { setIsFormOpen(false); setSelectedFile(null); setPreviewUrl(''); }} className="p-3 bg-gray-50 hover:bg-brand-primary/10 rounded-2xl transition-colors group">
                <X className="w-6 h-6 text-gray-400 group-hover:text-brand-primary" />
              </button>
            </div>
            
            <form onSubmit={handleBagSubmit} className="space-y-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center p-10 border-4 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 cursor-pointer hover:border-brand-primary hover:bg-brand-primary/5 transition-all relative group overflow-hidden">
                  {(previewUrl || editingBag?.imageUrl) ? (
                    <img src={previewUrl || editingBag?.imageUrl} className="w-full h-56 object-cover rounded-[1.5rem] shadow-xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="text-center group-hover:scale-110 transition-transform">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Upload className="w-8 h-8 text-brand-primary" />
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Select Material Image</p>
                    </div>
                  )}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-3">Bag Moniker</label>
                    <input name="name" defaultValue={editingBag?.name} required className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-secondary focus:outline-none transition-all font-bold" placeholder="E.g. The Midnight Corduroy" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-3">Price tribute ($)</label>
                      <input name="price" type="number" defaultValue={editingBag?.price} required className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-secondary focus:outline-none transition-all font-bold" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-brand-secondary mb-3">Vault Stock</label>
                      <input name="stock" type="number" defaultValue={editingBag?.stock} required className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-secondary focus:outline-none transition-all font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-primary mb-3">Guild Category</label>
                    <select name="category" defaultValue={editingBag?.category} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-primary focus:outline-none transition-all font-bold appearance-none">
                      <option value="Classic">Classic Series</option>
                      <option value="Daily">Daily Companion</option>
                      <option value="Limited">Limited Artefact</option>
                      <option value="Special">Special Stitch</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-brand-neutral mb-3">Description of craftsmanship</label>
                    <textarea name="description" defaultValue={editingBag?.description} required rows={4} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-brand-neutral focus:outline-none transition-all font-bold" placeholder="Tell the story of this piece..." />
                  </div>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full py-5 bg-gray-800 text-white rounded-[2rem] font-black text-lg uppercase tracking-tighter hover:bg-brand-primary transition-all shadow-2xl shadow-brand-primary/20 flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                <Save className="w-6 h-6" />
                <span>{isUploading ? 'Preparing Forge...' : (editingBag ? 'Update Piece' : 'Complete Forge')}</span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </div>
  );
}
