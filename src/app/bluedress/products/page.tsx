'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Plus, Trash2, Pencil, X, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ProductStockSelector } from '@/components/admin/ProductStockSelector';

interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  image_url?: string;
  description?: string;
  stock_status?: string;
  created_at?: string;
}

const CACHE_KEY = 'admin_products_cache';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    category: 'gift_cards',
    image_url: '',
    description: '',
    stock_status: 'in_stock',
  });

  // Single persistent client instance
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      ),
    []
  );

  const fetchProducts = async (isBackground = false) => {
    if (!isBackground && products.length === 0) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // Lean payload: select only columns needed for the catalog
      const { data, error } = await supabase
        .from('products')
        .select('id, title, price, category, image_url, description, stock_status, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Fetch products error:', error.message);
      } else if (data) {
        setProducts(data as Product[]);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch {}
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // 1. Instant hydration from cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
        }
      }
    } catch {}

    // 2. Fetch fresh data in background
    fetchProducts(true);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      price: '',
      category: 'gift_cards',
      image_url: '',
      description: '',
      stock_status: 'in_stock',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      title: p.title,
      price: p.price.toString(),
      category: p.category || 'gift_cards',
      image_url: p.image_url || '',
      description: p.description || '',
      stock_status: p.stock_status || 'in_stock',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return;

    // Optimistic UI removal
    const previous = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== id));

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Delete failed: ' + error.message);
      setProducts(previous);
    } else {
      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify(previous.filter((p) => p.id !== id))
        );
      } catch {}
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title.trim(),
      price: parseFloat(formData.price) || 0,
      category: formData.category,
      image_url: formData.image_url.trim(),
      description: formData.description.trim(),
      stock_status: formData.stock_status,
    };

    if (editingProduct) {
      // Optimistic update
      const updatedList = products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...payload } : p
      );
      setProducts(updatedList);
      setShowModal(false);

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);

      if (error) {
        alert('Update failed: ' + error.message);
        fetchProducts(true);
      } else {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(updatedList));
        } catch {}
      }
    } else {
      setShowModal(false);
      const { data, error } = await supabase
        .from('products')
        .insert(payload)
        .select()
        .single();

      if (error) {
        alert('Creation failed: ' + error.message);
      } else if (data) {
        const newList = [data as Product, ...products];
        setProducts(newList);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(newList));
        } catch {}
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Products Management
            </h1>
            {isRefreshing && (
              <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin" />
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Add, update inventory availability, or delete items from catalog ({products.length} loaded).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Add</span>
          </button>
          <Link
            href="/bluedress/products/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Full Form Page</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => startTransition(() => setSearchQuery(e.target.value))}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-black/40 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800/80 text-zinc-500 font-mono text-[11px] uppercase tracking-wider bg-zinc-950/50">
              <th className="py-4 px-6">ITEM</th>
              <th className="py-4 px-6">CATEGORY</th>
              <th className="py-4 px-6">PRICE</th>
              <th className="py-4 px-6">STOCK STATUS</th>
              <th className="py-4 px-6 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-900/30 transition">
                {/* Item Details */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        p.image_url ||
                        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=100&q=80'
                      }
                      alt={p.title}
                      loading="lazy"
                      className="w-10 h-10 rounded-lg object-contain bg-zinc-900 p-1 border border-zinc-800 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-white line-clamp-1">{p.title}</p>
                      <p className="text-[10px] text-zinc-500 font-mono line-clamp-1">
                        {p.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="py-4 px-6 font-mono uppercase text-zinc-400">
                  {p.category}
                </td>

                {/* Price */}
                <td className="py-4 px-6 font-mono font-bold text-amber-400 text-sm">
                  ${p.price}
                </td>

                {/* Live Stock Selector */}
                <td className="py-4 px-6">
                  <ProductStockSelector
                    productId={p.id}
                    currentStatus={(p.stock_status || 'in_stock') as any}
                    onStatusChange={(newStatus) => {
                      setProducts((prev) =>
                        prev.map((item) =>
                          item.id === p.id
                            ? { ...item, stock_status: newStatus }
                            : item
                        )
                      );
                    }}
                  />
                </td>

                {/* Action Buttons */}
                <td className="py-4 px-6 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(p)}
                    className="inline-flex p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition cursor-pointer"
                    title="Quick Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    href={`/bluedress/products/${p.id}/edit`}
                    className="inline-flex p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition"
                    title="Full Edit Page"
                  >
                    <span className="text-[10px] font-mono font-bold">PAGE</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-2 bg-red-950/40 hover:bg-red-900/60 rounded-lg text-red-400 transition cursor-pointer"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="py-12 flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="py-12 text-center text-xs text-zinc-500 font-mono">
            No products found matching your filter.
          </div>
        )}
      </div>

      {/* Add / Quick Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-sm">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Title *</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Price (USD) *</label>
                  <input
                    required
                    type="number"
                    step="any"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                  >
                    <option value="gift_cards">Gift Cards</option>
                    <option value="luxury_watches">Luxury Watches</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Initial Stock Status</label>
                <select
                  value={formData.stock_status}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_status: e.target.value })
                  }
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none font-mono"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Image URL</label>
                <input
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-black border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl uppercase tracking-wider transition cursor-pointer"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}