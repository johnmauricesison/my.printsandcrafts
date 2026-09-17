import React from 'react';
import type { Product } from '../types';
import { Edit3, Trash2, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: string;
  isAdmin: boolean;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isAdmin,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pre-Order':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sold Out':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Limited':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  return (
    <div className="relative group">
      {/* Tape Sticker Effect */}
      <div className="tape-sticker"></div>

      {/* Main Polaroid Card Container */}
      <div 
        onClick={() => onSelectProduct(product)}
        className="polaroid-card cursor-pointer flex flex-col justify-between h-full relative"
      >
        {/* Product Photo View */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#FAF6F0] mb-3 border border-[#EFE6D8]/60">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Quick View Hover Backdrop */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
            <span className="bg-[#FFFDF9]/95 text-[#523B36] font-cute text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <Eye className="w-3.5 h-3.5 text-[#D98A6C]" />
              <span>Quick View</span>
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-cute px-2 py-0.5 rounded-full border shadow-2xs ${getStatusBadgeClass(product.status)}`}>
              {product.status}
            </span>
          </div>

          {/* Custom Decorative Tag Badge */}
          {product.tag && (
            <div className="absolute bottom-2 right-2">
              <span className="text-[10px] font-cute bg-[#FFFDF9]/90 text-[#523B36] px-2 py-0.5 rounded-full border border-[#EFE6D8] shadow-2xs backdrop-blur-xs">
                {product.tag}
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="px-1 flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-cute text-[#99827F] uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            <h3 className="font-cute font-medium text-sm text-[#4A3E3D] line-clamp-2 leading-snug mb-2 group-hover:text-[#D98A6C] transition-colors">
              {product.title}
            </h3>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#F5EBE6]">
            <span className="font-cute font-bold text-base text-[#4A3E3D]">
              {currency}{product.price.toLocaleString()}
            </span>

            <span className="text-[11px] font-cute text-[#D98A6C] group-hover:underline">
              Details →
            </span>
          </div>
        </div>

        {/* Admin POV Quick Action Overlay */}
        {isAdmin && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditProduct(product);
              }}
              className="bg-[#FFFDF9] hover:bg-blue-50 text-blue-600 border border-blue-200 p-1.5 rounded-full shadow-sm transition-colors"
              title="Edit Product"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProduct(product);
              }}
              className="bg-[#FFFDF9] hover:bg-rose-50 text-rose-600 border border-rose-200 p-1.5 rounded-full shadow-sm transition-colors"
              title="Delete Product"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
