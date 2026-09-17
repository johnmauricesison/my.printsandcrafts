import React, { useState, useRef, useEffect } from 'react';
import type { Product, StoreSettings } from '../types';
import { X, Upload, Plus, Download } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  categories: string[];
  settings: StoreSettings;
  onSaveProduct: (productData: Partial<Product>) => void;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onAddCategory: (categoryName: string) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  categories,
  settings,
  onSaveProduct,
  onSaveSettings,
  onAddCategory,
  onExportData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'product' | 'settings'>('product');

  // Product Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Stickers');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [price, setPrice] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<Product['status']>('Available');
  const [tag, setTag] = useState('');

  // Store Settings Form State
  const [storeName, setStoreName] = useState(settings.storeName);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [contactMessenger, setContactMessenger] = useState(settings.contactMessenger);
  const [contactInstagram, setContactInstagram] = useState(settings.contactInstagram);
  const [adminPin, setAdminPin] = useState(settings.adminPin);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (productToEdit) {
      setTitle(productToEdit.title);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setDescription(productToEdit.description);
      setImageUrl(productToEdit.imageUrl);
      setStatus(productToEdit.status);
      setTag(productToEdit.tag || '');
      setActiveTab('product');
    } else {
      resetProductForm();
    }
  }, [productToEdit, isOpen]);

  useEffect(() => {
    setStoreName(settings.storeName);
    setOwnerName(settings.ownerName);
    setTagline(settings.tagline);
    setContactMessenger(settings.contactMessenger);
    setContactInstagram(settings.contactInstagram);
    setAdminPin(settings.adminPin);
  }, [settings]);

  const resetProductForm = () => {
    setTitle('');
    setCategory(categories[0] || 'Stickers');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setStatus('Available');
    setTag('');
    setShowNewCatInput(false);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image file size is too large! Please choose an image smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setCategory(newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCatInput(false);
    }
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a product title!');
      return;
    }
    if (price === '' || isNaN(Number(price))) {
      alert('Please enter a valid price!');
      return;
    }

    onSaveProduct({
      id: productToEdit ? productToEdit.id : undefined,
      title,
      category,
      price: Number(price),
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80',
      status,
      tag: tag || undefined,
    });

    resetProductForm();
    onClose();
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      storeName,
      ownerName,
      tagline,
      contactMessenger,
      contactInstagram,
      adminPin,
    });
    alert('Store Settings saved successfully! 💕');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-2xl bg-[#FFFDF9] rounded-3xl border border-[#EFE6D8] shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col">
        {/* Admin Modal Header Tabs */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EBE6] bg-[#FAF6F0]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('product')}
              className={`font-cute text-xs sm:text-sm px-4 py-2 rounded-full transition-all ${
                activeTab === 'product'
                  ? 'bg-[#523B36] text-[#FAF6F0] shadow-xs'
                  : 'text-[#7D685C] hover:bg-[#F3EBE0]'
              }`}
            >
              {productToEdit ? 'Edit Product ✏️' : 'Add New Product 🌸'}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`font-cute text-xs sm:text-sm px-4 py-2 rounded-full transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#523B36] text-[#FAF6F0] shadow-xs'
                  : 'text-[#7D685C] hover:bg-[#F3EBE0]'
              }`}
            >
              Store & PIN Settings ⚙️
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#F3EBE0] text-[#7D685C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'product' ? (
            /* Product Add/Edit Form */
            <form onSubmit={handleProductSubmit} className="space-y-4">
              {/* Product Photo Upload */}
              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-2">
                  Product Image (Upload Photo or Paste URL)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D8]">
                  <div className="w-24 h-24 rounded-xl bg-[#FFFDF9] border border-[#EFE6D8] overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl text-[#99827F]">📷</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#FFFDF9] hover:bg-[#FAF3EA] text-[#523B36] border border-[#EFE6D8] font-cute text-xs py-2 rounded-xl flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Upload className="w-4 h-4 text-[#D98A6C]" />
                      <span>Upload Photo from Computer</span>
                    </button>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Or paste image URL (https://...)"
                      className="w-full bg-[#FFFDF9] border border-[#EFE6D8] rounded-xl px-3 py-1.5 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Pastel Floral Sticker Pack"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs sm:text-sm font-sans-cute outline-none focus:border-[#D98A6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Price (₱) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="85"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs sm:text-sm font-sans-cute outline-none focus:border-[#D98A6C]"
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider">
                    Category *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewCatInput(!showNewCatInput)}
                    className="text-[11px] font-cute text-[#D98A6C] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showNewCatInput ? 'Cancel' : '+ New Category'}</span>
                  </button>
                </div>

                {showNewCatInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Keychains"
                      className="flex-1 bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-1.5 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="bg-[#523B36] text-white text-xs font-cute px-3 py-1.5 rounded-xl"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs sm:text-sm font-sans-cute outline-none focus:border-[#D98A6C]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Status & Cute Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Product['status'])}
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                  >
                    <option value="Available">Available</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="Limited">Limited</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Cute Tag Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. Handmade 💕, Best Seller 🔥"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your craft, materials used, size, or custom options..."
                  className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs sm:text-sm font-sans-cute outline-none focus:border-[#D98A6C]"
                ></textarea>
              </div>

              {/* Save Product Submit */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-cute text-[#7D685C] hover:bg-[#FAF6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#D98A6C] hover:bg-[#c67659] text-white text-xs font-cute font-medium px-6 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95"
                >
                  {productToEdit ? 'Update Product' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          ) : (
            /* Store & Backup Settings Form */
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                  Store Title
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                />
              </div>

              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                  Owner Subtitle
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                />
              </div>

              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                  Bio / Tagline
                </label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Messenger Order Link
                  </label>
                  <input
                    type="text"
                    value={contactMessenger}
                    onChange={(e) => setContactMessenger(e.target.value)}
                    placeholder="https://m.me/yourname"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                    Instagram Profile Link
                  </label>
                  <input
                    type="text"
                    value={contactInstagram}
                    onChange={(e) => setContactInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourname"
                    className="w-full bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cute text-[#7D685C] uppercase tracking-wider mb-1">
                  Owner Admin PIN Code (Default: 1234)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full max-w-xs bg-[#FAF6F0] border border-[#EFE6D8] rounded-xl px-3 py-2 text-xs font-sans-cute outline-none focus:border-[#D98A6C]"
                />
              </div>

              {/* Data Backup & Restore */}
              <div className="pt-4 border-t border-[#F5EBE6] space-y-3">
                <h4 className="text-xs font-cute text-[#7D685C] uppercase tracking-wider">
                  Backup & Data Management
                </h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onExportData}
                    className="flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#F3EBE0] text-[#523B36] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs font-cute"
                  >
                    <Download className="w-4 h-4 text-[#D98A6C]" />
                    <span>Export Product JSON Backup</span>
                  </button>

                  <input
                    type="file"
                    ref={importInputRef}
                    onChange={onImportData}
                    accept=".json"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => importInputRef.current?.click()}
                    className="flex items-center gap-1.5 bg-[#FAF6F0] hover:bg-[#F3EBE0] text-[#523B36] border border-[#EFE6D8] px-3.5 py-2 rounded-xl text-xs font-cute"
                  >
                    <Upload className="w-4 h-4 text-[#D98A6C]" />
                    <span>Import Products JSON</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="bg-[#523B36] hover:bg-[#3D2B27] text-white text-xs font-cute font-medium px-6 py-2.5 rounded-xl shadow-xs"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
