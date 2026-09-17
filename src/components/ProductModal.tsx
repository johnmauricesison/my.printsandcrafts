import React, { useState } from 'react';
import type { Product, StoreSettings } from '../types';
import { X, MessageCircle, Share2, Check, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
  isAdmin: boolean;
  onEditProduct: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  settings,
  onClose,
  isAdmin,
  onEditProduct,
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  if (!product) return null;

  const handleHeartClick = () => {
    setLiked(!liked);
    if (!liked) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F2D5CE', '#D98A6C', '#FFFDF9']
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInquiryMessage = () => {
    return encodeURIComponent(
      `Hi M.Y Prints & Crafts! 💕 I'm interested in ordering "${product.title}" (${settings.currency}${product.price}). Is this item available?`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Cute Polaroid Detail Card Container */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl border border-[#EFE6D8] shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5EBE6] bg-[#FAF6F0]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-cute text-[#99827F] uppercase tracking-wider">
              {product.category}
            </span>
            {product.tag && (
              <span className="text-[10px] font-cute bg-[#F2D5CE] text-[#523B36] px-2 py-0.5 rounded-full">
                {product.tag}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-[#F3EBE0] text-[#7D685C] transition-colors"
              title="Share item"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#F3EBE0] text-[#7D685C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Photo Display */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-[#FAF6F0] border border-[#EFE6D8]">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />

            {/* Like Heart Button */}
            <button
              onClick={handleHeartClick}
              className="absolute top-3 right-3 p-2.5 rounded-full bg-[#FFFDF9]/90 text-rose-500 shadow-md backdrop-blur-xs transition-transform active:scale-75"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            {/* Status Pill */}
            <div className="absolute bottom-3 left-3 bg-[#FFFDF9]/90 backdrop-blur-xs text-[#523B36] px-3 py-1 rounded-full text-xs font-cute border border-[#EFE6D8] shadow-xs">
              Status: <span className="font-bold text-[#D98A6C]">{product.status}</span>
            </div>
          </div>

          {/* Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-[#F5EBE6] pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-cute font-bold text-[#4A3E3D] leading-snug">
                {product.title}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-cute font-bold text-[#D98A6C]">
                {settings.currency}{product.price.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Product Story & Description */}
          <div>
            <h4 className="text-xs font-cute text-[#99827F] uppercase tracking-wider mb-2">
              About this craft
            </h4>
            <p className="text-sm font-sans-cute text-[#523B36] leading-relaxed whitespace-pre-line bg-[#FAF6F0] p-4 rounded-2xl border border-[#EFE6D8]/60">
              {product.description || "Handmade with love by M.Y Prints & Crafts. Perfect as a gift or personal treat!"}
            </p>
          </div>

          {/* Customer Order CTA Section */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-cute text-[#7D685C] text-center uppercase tracking-wider">
              Interested in this item? Message us directly to order! 💕
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {settings.contactMessenger && (
                <a
                  href={`${settings.contactMessenger}?text=${getInquiryMessage()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#0084FF] hover:bg-[#0073DF] text-white font-cute text-xs py-3 px-4 rounded-2xl shadow-xs transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Order via Messenger</span>
                </a>
              )}

              {settings.contactInstagram && (
                <a
                  href={settings.contactInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-cute text-xs py-3 px-4 rounded-2xl shadow-xs transition-transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Inquire on Instagram</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Admin Quick Edit Bar inside modal if in Admin mode */}
        {isAdmin && (
          <div className="p-4 bg-[#FAF3EA] border-t border-[#EAE0DB] flex items-center justify-between">
            <span className="text-xs font-cute text-[#7D685C]">Owner Controls</span>
            <button
              onClick={() => {
                onClose();
                onEditProduct(product);
              }}
              className="bg-[#D98A6C] hover:bg-[#c67659] text-white text-xs font-cute px-4 py-2 rounded-xl"
            >
              Edit Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
