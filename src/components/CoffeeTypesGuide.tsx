/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types/cafe';
import { fetchCoffeeProductImage, StudioImageMetadata } from '../services/imageService';
import { 
  ArrowRight, 
  Sparkles, 
  Coffee, 
  Droplets, 
  Layers, 
  Flame, 
  Snowflake, 
  Check, 
  Camera, 
  Sliders, 
  Maximize2, 
  X,
  Info,
  Cookie
} from 'lucide-react';

interface CoffeeTypesGuideProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export type CoffeeCategoryType = 
  | 'all' 
  | 'concentrated' 
  | 'lattes-microfoam' 
  | 'mochas-sweet' 
  | 'whipped-chilled'
  | 'botanicals-tea'
  | 'bakery-pairings';

interface CoffeeTypeInfo {
  id: string;
  name: string;
  coffeeTypeLabel: string;
  italianOrigin: string;
  category: CoffeeCategoryType;
  categoryLabel: string;
  ratio: {
    espresso: number; // in parts or units
    milk: number;
    foam: number;
  };
  foamTexture: string;
  servingGlass: string;
  idealMoment: string;
  moodTag: string;
  baristaNotes: string;
}

const COFFEE_TYPES_DATA: CoffeeTypeInfo[] = [
  // 1. Concentrated & Pure
  {
    id: 'daily-ritual',
    name: 'The Daily Ritual',
    coffeeTypeLabel: 'Double Espresso (Doppio)',
    italianOrigin: 'Caffè Espresso · Milan',
    category: 'concentrated',
    categoryLabel: 'Concentrated & Pure',
    ratio: { espresso: 2, milk: 0, foam: 0.5 },
    foamTexture: 'Dense 9-Bar Hazelnut Tiger Crema',
    servingGlass: 'Charcoal Matte Demitasse (2.5 oz)',
    idealMoment: 'Intense analytical focus & morning wake-up',
    moodTag: 'Focus',
    baristaNotes: 'Single-origin Ethiopian Yirgacheffe pulled at 9 bars for 27 seconds, yielding bright bergamot and dark cacao finish.',
  },
  {
    id: 'cortado',
    name: 'Artisanal Cortado',
    coffeeTypeLabel: 'Cortado (1:1 Ratio)',
    italianOrigin: 'Café Cortado · Madrid & Basque',
    category: 'concentrated',
    categoryLabel: 'Concentrated & Pure',
    ratio: { espresso: 2, milk: 2, foam: 0.5 },
    foamTexture: '1:1 Silky Microfoam Cutting Acidity',
    servingGlass: 'Faceted Gibraltar Glass (4.5 oz)',
    idealMoment: 'Mid-morning balance between bold espresso and warm cream',
    moodTag: 'Focus & Comfort',
    baristaNotes: 'Double ristretto cut 1:1 with warm textured microfoam to tame acidity while preserving full bean origin character.',
  },

  // 2. Milk & Microfoam
  {
    id: 'flat-white',
    name: 'Velvet Flat White',
    coffeeTypeLabel: 'Flat White (Thin Microfoam)',
    italianOrigin: 'Antipodean Third Wave Roastery',
    category: 'lattes-microfoam',
    categoryLabel: 'Milk & Microfoam Classics',
    ratio: { espresso: 2, milk: 3.5, foam: 0.5 },
    foamTexture: 'Glossy Wet Paint Microfoam with Rosetta Art',
    servingGlass: 'Wide Porcelain Cup & Saucer (6 oz)',
    idealMoment: 'Afternoon creative flow and smooth sipping',
    moodTag: 'Comfort',
    baristaNotes: 'Short double-ristretto with integrated microfoam having zero dry froth, producing an exceptionally creamy mouthfeel.',
  },
  {
    id: 'soft-landing',
    name: 'The Soft Landing',
    coffeeTypeLabel: 'Caffè Latte (Vanilla Bean)',
    italianOrigin: 'Caffè Latte · Italian Riviera',
    category: 'lattes-microfoam',
    categoryLabel: 'Milk & Microfoam Classics',
    ratio: { espresso: 2, milk: 7, foam: 1 },
    foamTexture: 'Velvety Sweet Steamed Milk with Madagascar Vanilla',
    servingGlass: 'Handcrafted Wide Stoneware (12 oz)',
    idealMoment: 'Gentle morning comfort and emotional unwinding',
    moodTag: 'Comfort',
    baristaNotes: 'Gently steamed sweet oat milk folded with whole Madagascar vanilla bean caviar and freshly grated nutmeg.',
  },
  {
    id: 'cappuccino-cinnamon',
    name: 'Cinnamon Halo Cappuccino',
    coffeeTypeLabel: 'Cappuccino Tradizionale (1:1:1)',
    italianOrigin: 'Cappuccino Tradizionale · Turin',
    category: 'lattes-microfoam',
    categoryLabel: 'Milk & Microfoam Classics',
    ratio: { espresso: 2, milk: 2, foam: 2 },
    foamTexture: '1:1:1 Airy Cloud Dome with Ceylon Cinnamon Ring',
    servingGlass: 'Classic Ceramic Cappuccino Bowl (6 oz)',
    idealMoment: 'Slow weekend morning reading and pastry pairing',
    moodTag: 'Treat & Comfort',
    baristaNotes: 'Equilateral third wave ratio of espresso, textured warm milk, and tall aerated cloud foam encircled by aromatic Ceylon cinnamon.',
  },

  // 3. Mochas & Sweet Brews
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    coffeeTypeLabel: 'Salted Caramel Macchiato',
    italianOrigin: 'Caffè Macchiato Freddo Moderno',
    category: 'mochas-sweet',
    categoryLabel: 'Artisanal Mochas & Confections',
    ratio: { espresso: 2, milk: 6, foam: 1 },
    foamTexture: 'Fleur de Sel Caramel Ribbon over Iced Oat Cream',
    servingGlass: 'Fluted Ribbed Highball (12 oz)',
    idealMoment: 'Golden hour milestones and joyful celebrations',
    moodTag: 'Celebration',
    baristaNotes: 'Artisanal kettle caramel made with sea salt, drizzled inside ribbed fluted glassware, topped with espresso and edible gold dust.',
  },
  {
    id: 'velvet-orbit',
    name: 'Velvet Orbit',
    coffeeTypeLabel: 'Spiced Dark Chocolate Mocha',
    italianOrigin: 'Bicerin Torinese di Cioccolato',
    category: 'mochas-sweet',
    categoryLabel: 'Artisanal Mochas & Confections',
    ratio: { espresso: 2, milk: 5, foam: 1.5 },
    foamTexture: '72% Valrhona Ganache Swirl with Crushed Cardamom',
    servingGlass: 'Dark Matte Ceramic Tumbler (10 oz)',
    idealMoment: 'Curious evening indulgence and adventurous evenings',
    moodTag: 'Adventure',
    baristaNotes: 'Single-origin Guatemalan espresso infused with dark 72% Valrhona ganache, freshly ground green cardamom, and blackberry blossom honey.',
  },
  {
    id: 'cocoa-cloud',
    name: 'Cocoa Cloud',
    coffeeTypeLabel: 'Dutch Cocoa Café Mocha',
    italianOrigin: 'Caffè con Cioccolato Artigianale',
    category: 'mochas-sweet',
    categoryLabel: 'Artisanal Mochas & Confections',
    ratio: { espresso: 2, milk: 5, foam: 2 },
    foamTexture: 'Steamed Oat Microfoam Dusted with Cocoa Shavings',
    servingGlass: 'Speckled Earthenware Mug (12 oz)',
    idealMoment: 'Rainy days needing warm chocolate reassurance',
    moodTag: 'Comfort & Treat',
    baristaNotes: 'Slow-simmered Dutch process cocoa with brown butter essence and mellow blonde espresso beneath fluffy marshmallow foam.',
  },

  // 4. Whipped Viennese & Chilled Infusions
  {
    id: 'vienna-coffee',
    name: 'Vienna Coffee (Einspänner)',
    coffeeTypeLabel: 'Einspänner (Cold Whipped Cap)',
    italianOrigin: 'Wiener Melange & Einspänner · Vienna',
    category: 'whipped-chilled',
    categoryLabel: 'Whipped Viennese & Chilled Infusions',
    ratio: { espresso: 2, milk: 0, foam: 3 },
    foamTexture: 'Hand-Whipped Cold Heavy Cream Peak Contrast',
    servingGlass: 'Traditional Handled Glass Cup with Saucer (8 oz)',
    idealMoment: 'Sensual dessert pairing and Viennese coffee house leisure',
    moodTag: 'Celebration & Treat',
    baristaNotes: 'A historic Viennese favorite: piping hot double espresso sweetened with demerara cane sugar beneath a dense blanket of cold whipped cream.',
  },
  {
    id: 'clear-cut',
    name: 'The Clear Cut',
    coffeeTypeLabel: 'Faceted Iced Americano',
    italianOrigin: 'Caffè Americano Ghiacciato',
    category: 'whipped-chilled',
    categoryLabel: 'Whipped Viennese & Chilled Infusions',
    ratio: { espresso: 2, milk: 0, foam: 0 },
    foamTexture: 'Cold Sparkling Spring Extraction with Crystal Ice',
    servingGlass: 'Faceted Diamond Crystal Rocks Glass (10 oz)',
    idealMoment: 'Sharp afternoon clarity and clean hydration',
    moodTag: 'Focus & Refresh',
    baristaNotes: 'Double shot of cold-pulled dark espresso extracted over crystal-clear diamond ice cubes and chilled sparkling mineral water.',
  },
  {
    id: 'mint-condition',
    name: 'Mint Condition',
    coffeeTypeLabel: 'Spearmint Nitro Cold Brew',
    italianOrigin: 'Caffè Freddo Botanico',
    category: 'whipped-chilled',
    categoryLabel: 'Whipped Viennese & Chilled Infusions',
    ratio: { espresso: 3, milk: 0, foam: 1.5 },
    foamTexture: 'Cascading Velvety Coconut Cold Foam Infusion',
    servingGlass: 'Sleek Straight Highball (12 oz)',
    idealMoment: 'Post-workout clarity or warm summer afternoon refresh',
    moodTag: 'Refresh & Focus',
    baristaNotes: '24-hour slow steeped cold brew infused with organic garden spearmint and pressurized with pure nitrogen for a velvety head.',
  },
  {
    id: 'wild-card',
    name: 'The Wild Card',
    coffeeTypeLabel: 'Salted Pistachio Cold Brew',
    italianOrigin: 'Caffè Modernista Sperimentale',
    category: 'whipped-chilled',
    categoryLabel: 'Whipped Viennese & Chilled Infusions',
    ratio: { espresso: 3, milk: 0, foam: 2 },
    foamTexture: 'Salted Bronte Pistachio Cream Foam Cap',
    servingGlass: 'Modern Ribbed Rocks Glass (10 oz)',
    idealMoment: 'Adventurous palate cravings and afternoon pick-me-up',
    moodTag: 'Adventure',
    baristaNotes: 'Smoked French lavender infused cold brew crowned with hand-aerated Sicilian pistachio sweet cream and flaky sea salt.',
  },

  // 5. Botanicals & Ceremonial Tea
  {
    id: 'kyoto-cloud-matcha',
    name: 'Kyoto Cloud Matcha',
    coffeeTypeLabel: 'Ceremonial Matcha Latte',
    italianOrigin: 'Kyoto Ceremonial Tea Meets Modern Café',
    category: 'botanicals-tea',
    categoryLabel: 'Botanicals & Ceremonial Tea',
    ratio: { espresso: 0, milk: 6, foam: 2 },
    foamTexture: 'Stone-Ground Uji Froth with Sea Salt Cream Cap',
    servingGlass: 'Ribbed Modern Japanese Glassware (10 oz)',
    idealMoment: 'Mindful afternoon meditation and calm focus',
    moodTag: 'Focus & Treat',
    baristaNotes: 'First-harvest Uji ceremonial matcha whisked with bamboo chasen, poured over oat milk and layered with sea salt sweet cream.',
  },
  {
    id: 'citrus-state',
    name: 'Citrus State',
    coffeeTypeLabel: 'Sparkling Botanical Shrub',
    italianOrigin: 'Gassosa Siciliana con Agrumi',
    category: 'botanicals-tea',
    categoryLabel: 'Botanicals & Ceremonial Tea',
    ratio: { espresso: 0, milk: 0, foam: 1 },
    foamTexture: 'Effervescent Sparkling Citrus Carbonation',
    servingGlass: 'Heavy-Base Highball Tumbler (12 oz)',
    idealMoment: 'Afternoon reset when coffee is not desired',
    moodTag: 'Refresh',
    baristaNotes: 'Cold-pressed Sicilian blood orange shrub, fresh Meyer lemon peel, bruised mint, and effervescent spring tonic over ice.',
  },
  {
    id: 'afterglow',
    name: 'Afterglow',
    coffeeTypeLabel: 'Layered Hibiscus & Butterfly Pea',
    italianOrigin: 'Infuso Botanico di Sera',
    category: 'botanicals-tea',
    categoryLabel: 'Botanicals & Ceremonial Tea',
    ratio: { espresso: 0, milk: 0, foam: 1 },
    foamTexture: 'Floating Prismatic Floral Bloom Layer',
    servingGlass: 'Stemmed Crystal Coupe Glass (8 oz)',
    idealMoment: 'Evening celebrations and alcohol-free aperitivo',
    moodTag: 'Celebration',
    baristaNotes: 'Egyptian ruby hibiscus tea base layered beneath white peach purée and deep violet butterfly pea blossom tea.',
  },

  // 6. Artisanal Bakery Pairings
  {
    id: 'cardamom-brioche',
    name: 'Cardamom Brioche Bun',
    coffeeTypeLabel: 'Swedish Kardemummabulle',
    italianOrigin: 'Pasticceria Artigianale Nordica',
    category: 'bakery-pairings',
    categoryLabel: 'Artisanal Bakery Pairings',
    ratio: { espresso: 0, milk: 0, foam: 0 },
    foamTexture: 'Buttery Flaky Crumb with Pearl Sugar Crunch',
    servingGlass: 'Charcoal Ceramic Pastry Slate',
    idealMoment: 'Perfect companion for black coffee or flat whites',
    moodTag: 'Comfort & Treat',
    baristaNotes: 'Slow-fermented brioche dough twisted with brown butter and freshly ground green cardamom pods, glazed with vanilla syrup.',
  },
  {
    id: 'truffle-brownie',
    name: 'Truffle Sea Salt Brownie',
    coffeeTypeLabel: '70% Valrhona Guanaja Brownie',
    italianOrigin: 'Torta al Cioccolato Fondente',
    category: 'bakery-pairings',
    categoryLabel: 'Artisanal Bakery Pairings',
    ratio: { espresso: 0, milk: 0, foam: 0 },
    foamTexture: 'Molten Fudge Core with Maldon Flaky Crystals',
    servingGlass: 'Dark Walnut Tasting Board',
    idealMoment: 'Paired with a double espresso or iced americano',
    moodTag: 'Treat',
    baristaNotes: 'Crafted with melted Valrhona 70% Guanaja chocolate, browned butter, and mineral-rich hand-harvested flaky salt.',
  },
];

