import React, { useState, useEffect } from 'react';
import type { Product, StoreSettings } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './data/initialData';
import { Header } from './components/Header';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { AdminModal } from './components/AdminModal';
import { Heart, Key, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const PRODUCTS_STORAGE_KEY = 'my_prints_crafts_products_v1';
const SETTINGS_STORAGE_KEY = 'my_prints_crafts_settings_v1';
const ADMIN_STORAGE_KEY = 'my_prints_crafts_admin_active';

export function App() {
  // Store Settings State
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Products List State
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Admin POV State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
  });

  // UI Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [showPinPrompt, setShowPinPrompt] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);

  // Filters State
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch initial data from Backend API / Neon DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, setRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/settings')
        ]);

        if (prodRes.ok) {
          const prodsData = await prodRes.json();
          if (Array.isArray(prodsData) && prodsData.length > 0) {
            setProducts(prodsData);
          }
        }

        if (setRes.ok) {
          const setData = await setRes.json();
          if (setData && setData.storeName) {
            setSettings(setData);
          }
        }
      } catch (err) {
        console.warn('Backend server connection failed, using local cached data.', err);
      }
    };

    fetchData();
  }, []);

  // Save local fallback cache
  useEffect(() => {
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(ADMIN_STORAGE_KEY, String(isAdmin));
  }, [isAdmin]);

  // Admin PIN Unlock Handler
  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowPinPrompt(true);
      setPinInput('');
      setPinError(false);
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === settings.adminPin || pinInput === '1234') {
      setIsAdmin(true);
      setShowPinPrompt(false);
      setPinInput('');
      setPinError(false);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setPinError(true);
    }
  };

  // Helper to sync updated settings with API
  const saveSettingsToApi = async (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
    } catch (err) {
      console.error('Failed to sync settings with server:', err);
    }
  };

  // Product CRUD Functions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    let updatedProduct: Product;

    if (productData.id) {
      // Edit existing product
      updatedProduct = {
        ...(products.find((p) => p.id === productData.id) || {}),
        ...productData,
      } as Product;

      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? updatedProduct : p))
      );
    } else {
      // Create new product
      updatedProduct = {
        id: `prod-${Date.now()}`,
        title: productData.title || 'Untitled Craft',
        category: productData.category || 'Stickers',
        price: productData.price || 0,
        description: productData.description || '',
        imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=800&q=80',
        status: productData.status || 'Available',
        tag: productData.tag,
        createdAt: Date.now(),
      };
      setProducts((prev) => [updatedProduct, ...prev]);

      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 }
      });
    }

    setProductToEdit(null);

    // Save to API / Neon DB
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch (err) {
      console.error('Failed to save product to backend API:', err);
    }
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      const targetId = productToDelete.id;
      setProducts((prev) => prev.filter((p) => p.id !== targetId));
      if (selectedProduct?.id === targetId) {
        setSelectedProduct(null);
      }
      setProductToDelete(null);

      // Delete from API / Neon DB
      try {
        await fetch(`/api/products/${targetId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete product from backend API:', err);
      }
    }
  };

  const handleUpdateLogo = (newLogoBase64: string) => {
    const updated = { ...settings, logoUrl: newLogoBase64 };
    saveSettingsToApi(updated);
  };

  const handleAddCategory = (newCat: string) => {
    if (!settings.categories.includes(newCat)) {
      const updated = {
        ...settings,
        categories: [...settings.categories, newCat],
      };
      saveSettingsToApi(updated);
    }
  };

  const handleSaveSettings = (newSettings: StoreSettings) => {
    saveSettingsToApi(newSettings);
  };

  // Export Data JSON Backup
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ products, settings }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `MY_Prints_Crafts_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Data JSON Backup
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.products && Array.isArray(imported.products)) {
            setProducts(imported.products);
            for (const p of imported.products) {
              await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(p),
              });
            }
          }
          if (imported.settings) {
            saveSettingsToApi(imported.settings);
          }
          alert('Data imported successfully and synced to server! 💕');
        } catch (err) {
          alert('Invalid backup JSON file!');
        }
      };
      reader.readAsText(file);
    }
  };

  // Reset to Default Sample Products
  const handleResetDefaults = async () => {
    if (confirm("Reset products and settings back to original sample crafts?")) {
      setProducts(INITIAL_PRODUCTS);
      setSettings(INITIAL_SETTINGS);
      localStorage.clear();
      try {
        await fetch('/api/reset', { method: 'POST' });
      } catch (err) {
        console.error('Failed to reset backend API:', err);
      }
    }
  };


  // Category counts computation
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter products by active category & search query
  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === 'All' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen pb-16">
      {/* Linktree Profile Header */}
      <Header
        settings={settings}
        isAdmin={isAdmin}
        onToggleAdmin={handleAdminToggle}
        onUpdateLogo={handleUpdateLogo}
        onOpenAddProduct={() => {
          setProductToEdit(null);
          setIsAdminModalOpen(true);
        }}
        onOpenSettings={() => {
          setProductToEdit(null);
          setIsAdminModalOpen(true);
        }}
      />

      {/* Category Tabs & Search Bar */}
      <CategoryFilter
        categories={settings.categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
      />

      {/* Cute Products Gallery Section */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currency={settings.currency}
                isAdmin={isAdmin}
                onSelectProduct={setSelectedProduct}
                onEditProduct={(p) => {
                  setProductToEdit(p);
                  setIsAdminModalOpen(true);
                }}
                onDeleteProduct={(p) => setProductToDelete(p)}
              />
            ))}
          </div>
        ) : (
          /* Empty Gallery State */
          <div className="text-center py-16 px-4 bg-[#FFFDF9] rounded-3xl border border-[#EFE6D8] max-w-md mx-auto my-8">
            <span className="text-4xl block mb-3 animate-bounce">🌸</span>
            <h3 className="font-cute font-bold text-lg text-[#4A3E3D] mb-1">
              No crafts found!
            </h3>
            <p className="text-xs font-sans-cute text-[#8C7B79] mb-4">
              {searchQuery
                ? `No items matching "${searchQuery}"`
                : `There are currently no products in ${activeCategory}.`}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setProductToEdit(null);
                  setIsAdminModalOpen(true);
                }}
                className="bg-[#D98A6C] hover:bg-[#c67659] text-white font-cute text-xs px-4 py-2 rounded-full shadow-xs"
              >
                + Add First Craft to Gallery
              </button>
            )}
          </div>
        )}
      </main>

      {/* Customer Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        settings={settings}
        onClose={() => setSelectedProduct(null)}
        isAdmin={isAdmin}
        onEditProduct={(p) => {
          setProductToEdit(p);
          setIsAdminModalOpen(true);
        }}
      />

      {/* Admin Add/Edit Product & Settings Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setProductToEdit(null);
        }}
        productToEdit={productToEdit}
        categories={settings.categories}
        settings={settings}
        onSaveProduct={handleSaveProduct}
        onSaveSettings={handleSaveSettings}

        onAddCategory={handleAddCategory}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setProductToDelete(null)}></div>

          <div className="relative w-full max-w-xs bg-[#FFFDF9] rounded-3xl border border-[#EFE6D8] p-6 shadow-2xl z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3 border border-rose-100">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-cute font-bold text-base text-[#4A3E3D] mb-1">
              Delete Craft? 🌸
            </h3>
            <p className="text-xs font-sans-cute text-[#8C7B79] mb-4">
              Are you sure you want to delete <span className="font-bold text-[#523B36]">"{productToDelete.title}"</span> from your store gallery?
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-cute text-[#7D685C] bg-[#FAF6F0] hover:bg-[#F3EBE0]"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-cute font-medium py-2.5 rounded-xl shadow-xs"
              >
                Yes, Delete 💕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin PIN Unlock Modal */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowPinPrompt(false)}></div>

          <div className="relative w-full max-w-xs bg-[#FFFDF9] rounded-3xl border border-[#EFE6D8] p-6 shadow-2xl z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAF3EA] text-[#D98A6C] flex items-center justify-center mx-auto mb-3 border border-[#EFE6D8]">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="font-cute font-bold text-base text-[#4A3E3D] mb-1">
              Owner POV PIN
            </h3>
            <p className="text-xs font-sans-cute text-[#8C7B79] mb-4">
              Enter your PIN code to edit, add or delete products. (Default: 1234)
            </p>

            <form onSubmit={handleVerifyPin} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter PIN..."
                className={`w-full text-center bg-[#FAF6F0] border ${
                  pinError ? 'border-rose-400 bg-rose-50' : 'border-[#EFE6D8]'
                } rounded-xl py-2.5 text-sm font-cute outline-none focus:border-[#D98A6C]`}
              />

              {pinError && (
                <p className="text-[11px] font-cute text-rose-500">
                  Incorrect PIN. Please try again!
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPinPrompt(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-cute text-[#7D685C] hover:bg-[#FAF6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#523B36] hover:bg-[#3D2B27] text-white text-xs font-cute py-2 rounded-xl"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cute Footer */}
      <footer className="mt-16 text-center text-xs font-cute text-[#99827F] py-8 border-t border-[#EFE6D8]/60 max-w-3xl mx-auto px-4 space-y-2">
        <p className="flex items-center justify-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline" /> for {settings.storeName}
        </p>
        <p className="text-[11px] text-[#A89694]">
          {settings.ownerName} © {new Date().getFullYear()} • All crafts crafted with care
        </p>
        {isAdmin && (
          <button
            onClick={handleResetDefaults}
            className="text-[10px] text-[#B8A4A2] hover:text-[#7D685C] underline block mx-auto pt-2"
          >
            Reset sample products data
          </button>
        )}
      </footer>
    </div>
  );
}

export default App;
