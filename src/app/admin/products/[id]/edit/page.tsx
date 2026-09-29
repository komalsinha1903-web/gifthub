'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Package, 
  DollarSign, 
  Layers,
  AlertCircle,
  Loader2,
  Crown,
  Flame,
  Star,
  Ban,
  Tag, 
  Plus
} from 'lucide-react';

interface Denomination {
  card_value: number;
  selling_price: number;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. General Details
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('gift_cards');
  const [badge, setBadge] = useState<string>('');
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // 2. Base Pricing & Stock
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('100');

  // 3. Denominations
  const [denominations, setDenominations] = useState<Denomination[]>([]);
  const [newCardValue, setNewCardValue] = useState('');
  const [newSellingPrice, setNewSellingPrice] = useState('');

  // 4. Product Images
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // 5. Variants
  const [variantSizeInput, setVariantSizeInput] = useState('');
  const [variantSizes, setVariantSizes] = useState<string[]>([]);
  const [variantColorInput, setVariantColorInput] = useState('');
  const [variantColors, setVariantColors] = useState<string[]>([]);
  const [variantOtherInput, setVariantOtherInput] = useState('');
  const [variantOthers, setVariantOthers] = useState<string[]>([]);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch Existing Product Data
  useEffect(() => {
    async function loadProduct() {
      setInitialLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        setErrorMessage('Product not found or failed to load.');
      } else {
        setProductName(data.title || '');
        setCategory(data.category || 'gift_cards');
        setBadge(data.badge || '');
        setDescription(data.description || '');
        setSku(data.sku || '');
        setStatus(data.status === 'inactive' ? 'inactive' : 'active');
        setPrice(data.price ? data.price.toString() : '');
        setDiscount(data.discount_percentage ? data.discount_percentage.toString() : '0');
        setStockQuantity(data.stock_quantity ? data.stock_quantity.toString() : '100');

        if (Array.isArray(data.denominations) && data.denominations.length > 0) {
          setDenominations(data.denominations);
        }

        const loadedImages = Array.isArray(data.images) && data.images.length > 0 
          ? data.images 
          : data.image_url ? [data.image_url] : [];
        setImages(loadedImages);

        if (data.variants) {
          setVariantSizes(data.variants.sizes || []);
          setVariantColors(data.variants.colors || []);
          setVariantOthers(data.variants.others || []);
        }
      }
      setInitialLoading(false);
    }

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const handleGenerateSku = () => {
    const prefix = category === 'luxury_watches' ? 'WCH' : 'GFT';
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    setSku(`${prefix}-${randomHex}`);
  };

  const handleAddDenomination = () => {
    const cardVal = parseFloat(newCardValue);
    const sellPrice = parseFloat(newSellingPrice);

    if (isNaN(cardVal) || isNaN(sellPrice) || cardVal <= 0 || sellPrice <= 0) {
      alert('Please enter valid numeric amounts for Card Value and Selling Price.');
      return;
    }

    setDenominations((prev) => [...prev, { card_value: cardVal, selling_price: sellPrice }]);
    setNewCardValue('');
    setNewSellingPrice('');
  };

  const handleRemoveDenomination = (index: number) => {
    setDenominations((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setErrorMessage('');

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `catalog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) {
          const reader = new FileReader();
          await new Promise<void>((resolve) => {
            reader.onloadend = () => {
              if (reader.result) uploadedUrls.push(reader.result as string);
              resolve();
            };
            reader.readAsDataURL(file);
          });
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('products')
            .getPublicUrl(filePath);

          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Image upload failed.');
    } finally {
      setUploadingImages(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSize = () => {
    if (variantSizeInput.trim() && !variantSizes.includes(variantSizeInput.trim())) {
      setVariantSizes([...variantSizes, variantSizeInput.trim()]);
      setVariantSizeInput('');
    }
  };

  const handleAddColor = () => {
    if (variantColorInput.trim() && !variantColors.includes(variantColorInput.trim())) {
      setVariantColors([...variantColors, variantColorInput.trim()]);
      setVariantColorInput('');
    }
  };

  const handleAddOther = () => {
    if (variantOtherInput.trim() && !variantOthers.includes(variantOtherInput.trim())) {
      setVariantOthers([...variantOthers, variantOtherInput.trim()]);
      setVariantOtherInput('');
    }
  };

  // Update Submit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!productName.trim()) {
      setErrorMessage('Product Name is required.');
      return;
    }

    const calculatedPrice = price 
      ? parseFloat(price) 
      : denominations.length > 0 
      ? denominations[0].selling_price 
      : 0;

    if (calculatedPrice <= 0) {
      setErrorMessage('Please specify a base price or at least one Card Value tier.');
      return;
    }

    const finalImages = [...images];
    if (imageUrlInput.trim()) {
      finalImages.push(imageUrlInput.trim());
    }

    if (finalImages.length === 0) {
      setErrorMessage('Please provide at least one product image.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: productName.trim(),
        category,
        badge: badge || null,
        description: description.trim(),
        price: calculatedPrice,
        denominations: denominations,
        discount_percentage: parseFloat(discount) || 0,
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        sku: sku.trim() || `SKU-${Date.now().toString().slice(-6)}`,
        status,
        image_url: finalImages[0] || '',
        images: finalImages,
        variants: {
          sizes: variantSizes,
          colors: variantColors,
          others: variantOthers,
        },
      };

      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId);

      if (error) throw error;

      alert(`Product "${productName}" updated successfully!`);
      router.push('/admin/products');
      router.refresh();
    } catch (err: any) {
      console.error('Update error:', err);
      setErrorMessage(err.message || 'Database update failed.');
    } finally {
      setSaving(false);
    }
  };

  const badgeOptions = [
    { label: 'None', value: '', icon: Ban, color: 'text-zinc-500' },
    { label: 'Luxury', value: 'luxury', icon: Crown, color: 'text-[#f5a600]' },
    { label: 'Best Seller', value: 'bestseller', icon: Flame, color: 'text-blue-400' },
    { label: 'Most Popular', value: 'most_popular', icon: Star, color: 'text-amber-400' },
  ];

  if (initialLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#f5a600]" />
        <p className="text-xs font-mono text-zinc-400">Loading product record...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl pb-16 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-800 gap-4">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition font-mono mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#f5a600] font-bold">
              CATALOG EDITOR
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Edit Product
          </h1>
        </div>

        {/* Status Switch */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl self-start sm:self-auto">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 pl-2">
            Status:
          </span>
          <button
            type="button"
            onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1.5 ${
              status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`} />
            <span>{status.toUpperCase()}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleUpdateSubmit} className="space-y-8">
        
        {/* 1. GENERAL DETAILS */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
            <Package className="w-4 h-4 text-[#f5a600]" />
            <h2 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              1. General Details
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Product name"
                className="w-full text-xs p-3.5 bg-black/60 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-[#f5a600] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-3.5 bg-black/60 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-[#f5a600] transition cursor-pointer"
                >
                  <option value="gift_cards">Gift Cards</option>
                  <option value="luxury_watches">Luxury Watches</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                    SKU
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[10px] text-[#f5a600] hover:underline font-mono inline-flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="SKU"
                  className="w-full text-xs p-3.5 bg-black/60 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600] transition"
                />
              </div>
            </div>

            {/* BADGE SELECTION */}
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-300 block font-bold">
                Showcase Badge (Homepage Tag)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {badgeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = badge === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setBadge(opt.value)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-mono font-bold uppercase transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#f5a600] text-black border-[#f5a600] shadow-md shadow-amber-500/20'
                          : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : opt.color}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description..."
                className="w-full text-xs p-3.5 bg-black/60 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-[#f5a600] transition"
              />
            </div>
          </div>
        </div>

        {/* 2. CARD VALUES & SELLING PRICES */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800/80 gap-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#f5a600]" />
              <h2 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                2. Card Value &amp; Selling Price Tiers
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#f5a600] font-bold">
              {denominations.length} Active Tiers
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-black/40 border border-zinc-800 rounded-2xl">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Face Card Value ($) *
              </label>
              <input
                type="number"
                step="any"
                value={newCardValue}
                onChange={(e) => setNewCardValue(e.target.value)}
                placeholder="e.g. 50"
                className="w-full text-xs p-3 bg-black border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600]"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="any"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(e.target.value)}
                placeholder="e.g. 47.50"
                className="w-full text-xs p-3 bg-black border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddDenomination}
                className="w-full py-3 px-4 bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Tier</span>
              </button>
            </div>
          </div>

          {denominations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {denominations.map((item, idx) => {
                const discountPct = item.card_value > item.selling_price
                  ? Math.round(((item.card_value - item.selling_price) / item.card_value) * 100)
                  : 0;

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-zinc-800 bg-zinc-950/80 flex items-center justify-between group hover:border-zinc-700 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-white font-bold font-mono text-sm">
                          ${item.card_value}
                        </span>
                        {discountPct > 0 && (
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#f5a600] font-mono font-bold">
                        Sell: ${item.selling_price.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveDenomination(idx)}
                      className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. BASE PRICING & INVENTORY */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
            <DollarSign className="w-4 h-4 text-[#f5a600]" />
            <h2 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              3. Base Price &amp; Stock
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Default Price (USD)
              </label>
              <div className="relative">
                <span className="text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="9.50"
                  className="w-full pl-8 pr-4 py-3.5 text-xs bg-black/60 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600] transition font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="0"
                  className="w-full pr-8 pl-4 py-3.5 text-xs bg-black/60 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600] transition"
                />
                <span className="text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs">%</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="100"
                className="w-full p-3.5 text-xs bg-black/60 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600] transition"
              />
            </div>
          </div>
        </div>

        {/* 4. PRODUCT IMAGES */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#f5a600]" />
              <h2 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                4. Product Images *
              </h2>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              {images.length} Images
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-[#f5a600]" />
                Option A: Upload Files From Computer
              </span>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                disabled={uploadingImages}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-700 hover:border-[#f5a600] bg-zinc-900/80 text-zinc-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#f5a600]" />
                    <span>Uploading Images...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-[#f5a600]" />
                    <span>Browse &amp; Select Additional Files</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-zinc-800">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-[#f5a600]" />
                Option B: Paste Direct Image URL
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 text-xs p-3 bg-black border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-[#f5a600]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-mono font-bold transition shrink-0 cursor-pointer"
                >
                  Add Link
                </button>
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-xl border border-zinc-800 bg-black/90 p-1 overflow-hidden aspect-square flex items-center justify-center">
                  <img
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-600/90 text-white rounded-md opacity-0 group-hover:opacity-100 transition shadow-lg cursor-pointer"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#f5a600] text-black text-[9px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. VARIANTS */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800/80">
            <Layers className="w-4 h-4 text-[#f5a600]" />
            <h2 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
              5. Product Variants (Size / Color / Other)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#f5a600] block font-bold">
                Sizes (e.g. 40mm, 41mm)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variantSizeInput}
                  onChange={(e) => setVariantSizeInput(e.target.value)}
                  placeholder="Enter size..."
                  className="flex-1 text-xs p-2 bg-black border border-zinc-800 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-white font-mono cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {variantSizes.map((sz, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-200">
                    {sz}
                    <button type="button" onClick={() => setVariantSizes(variantSizes.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#f5a600] block font-bold">
                Colors (e.g. Gold, Black Dial)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variantColorInput}
                  onChange={(e) => setVariantColorInput(e.target.value)}
                  placeholder="Enter color..."
                  className="flex-1 text-xs p-2 bg-black border border-zinc-800 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-white font-mono cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {variantColors.map((col, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-200">
                    {col}
                    <button type="button" onClick={() => setVariantColors(variantColors.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-zinc-800">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#f5a600] block font-bold">
                Other Attributes
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={variantOtherInput}
                  onChange={(e) => setVariantOtherInput(e.target.value)}
                  placeholder="Enter attribute..."
                  className="flex-1 text-xs p-2 bg-black border border-zinc-800 rounded-lg text-white"
                />
                <button
                  type="button"
                  onClick={handleAddOther}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs rounded-lg text-white font-mono cursor-pointer"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-8">
                {variantOthers.map((oth, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-zinc-800 border border-zinc-700 text-zinc-200">
                    {oth}
                    <button type="button" onClick={() => setVariantOthers(variantOthers.filter((_, idx) => idx !== i))} className="text-zinc-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-6 py-4 rounded-2xl border border-zinc-800 text-xs font-mono font-bold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-10 py-4 rounded-2xl bg-[#f5a600] hover:bg-[#d99200] text-black font-extrabold text-xs uppercase tracking-widest transition flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{saving ? 'Updating Product...' : 'Save Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}