import React, { useRef } from 'react';
import type { StoreSettings } from '../types';
import { 
  ShoppingBag, 
  MessageCircle, 
  Camera, 
  Sparkles, 
  Lock, 
  Unlock,
  PlusCircle,
  Settings
} from 'lucide-react';

interface HeaderProps {
  settings: StoreSettings;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  onUpdateLogo: (newLogoBase64: string) => void;
  onOpenAddProduct: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  isAdmin,
  onToggleAdmin,
  onUpdateLogo,
  onOpenAddProduct,
  onOpenSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert("Image size is a bit large! Please select an image under 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateLogo(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current text-[#E4405F]" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current text-[#1877F2]" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'tiktok':
        return (
          <span className="font-cute font-bold text-[10px] bg-black text-white px-1.5 py-0.5 rounded-md">
            TT
          </span>
        );
      case 'shopee':
        return <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />;
      case 'whatsapp':
      case 'messenger':
        return <MessageCircle className="w-4 h-4 text-[#0084FF]" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#D98A6C]" />;
    }
  };

  return (
    <header className="relative w-full max-w-3xl mx-auto pt-8 pb-6 px-4 text-center">
      {/* Top Admin Status & Toggle Bar */}
      <div className="flex items-center justify-between mb-6 bg-[#FFFDF9]/80 backdrop-blur-sm border border-[#EFE6D8] rounded-full px-4 py-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-xs font-cute font-medium text-[#6E5A58]">
            {isAdmin ? 'Owner Mode (POV Active)' : 'Customer View 💕'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onOpenAddProduct}
                className="flex items-center gap-1.5 bg-[#D98A6C] hover:bg-[#c67659] text-white text-xs font-cute font-medium px-3 py-1.5 rounded-full transition-all shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Item</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center w-8 h-8 bg-[#F5EBE6] hover:bg-[#EAE0DB] text-[#523B36] rounded-full transition-colors"
                title="Store Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={onToggleAdmin}
            className={`flex items-center gap-1.5 text-xs font-cute px-3 py-1.5 rounded-full transition-all border ${
              isAdmin
                ? 'bg-amber-100/80 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-[#FAF3EA] text-[#6E5A58] border-[#EAE0DB] hover:bg-[#F3E7DA]'
            }`}
          >
            {isAdmin ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{isAdmin ? 'Exit Owner' : 'Owner POV'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for Logo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleLogoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Cute Logo Avatar with Decorative Ring */}
      <div className="relative inline-block group mb-4">
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1.5 bg-gradient-to-tr from-[#F2D5CE] via-[#FFFDF9] to-[#E3EBD0] shadow-md transition-transform group-hover:scale-105">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFDF9] border-2 border-[#EFE4D6] flex items-center justify-center relative">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-2 text-center bg-[#FAF3EA] w-full h-full">
                <span className="text-3xl sm:text-4xl">🌸</span>
                <span className="font-cute font-bold text-xs text-[#7D685C] mt-1 line-clamp-1">
                  M.Y Crafts
                </span>
              </div>
            )}

            {/* Logo Upload Hover Overlay for Admin */}
            {isAdmin && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs"
                title="Click to upload your logo"
              >
                <Camera className="w-6 h-6 mb-1 text-white" />
                <span className="text-[10px] font-cute">Change Logo</span>
              </button>
            )}
          </div>
        </div>

        {/* Floating Sparkle Decoration */}
        <div className="absolute -top-1 -right-1 bg-[#FFFDF9] text-amber-500 rounded-full p-1.5 shadow-sm border border-[#EFE6D8] animate-float">
          <Sparkles className="w-4 h-4 fill-amber-400" />
        </div>
      </div>

      {/* Store Title & Subtitle */}
      <div className="space-y-1 mb-3">
        <h1 className="text-2xl sm:text-3xl font-cute font-bold text-[#4A3E3D] tracking-tight">
          {settings.storeName}
        </h1>
        {settings.ownerName && (
          <p className="text-xs sm:text-sm font-serif-cute italic text-[#99827F]">
            {settings.ownerName}
          </p>
        )}
      </div>

      {/* Store Bio Tagline */}
      <p className="max-w-md mx-auto text-xs sm:text-sm text-[#73605E] leading-relaxed font-sans-cute px-4 mb-5">
        {settings.tagline}
      </p>

      {/* Social Media Link Pill Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
        {settings.socialLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#FFFDF9] hover:bg-[#F7EFE6] text-[#523B36] border border-[#EFE6D8] hover:border-[#DCC8B4] px-3.5 py-1.5 rounded-full text-xs font-cute shadow-2xs transition-all transform hover:-translate-y-0.5"
          >
            {getSocialIcon(link.platform)}
            <span>{link.platform}</span>
          </a>
        ))}
      </div>
    </header>
  );
};
