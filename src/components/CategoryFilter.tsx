import React from 'react';
import { Search, X } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  categoryCounts,
}) => {
  const getCategoryEmoji = (category: string) => {
    switch (category.toLowerCase()) {
      case 'all':
        return '✨';
      case 'stickers':
        return '🌸';
      case 'badge pins':
        return '📌';
      case 'flowers':
        return '💐';
      case 'other crafts':
        return '🎨';
      default:
        return '🎀';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-6 space-y-4">
      {/* Search Input Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#99827F]">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search stickers, pins, flowers & crafts..."
          className="w-full bg-[#FFFDF9] text-[#4A3E3D] placeholder-[#A39290] border border-[#EFE6D8] focus:border-[#D98A6C] focus:ring-2 focus:ring-[#F2D5CE]/50 rounded-full pl-10 pr-10 py-2.5 text-xs sm:text-sm font-sans-cute shadow-2xs transition-all outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#99827F] hover:text-[#4A3E3D]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth">
        {['All', ...categories].map((category) => {
          const isActive = activeCategory === category;
          const count = categoryCounts[category] || 0;

          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-cute whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? 'bg-[#523B36] text-[#FAF6F0] border-[#523B36] shadow-sm transform -translate-y-0.5'
                  : 'bg-[#FFFDF9] text-[#6E5A58] border-[#EFE6D8] hover:border-[#DCC8B4] hover:bg-[#FAF3EA]'
              }`}
            >
              <span>{getCategoryEmoji(category)}</span>
              <span>{category}</span>
              <span
                className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-[#735A55] text-white' : 'bg-[#FAF3EA] text-[#8C7B79]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