const CATEGORY_TABS: { id: CoffeeCategoryType; label: string; count: number }[] = [
  { id: 'all', label: 'All 16 Types & Posts', count: 16 },
  { id: 'concentrated', label: 'Concentrated Espresso', count: 2 },
  { id: 'lattes-microfoam', label: 'Microfoam Classics', count: 3 },
  { id: 'mochas-sweet', label: 'Mochas & Sweets', count: 3 },
  { id: 'whipped-chilled', label: 'Whipped & Chilled', count: 4 },
  { id: 'botanicals-tea', label: 'Botanicals & Tea', count: 3 },
  { id: 'bakery-pairings', label: 'Artisanal Bakery', count: 2 },
];

export const CoffeeTypesGuide: React.FC<CoffeeTypesGuideProps> = ({
  products,
  onSelectProduct,
  onQuickAdd,
}) => {
  const [activeTab, setActiveTab] = useState<CoffeeCategoryType>('all');
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{
    item: CoffeeTypeInfo;
    studio: StudioImageMetadata;
    prod: Product;
  } | null>(null);

  const filteredTypes = activeTab === 'all'
    ? COFFEE_TYPES_DATA
    : COFFEE_TYPES_DATA.filter(c => c.category === activeTab);

  const handleQuickAddClick = (e: React.MouseEvent, prod: Product) => {
    e.stopPropagation();
    onQuickAdd(prod);
    setQuickAddedId(prod.id);
    setTimeout(() => setQuickAddedId(null), 1000);
  };

  return (
    <section id="coffee-types" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6A85C] font-semibold mb-1">
            <Coffee className="w-3.5 h-3.5" />
            <span>Curated Coffee Anatomy & Photography Typology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#F8F6F2] font-normal">
            Types of Coffee, Segregated by Preparation
          </h2>
          <p className="text-sm text-[#B6BAC7] mt-2 max-w-2xl leading-relaxed">
            Every style of coffee has its own physical anatomy, ratio of extraction to microfoam, and distinct sensory personality. Explore studio photographs, brew specifications, and glassware for every coffee type below.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs text-[#B6BAC7] bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <Layers className="w-3.5 h-3.5 text-[#E6A85C]" />
          <span>16 Studio Posts · Segregated by Typology</span>
        </div>
      </div>

      {/* Segregation Category Filter Tabs */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#E6A85C] text-[#10172A] font-semibold shadow-lg shadow-[#E6A85C]/20'
                  : 'bg-[#1E293B]/60 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-[#1E293B] border border-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isSelected ? 'bg-[#10172A]/20 text-[#10172A]' : 'bg-white/10 text-[#B6BAC7]'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Segregated Photo & Typology Post Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
        {filteredTypes.map((item) => {
          const prod = products.find(p => p.id === item.id) || products[0];
          const studioImage = fetchCoffeeProductImage(prod);
          const totalParts = item.ratio.espresso + item.ratio.milk + item.ratio.foam;
          const hasRatio = totalParts > 0;
          const espressoPct = hasRatio ? (item.ratio.espresso / totalParts) * 100 : 0;
          const milkPct = hasRatio ? (item.ratio.milk / totalParts) * 100 : 0;
          const foamPct = hasRatio ? (item.ratio.foam / totalParts) * 100 : 0;

          return (
            <article
              key={item.id}
              onClick={() => onSelectProduct(prod)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/25 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
            >
              {/* Product Photograph Post */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0E17]">
                <img
                  src={studioImage.src}
                  alt={studioImage.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10172A] via-[#10172A]/20 to-transparent" />

                {/* Specific Coffee Type Pill */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#10172A]/90 text-[#E6A85C] border border-[#E6A85C]/30 backdrop-blur-none">
                  {item.coffeeTypeLabel}
                </div>

                {/* Lightbox / Zoom Action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxItem({ item, studio: studioImage, prod });
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#10172A]/85 hover:bg-[#E6A85C] text-[#B6BAC7] hover:text-[#10172A] transition-colors border border-white/10"
                  title="Expand Studio Photo Post"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {/* Price Tag */}
                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-[#F8F6F2] bg-[#10172A]/90 border border-white/10">
                  ${prod.price.toFixed(2)}
                </div>

                {/* Camera / Studio Lighting Spec Badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono text-[#B6BAC7] bg-[#10172A]/85 border border-white/10">
                  <Camera className="w-2.5 h-2.5 text-[#E6A85C]" />
                  <span className="truncate max-w-[130px]">{studioImage.cameraAngle}</span>
                </div>
              </div>

              {/* Card Details & Anatomy Post */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#B6BAC7] uppercase tracking-wider">
                    <span>{item.italianOrigin}</span>
                    <span className="text-[#E6A85C] font-semibold">{item.moodTag}</span>
                  </div>
                  <h3 className="text-lg font-serif text-[#F8F6F2] group-hover:text-[#E6A85C] transition-colors mt-0.5 font-medium leading-snug">
                    {item.name}
                  </h3>
                  <p className="text-xs text-[#B6BAC7] mt-1 line-clamp-2 leading-relaxed">
                    {item.idealMoment}
                  </p>
                </div>

                {/* Visual Ratio Breakdown Bar (For Coffee & Matcha) */}
                {hasRatio && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] text-[#B6BAC7] font-mono">
                      {espressoPct > 0 ? (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#854D0E]" />
                          <span>Espresso {Math.round(espressoPct)}%</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                          <span>Matcha Base</span>
                        </span>
                      )}
                      {milkPct > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E6A85C]" />
                          <span>Milk {Math.round(milkPct)}%</span>
                        </span>
                      )}
                      {foamPct > 0 && (
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>Foam {Math.round(foamPct)}%</span>
                        </span>
                      )}
                    </div>

                    {/* Multi-segment ratio progress */}
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex">
                      <div style={{ width: `${espressoPct}%` }} className="bg-[#854D0E]" title="Espresso Extraction" />
                      <div style={{ width: `${milkPct}%` }} className="bg-[#E6A85C]" title="Steamed Milk" />
                      <div style={{ width: `${foamPct}%` }} className="bg-[#F8F6F2]" title="Aerated Microfoam / Foam Cap" />
                    </div>
                  </div>
                )}

                {/* Glassware & Texture spec */}
                <div className="text-[11px] text-[#B6BAC7] space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#F8F6F2]">Glassware:</span>
                    <span className="truncate max-w-[130px] font-mono text-[10px]">{item.servingGlass}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#F8F6F2]">Texture:</span>
                    <span className="truncate max-w-[130px] font-mono text-[10px]">{item.foamTexture}</span>
                  </div>
                </div>

                {/* Footer action */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProduct(prod);
                    }}
                    className="text-[#E6A85C] hover:underline font-medium text-xs flex items-center gap-1"
                  >
                    <span>Customise & Order</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={(e) => handleQuickAddClick(e, prod)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors font-medium ${
                      quickAddedId === prod.id
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 hover:bg-[#E6A85C] hover:text-[#10172A] text-[#F8F6F2]'
                    }`}
                    title="Quick Add standard serving to Tray"
                  >
                    {quickAddedId === prod.id ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <span>+ Tray</span>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Lightbox Modal for Studio Photography Inspection */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-50 bg-[#10172A]/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxItem(null)}
        >
          <div 
            className="bg-[#1E293B] border border-white/20 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-[#10172A]/80 hover:bg-[#10172A] rounded-full text-[#F8F6F2] transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
              <img
                src={lightboxItem.studio.src}
                alt={lightboxItem.studio.alt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-6">
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Studio Lighting & Post Detail
                </span>
                <h3 className="text-2xl font-serif text-[#F8F6F2] font-normal">
                  {lightboxItem.item.name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/5 p-3.5 rounded-xl border border-white/5">
                <div>
                  <span className="block text-[#B6BAC7] text-[10px] uppercase">Camera Angle</span>
                  <span className="font-mono text-[#F8F6F2]">{lightboxItem.studio.cameraAngle}</span>
                </div>
                <div>
                  <span className="block text-[#B6BAC7] text-[10px] uppercase">Lighting Setup</span>
                  <span className="font-mono text-[#F8F6F2] truncate block">{lightboxItem.studio.lightingSetup}</span>
                </div>
                <div>
                  <span className="block text-[#B6BAC7] text-[10px] uppercase">Serving Glass</span>
                  <span className="font-mono text-[#F8F6F2]">{lightboxItem.item.servingGlass}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-[#E6A85C] uppercase tracking-wider block mb-1">
                  Barista Extraction Profile
                </span>
                <p className="text-xs text-[#B6BAC7] leading-relaxed">
                  {lightboxItem.item.baristaNotes}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#B6BAC7]">Serving Price: </span>
                  <span className="font-mono font-semibold text-[#F8F6F2] text-sm">
                    ${lightboxItem.prod.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const prod = lightboxItem.prod;
                      setLightboxItem(null);
                      onSelectProduct(prod);
                    }}
                    className="px-4 py-2 bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] rounded-xl text-xs font-semibold transition-all shadow-md"
                  >
                    Customise Serving
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
