import React, { useState, useMemo } from 'react';
import { Product, CategoryType, MoodType } from '../types/cafe';
import { fetchCoffeeProductImage, handleImageError } from '../services/imageService';
import { Search, SlidersHorizontal, Flame, Snowflake, Sparkles, Plus, Check } from 'lucide-react';

interface FullMenuProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  onOpenMoodFinder: () => void;
}

const CATEGORIES: ('All' | CategoryType)[] = [
  'All',
  'Signature Lattes',
  'Espresso and Coffee',
  'Iced Coffee',
  'Tea and Matcha',
  'Refreshers and Mocktails',
  'Desserts and Snacks',
  'Seasonal Specials',
];

const MOOD_FILTERS: { id: 'all' | MoodType; label: string }[] = [
  { id: 'all', label: 'All Moods' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'focus', label: 'Focus' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'celebration', label: 'Celebration' },
  { id: 'refresh', label: 'Refresh' },
  { id: 'treat', label: 'Little Treat' },
];

export const FullMenu: React.FC<FullMenuProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
  onOpenMoodFinder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'All' | CategoryType>('All');
  const [selectedMood, setSelectedMood] = useState<'all' | MoodType>('all');
  const [tempFilter, setTempFilter] = useState<'all' | 'hot' | 'iced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Mood filter
      if (selectedMood !== 'all' && !item.moodTags.includes(selectedMood)) {
        return false;
      }

      // Temp filter
      if (tempFilter !== 'all') {
        if (item.tempOption !== 'both' && item.tempOption !== tempFilter) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesIngredients = item.ingredients.some(i => i.toLowerCase().includes(q));
        const matchesNotes = item.flavorNotes.some(n => n.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesIngredients && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, selectedMood, tempFilter, searchQuery]);

  const handleQuickAddClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    onQuickAdd(product);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 1000);
  };

  return (
    <section id="menu-section" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
            Specialty Roastery & Mixology Bar
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F8F6F2] mt-1">
            The Complete Menu
          </h2>
          <p className="text-sm text-[#B6BAC7] mt-2 max-w-xl leading-relaxed">
            Every drink is formulated around an intentional sensory balance. Explore by category, temperature, or filter directly by how you wish to feel.
          </p>
        </div>

        {/* Mood Discovery banner button */}
        <div className="shrink-0">
          <button
            onClick={onOpenMoodFinder}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E6A85C]/15 border border-[#E6A85C]/40 text-[#E6A85C] hover:bg-[#E6A85C] hover:text-[#10172A] rounded-xl text-xs font-medium transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Not sure what to choose? Find Your Mood</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="py-6 space-y-4">
        {/* Search & Temp Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B6BAC7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by beverage, note, or ingredient (e.g. vanilla, caramel, matcha)..."
              className="w-full bg-[#1E293B]/70 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#E6A85C] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#B6BAC7] hover:text-[#F8F6F2]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Temperature Segmented Controls */}
          <div className="flex items-center gap-1 p-1 bg-[#1E293B]/70 border border-white/10 rounded-xl self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setTempFilter('all')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                tempFilter === 'all'
                  ? 'bg-white/15 text-[#F8F6F2] font-medium'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
              }`}
            >
              All Temps
            </button>
            <button
              onClick={() => setTempFilter('hot')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                tempFilter === 'hot'
                  ? 'bg-[#E6A85C] text-[#10172A] font-semibold'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Hot Only</span>
            </button>
            <button
              onClick={() => setTempFilter('iced')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                tempFilter === 'iced'
                  ? 'bg-[#60A5FA] text-[#10172A] font-semibold'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
              }`}
            >
              <Snowflake className="w-3 h-3" />
              <span>Iced Only</span>
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 text-xs rounded-lg transition-all ${
                  isSelected
                    ? 'bg-[#F8F6F2] text-[#10172A] font-medium shadow-md'
                    : 'text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Mood Tags Pill-Free Filter */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs text-[#B6BAC7] pt-1">
          <span className="shrink-0 text-[11px] uppercase tracking-wider text-[#B6BAC7]">Mood Filter:</span>
          {MOOD_FILTERS.map((mf) => {
            const isActive = selectedMood === mf.id;
            return (
              <button
                key={mf.id}
                onClick={() => setSelectedMood(mf.id)}
                className={`whitespace-nowrap px-2.5 py-1 text-xs rounded transition-colors ${
                  isActive
                    ? 'text-[#E6A85C] bg-[#E6A85C]/15 font-medium'
                    : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                }`}
              >
                {mf.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-[#B6BAC7] bg-white/5 rounded-2xl border border-white/5">
          <p className="text-sm">No drinks match your current filter combination.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedMood('all');
              setTempFilter('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-[#E6A85C] hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {filteredProducts.map((product) => {
            const studioImage = fetchCoffeeProductImage(product);
            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="group cursor-pointer rounded-2xl border border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/20 transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Image with subtle hover zoom */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#10172A]">
                  <img
                    src={studioImage.src}
                    alt={studioImage.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => handleImageError(e, studioImage.fallbackSrc, studioImage.staticPath)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10172A]/85 via-transparent to-transparent" />

                  {/* Mood Tag */}
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#10172A]/85 text-[#E6A85C] border border-[#E6A85C]/30 backdrop-blur-none">
                    {product.moodTags[0]}
                  </div>

                  {/* Studio Lighting Spec Badge */}
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded text-[9px] font-mono text-[#B6BAC7] bg-[#10172A]/85 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    Studio Lit · 3200K
                  </div>

                {/* Temperature Indicator */}
                <div className="absolute top-3 right-3 text-xs text-[#F8F6F2] bg-[#10172A]/85 px-2 py-0.5 rounded border border-white/10 flex items-center gap-1">
                  {product.tempOption === 'iced' ? (
                    <>
                      <Snowflake className="w-3 h-3 text-[#60A5FA]" />
                      <span className="text-[10px]">Iced</span>
                    </>
                  ) : product.tempOption === 'hot' ? (
                    <>
                      <Flame className="w-3 h-3 text-[#E6A85C]" />
                      <span className="text-[10px]">Hot</span>
                    </>
                  ) : (
                    <span className="text-[10px]">Hot / Iced</span>
                  )}
                </div>

                {/* Price pill */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#10172A]/90 rounded-lg text-xs font-mono font-semibold text-[#F8F6F2] border border-white/10">
                  ${product.price.toFixed(2)}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-[#B6BAC7] uppercase tracking-wider mb-1">
                    {product.category}
                  </div>
                  <h3 className="text-lg font-serif font-medium text-[#F8F6F2] group-hover:text-[#E6A85C] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-[#B6BAC7] mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Flavor Notes & Quick Actions */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-[#B6BAC7] overflow-hidden">
                    <span className="truncate">{product.flavorNotes.slice(0, 2).join(' · ')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleQuickAddClick(e, product)}
                      className={`p-2 rounded-lg text-xs transition-colors ${
                        quickAddedId === product.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/10 hover:bg-[#E6A85C] hover:text-[#10172A] text-[#F8F6F2]'
                      }`}
                      title="Quick Add standard beverage"
                    >
                      {quickAddedId === product.id ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </section>
  );
};
