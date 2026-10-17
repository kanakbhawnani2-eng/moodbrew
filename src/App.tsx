import React, { useState } from 'react';
import { Product, MoodType, CartItem, Order, OrderStatus, CustomizationOption, LoyaltyRedemption } from './types/cafe';
import { INITIAL_PRODUCTS, cafeAmbianceImg } from './data/menuData';
import { fetchCoffeeProductImage } from './services/imageService';
import { ThreeDrinkCanvas } from './components/ThreeDrinkCanvas';
import { MoodFinderModal } from './components/MoodFinderModal';
import { ProductCustomizationModal } from './components/ProductCustomizationModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { FullMenu } from './components/FullMenu';
import { CoffeeTypesGuide } from './components/CoffeeTypesGuide';
import { AdminPanel } from './components/AdminPanel';
import { LoyaltyRewardsModal } from './components/LoyaltyRewardsModal';
import { 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Coffee, 
  Settings, 
  ChevronRight,
  Flame,
  Snowflake,
  Star,
  Camera,
  Award,
  Gift
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([
    {
      orderId: 'MM-4821',
      createdAt: 'Today, 09:15 AM',
      items: [
        {
          cartItemId: 'init-order-1',
          product: INITIAL_PRODUCTS.find(p => p.id === 'soft-landing') || INITIAL_PRODUCTS[0],
          selectedTemp: 'hot',
          selectedSize: 'regular',
          sizePriceDelta: 0,
          selectedMilk: 'Barista Oat Milk',
          milkPriceDelta: 0.75,
          selectedSweetness: '50% Half Sweet',
          selectedExtras: [],
          quantity: 1,
          unitPrice: 7.25,
          totalPrice: 7.25,
        }
      ],
      subtotal: 7.25,
      tax: 0.60,
      total: 7.85,
      fulfillment: 'pickup',
      customer: {
        name: 'Elena Rostova',
        email: 'elena@themoodmenu.com',
        phone: '415-555-0182',
      },
      paymentMethod: 'card',
      status: 'Completed',
      estimatedMinutes: 10,
      pointsEarned: 78,
    }
  ]);
  const [loyaltyRedemptions, setLoyaltyRedemptions] = useState<LoyaltyRedemption[]>([]);
  
  // Modals & Panels
  const [isMoodFinderOpen, setIsMoodFinderOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Active mood in the 3D Hero
  const [heroMood, setHeroMood] = useState<MoodType>('comfort');
  const [heroTemp, setHeroTemp] = useState<'hot' | 'iced'>('iced');

  // Points tracking calculations
  const welcomeBonusPoints = 90;
  const pointsFromOrders = orders.reduce((sum, o) => sum + (o.pointsEarned || Math.round(o.total * 10)), 0);
  const lifetimePoints = welcomeBonusPoints + pointsFromOrders;
  const pointsSpent = loyaltyRedemptions.reduce((sum, r) => sum + r.pointsSpent, 0);
  const availablePoints = Math.max(0, lifetimePoints - pointsSpent);

  // Add to cart handler
  const handleAddToCart = (
    product: Product,
    options: {
      selectedTemp: 'hot' | 'iced';
      selectedSize: string;
      sizePriceDelta: number;
      selectedMilk?: string;
      milkPriceDelta: number;
      selectedSweetness?: string;
      selectedExtras: CustomizationOption[];
      quantity: number;
    }
  ) => {
    const extrasDelta = options.selectedExtras.reduce((sum, e) => sum + e.priceDelta, 0);
    const unitPrice = product.price + options.sizePriceDelta + options.milkPriceDelta + extrasDelta;
    const totalPrice = unitPrice * options.quantity;

    const newItem: CartItem = {
      cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      product,
      selectedTemp: options.selectedTemp,
      selectedSize: options.selectedSize,
      sizePriceDelta: options.sizePriceDelta,
      selectedMilk: options.selectedMilk,
      milkPriceDelta: options.milkPriceDelta,
      selectedSweetness: options.selectedSweetness,
      selectedExtras: options.selectedExtras,
      quantity: options.quantity,
      unitPrice,
      totalPrice,
    };

    setCart(prev => [...prev, newItem]);
  };

  const handleQuickAdd = (product: Product) => {
    handleAddToCart(product, {
      selectedTemp: product.defaultTemp,
      selectedSize: 'regular',
      sizePriceDelta: 0,
      selectedMilk: product.customization.milks ? 'whole' : undefined,
      milkPriceDelta: 0,
      selectedSweetness: product.customization.sweetnessLevels ? '100% Standard' : undefined,
      selectedExtras: [],
      quantity: 1,
    });
  };

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    } else {
      setCart(prev => prev.map(item => {
        if (item.cartItemId === cartItemId) {
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: item.unitPrice * newQuantity,
          };
        }
        return item;
      }));
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleRedeemDrink = (product: Product, pointsCost: number) => {
    const code = `MM-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRedemption: LoyaltyRedemption = {
      redemptionId: `redemption-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      pointsSpent: pointsCost,
      redeemedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      code,
    };

    setLoyaltyRedemptions(prev => [newRedemption, ...prev]);

    // Add complimentary drink item to cart with $0.00
    const freeItem: CartItem = {
      cartItemId: `redeemed-${product.id}-${Date.now()}`,
      product,
      selectedTemp: product.defaultTemp,
      selectedSize: 'regular',
      sizePriceDelta: 0,
      selectedMilk: product.customization.milks ? 'whole' : undefined,
      milkPriceDelta: 0,
      selectedSweetness: product.customization.sweetnessLevels ? '100% Standard' : undefined,
      selectedExtras: [],
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isRedeemed: true,
      pointsCost,
      specialInstructions: `Redeemed with ${pointsCost} Loyalty Points (Voucher: ${code})`,
    };

    setCart(prev => [...prev, freeItem]);
  };

  const handleSimulateOrder = () => {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const simTotal = Number((randomProduct.price * 1.0825).toFixed(2));
    const pointsEarned = Math.round(simTotal * 10);
    const simOrder: Order = {
      orderId: `MM-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [
        {
          cartItemId: `sim-${Date.now()}`,
          product: randomProduct,
          selectedTemp: randomProduct.defaultTemp,
          selectedSize: 'regular',
          sizePriceDelta: 0,
          milkPriceDelta: 0,
          selectedExtras: [],
          quantity: 1,
          unitPrice: randomProduct.price,
          totalPrice: randomProduct.price,
        }
      ],
      subtotal: randomProduct.price,
      tax: Number((randomProduct.price * 0.0825).toFixed(2)),
      total: simTotal,
      fulfillment: 'pickup',
      customer: {
        name: 'Patron Guest',
        email: 'guest@themoodmenu.com',
        phone: '415-555-0144',
      },
      paymentMethod: 'apple-pay',
      status: 'Brewing',
      estimatedMinutes: 8,
      pointsEarned,
    };

    handleOrderSuccess(simOrder);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Featured 4 drinks for hero showcase
  const featuredDrinks = products.filter(p => 
    ['soft-landing', 'golden-hour', 'citrus-state', 'velvet-orbit'].includes(p.id)
  );

  return (
    <div className="min-h-screen bg-[#10172A] text-[#F8F6F2] font-sans selection:bg-[#E6A85C] selection:text-[#10172A]">
      {/* 1. TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-[#10172A]/90 backdrop-blur-md border-b border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single Wordmark */}
          <a href="#" className="font-serif text-xl sm:text-2xl font-normal tracking-wider text-[#F8F6F2] whitespace-nowrap shrink-0 hover:text-[#E6A85C] transition-colors">
            THE MOOD MENU
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-[#B6BAC7]">
            <a href="#coffee-types" className="hover:text-[#E6A85C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 text-[#E6A85C]">
              <Coffee className="w-3.5 h-3.5" />
              <span>Types of Coffee</span>
            </a>
            <a href="#menu-section" className="hover:text-[#F8F6F2] transition-colors whitespace-nowrap shrink-0">
              Menu
            </a>
            <a href="#coffee-gallery" className="hover:text-[#F8F6F2] transition-colors whitespace-nowrap shrink-0">
              Roastery Gallery
            </a>
            <button
              onClick={() => setIsMoodFinderOpen(true)}
              className="hover:text-[#E6A85C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E6A85C]" />
              <span>Find Your Mood</span>
            </button>
            <button
              onClick={() => setIsLoyaltyOpen(true)}
              className="hover:text-[#E6A85C] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-[#E6A85C]" />
              <span>Rewards</span>
            </button>
            <a href="#how-it-works" className="hover:text-[#F8F6F2] transition-colors whitespace-nowrap shrink-0">
              Ritual
            </a>
            <a href="#our-story" className="hover:text-[#F8F6F2] transition-colors whitespace-nowrap shrink-0">
              Our Story
            </a>
            <a href="#visit-us" className="hover:text-[#F8F6F2] transition-colors whitespace-nowrap shrink-0">
              Visit Us
            </a>
          </nav>

          {/* Zone 3: Primary Action & Tray Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Loyalty Rewards Quick Chip */}
            <button
              onClick={() => setIsLoyaltyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#E6A85C]/15 hover:bg-[#E6A85C]/25 border border-[#E6A85C]/40 text-[#E6A85C] rounded-xl text-xs font-semibold transition-all shadow-sm whitespace-nowrap shrink-0"
              title="The Mood Club · Loyalty Rewards"
            >
              <Award className="w-3.5 h-3.5 text-[#E6A85C]" />
              <span className="hidden sm:inline">Club</span>
              <span className="bg-[#10172A] text-[#F8F6F2] text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold border border-[#E6A85C]/30">
                {availablePoints} pts
              </span>
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="p-2 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 rounded-lg text-xs transition-colors"
              title="Barista / Manager Portal"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] rounded-xl text-xs font-semibold transition-all shadow-md shadow-[#E6A85C]/15 whitespace-nowrap shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Tray</span>
              {cartTotalCount > 0 && (
                <span className="bg-[#10172A] text-[#F8F6F2] text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                  {cartTotalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* 2. CINEMATIC HERO SECTION */}
        <section className="relative min-h-[calc(100vh-5rem)] flex items-center border-b border-white/10 overflow-hidden">
          {/* Ambient Lighting Gradient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(185,163,207,0.15),rgba(255,255,255,0))]" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#E6A85C]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#302238]/60 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Brand Copy & Actions */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  <span>Specialty Café & Sensual Mixology</span>
                  <span aria-hidden="true">·</span>
                  <span>Arts District</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#F8F6F2] leading-[1.1] font-normal" style={{ textWrap: 'balance' }}>
                  What’s your mood today?
                </h1>

                <p className="text-base sm:text-lg text-[#B6BAC7] leading-relaxed max-w-xl">
                  People don’t just choose a drink for its name; they choose it for how they want to feel. Discover specialty espresso and botanic elixirs crafted to fit your exact moment.
                </p>

                {/* Primary & Secondary Action CTAs */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setIsMoodFinderOpen(true)}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] rounded-xl font-medium text-xs tracking-wider uppercase transition-all shadow-xl shadow-[#E6A85C]/25"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Find My Mood</span>
                  </button>

                  <a
                    href="#menu-section"
                    className="flex items-center gap-2 px-6 py-3.5 bg-white/5 hover:bg-white/10 text-[#F8F6F2] border border-white/10 rounded-xl font-medium text-xs tracking-wider uppercase transition-colors"
                  >
                    <span>Explore the Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B6BAC7]" />
                  </a>
                </div>

                {/* Mood Switcher Pills for live 3D preview */}
                <div className="pt-6 border-t border-white/10">
                  <span className="text-[11px] uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                    Test the mood spectrum:
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(['comfort', 'focus', 'adventure', 'celebration', 'refresh'] as MoodType[]).map((m) => {
                      const isActive = heroMood === m;
                      return (
                        <button
                          key={m}
                          onClick={() => setHeroMood(m)}
                          className={`capitalize px-3 py-1.5 rounded-lg border transition-all ${
                            isActive
                              ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C] font-semibold'
                              : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5'
                          }`}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: 3D Scene Viewport */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative w-full h-[440px] sm:h-[500px] rounded-3xl border border-white/10 bg-[#0E1526]/80 shadow-2xl overflow-hidden">
                  <ThreeDrinkCanvas
                    activeMood={heroMood}
                    drinkType={heroTemp}
                    onMoodChange={(m) => setHeroMood(m)}
                    className="w-full h-full"
                  />

                  {/* Temperature Switch floating top-left */}
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-1 p-1 bg-[#10172A]/85 border border-white/10 rounded-lg">
                    <button
                      onClick={() => setHeroTemp('iced')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                        heroTemp === 'iced'
                          ? 'bg-[#60A5FA] text-[#10172A] font-semibold'
                          : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                      }`}
                    >
                      <Snowflake className="w-3 h-3" />
                      <span>Iced</span>
                    </button>
                    <button
                      onClick={() => setHeroTemp('hot')}
                      className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                        heroTemp === 'hot'
                          ? 'bg-[#E6A85C] text-[#10172A] font-semibold'
                          : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Hot</span>
                    </button>
                  </div>

                  {/* Active mood indicator top right */}
                  <div className="absolute top-4 right-4 z-20 text-[11px] text-[#B6BAC7] bg-[#10172A]/85 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E6A85C]" />
                    <span className="capitalize">{heroMood} Ambiance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED SIGNATURE DRINKS SHOWCASE */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
              Curated Masterpieces
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] mt-1 font-normal">
              Signature Drinks by Mood
            </h2>
            <p className="text-sm text-[#B6BAC7] mt-2 leading-relaxed">
              Formulated with single-origin beans, natural essences, and house-made infusions. Click any drink to customise your serving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDrinks.map((drink) => (
              <div
                key={drink.id}
                onClick={() => setSelectedProductForModal(drink)}
                className="group cursor-pointer bg-[#1E293B]/40 hover:bg-[#1E293B] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0E17]">
                  <img
                    src={drink.image}
                    alt={drink.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10172A]/90 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#10172A]/85 text-[#E6A85C] border border-[#E6A85C]/30">
                    {drink.moodTags[0]}
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded text-xs font-mono font-semibold text-[#F8F6F2] bg-[#10172A]/85 border border-white/10">
                    ${drink.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-serif font-medium text-[#F8F6F2] group-hover:text-[#E6A85C] transition-colors">
                      {drink.name}
                    </h3>
                    <p className="text-xs text-[#B6BAC7] mt-1 line-clamp-2 leading-relaxed">
                      {drink.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-[#B6BAC7] text-[11px] truncate">
                      {drink.flavorNotes.slice(0, 2).join(' · ')}
                    </span>
                    <span className="text-[#E6A85C] font-medium group-hover:translate-x-0.5 transition-transform">
                      Order →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. LOYALTY REWARDS PROGRESS BAR BANNER */}
        <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#1E293B]/90 via-[#10172A] to-[#302238]/70 border border-[#E6A85C]/30 shadow-2xl overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#E6A85C]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Left side: Points & Info */}
            <div className="space-y-2 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E6A85C]/15 text-[#E6A85C] border border-[#E6A85C]/30">
                <Award className="w-3.5 h-3.5" />
                <span>The Mood Club · Loyalty Rewards</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] font-normal">
                {availablePoints >= 200 ? (
                  <span>You've unlocked a <strong className="text-[#E6A85C] font-medium">Free Signature Drink!</strong></span>
                ) : (
                  <span><strong className="text-[#E6A85C] font-mono">{200 - availablePoints} pts</strong> to your next free beverage</span>
                )}
              </h3>
              <p className="text-xs text-[#B6BAC7] leading-relaxed">
                Earn 10 points for every $1 spent. Redeem points for signature lattes, nitro cold brews, and artisanal treats anytime.
              </p>
            </div>

            {/* Right side: Progress Bar & Actions */}
            <div className="w-full md:max-w-md space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B6BAC7]">Free Drink Milestone</span>
                <span className="font-mono font-bold text-[#F8F6F2]">
                  {availablePoints} <span className="text-[#B6BAC7] font-normal">/ 200 pts ({Math.min(100, Math.round((availablePoints / 200) * 100))}%)</span>
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 w-full bg-[#10172A] rounded-full overflow-hidden border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#d49344] via-[#E6A85C] to-[#FDE047] rounded-full transition-all duration-700 relative shadow-sm"
                  style={{ width: `${Math.min(100, Math.round((availablePoints / 200) * 100))}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  onClick={() => setIsLoyaltyOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Redeem Free Drinks</span>
                </button>

                <button
                  onClick={() => setIsLoyaltyOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8F6F2] text-xs font-medium transition-colors"
                >
                  View Points Ledger
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 5. TYPES OF COFFEE SEGREGATED TYPOLOGY & PHOTO POSTS */}
        <CoffeeTypesGuide
          products={products}
          onSelectProduct={(product) => setSelectedProductForModal(product)}
          onQuickAdd={handleQuickAdd}
        />

        {/* 5. SPECIALTY COFFEE ROASTERY & BAR GALLERY */}
        <section id="coffee-gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                Single-Origin Roastery & Extraction Bar
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] mt-1 font-normal">
                Artisanal Coffee Gallery
              </h2>
              <p className="text-sm text-[#B6BAC7] mt-2 max-w-xl leading-relaxed">
                From precision 9-bar espresso pulls with tiger-striped crema to 24-hour slow-steeped nitro cold brew and hand-poured vanilla bean microfoam.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#B6BAC7]">
              <span className="w-2 h-2 rounded-full bg-[#E6A85C]" />
              <span>Direct-Trade Organic Beans · Freshly Pulled Daily</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                id: 'daily-ritual',
                name: 'The Daily Ritual',
                sub: 'Benchmark Double Espresso',
                extraction: 'Double Ristretto · 9 Bar',
                roast: 'Single-Origin Yirgacheffe Heirloom',
                desc: 'Deep tiger-striped crema over a rich Ethiopian heirloom base with notes of bergamot and cacao.',
                tag: 'Focus Mood',
              },
              {
                id: 'clear-cut',
                name: 'The Clear Cut',
                sub: 'Faceted Iced Americano',
                extraction: 'Cold Pulled over Hand-Cut Ice',
                roast: 'Dark Roast Botanical Blend',
                desc: 'Crisp, sparkling mineral water meets slow-poured espresso over diamond ice cubes.',
                tag: 'Clarity & Refresh',
              },
              {
                id: 'soft-landing',
                name: 'The Soft Landing',
                sub: 'Madagascar Vanilla Latte',
                extraction: 'Dual-Origin Washed Espresso',
                roast: 'Medium Roast Huehuetenango',
                desc: 'Velvety microfoam art folded with authentic vanilla bean caviar and a touch of grated nutmeg.',
                tag: 'Comfort Mood',
              },
              {
                id: 'golden-hour',
                name: 'Golden Hour',
                sub: 'Salted Caramel Fluted Latte',
                extraction: 'Slow-Drip Espresso & Oat Cream',
                roast: 'Artisanal Caramel Blend',
                desc: 'Hand-cooked fleur de sel caramel dripping down crystal ribbed glass with edible gold dust shimmer.',
                tag: 'Celebration Mood',
              },
              {
                id: 'cocoa-cloud',
                name: 'Cocoa Cloud',
                sub: 'Valrhona Chocolate Coffee',
                extraction: 'Blonde Espresso & Dutch Cocoa',
                roast: 'Blonde Roast & Brown Butter',
                desc: 'Rich dark chocolate simmered with oat cream, capped with whipped foam and shaved chocolate curls.',
                tag: 'Comfort & Treat',
              },
              {
                id: 'mint-condition',
                name: 'Mint Condition',
                sub: 'Spearmint Nitro Cold Brew',
                extraction: '24-Hour Nitro Cold Steep',
                roast: 'Cold Brew Reserve & Spearmint',
                desc: 'Nitro-infused cold brew steeped with organic mint, topped with cascading velvety coconut cream.',
                tag: 'Refresh & Focus',
              },
            ].map((coffee) => {
              const prod = products.find(p => p.id === coffee.id) || products[0];
              const studioImg = fetchCoffeeProductImage(prod);
              return (
                <div
                  key={coffee.id}
                  onClick={() => setSelectedProductForModal(prod)}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/25 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0A0E17]">
                    <img
                      src={studioImg.src}
                      alt={studioImg.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#10172A] via-[#10172A]/20 to-transparent" />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-[#10172A]/90 text-[#E6A85C] border border-[#E6A85C]/30">
                      {coffee.tag}
                    </div>

                    {/* Studio Lighting Spec Tag */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] text-[#F8F6F2] bg-[#10172A]/90 border border-white/10 backdrop-blur-none">
                      <Camera className="w-3 h-3 text-[#E6A85C]" />
                      <span className="font-mono text-[9px] truncate max-w-[170px] text-[#B6BAC7]">
                        {studioImg.cameraAngle}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-[#F8F6F2] bg-[#10172A]/90 border border-white/10">
                      ${prod.price.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#B6BAC7]">
                        <span>{coffee.extraction}</span>
                        <span className="capitalize">{prod.defaultTemp}</span>
                      </div>
                      <h3 className="text-xl font-serif text-[#F8F6F2] group-hover:text-[#E6A85C] transition-colors mt-1 font-medium">
                        {coffee.name}
                      </h3>
                      <p className="text-xs text-[#E6A85C] font-accent text-sm mt-0.5">
                        {coffee.sub}
                      </p>
                      <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">
                        {coffee.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-[#B6BAC7] truncate max-w-[180px]">
                        {coffee.roast}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProductForModal(prod);
                        }}
                        className="text-[#E6A85C] hover:text-[#d49344] font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                      >
                        <span>Customise</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
              The Ritual
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] mt-1 font-normal">
              How The Mood Menu Works
            </h2>
            <p className="text-sm text-[#B6BAC7] mt-2">
              Turning beverage ordering into an intentional sensory ritual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#1E293B]/30 border border-white/10 relative">
              <span className="text-2xl font-serif text-[#E6A85C] font-light">01</span>
              <h3 className="text-lg font-serif text-[#F8F6F2] mt-3">State Your Feeling</h3>
              <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">
                Whether you need soothing comfort, analytical focus, botanical refreshment, or an adventurous celebration, begin with how you want to feel.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#1E293B]/30 border border-white/10 relative">
              <span className="text-2xl font-serif text-[#E6A85C] font-light">02</span>
              <h3 className="text-lg font-serif text-[#F8F6F2] mt-3">Palate Calibration</h3>
              <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">
                Our recommendation engine matches your selected mood, temperature preference, and dietary needs against our specialty roaster catalog.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#1E293B]/30 border border-white/10 relative">
              <span className="text-2xl font-serif text-[#E6A85C] font-light">03</span>
              <h3 className="text-lg font-serif text-[#F8F6F2] mt-3">Barista Extraction</h3>
              <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">
                Customise plant milks, sweetness, and artisanal add-ons. Pick up at our express counter or have it hand-delivered to your café table.
              </p>
            </div>
          </div>
        </section>

        {/* 5. COMPLETE MENU COMPONENT */}
        <FullMenu
          products={products}
          onSelectProduct={(product) => setSelectedProductForModal(product)}
          onQuickAdd={handleQuickAdd}
          onOpenMoodFinder={() => setIsMoodFinderOpen(true)}
        />

        {/* 6. OUR STORY SECTION */}
        <section id="our-story" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative aspect-[16/9] lg:aspect-auto lg:h-[460px] rounded-3xl overflow-hidden border border-white/10">
              <img
                src={cafeAmbianceImg}
                alt="The Mood Menu Café Interior"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10172A] via-transparent to-transparent opacity-60" />
            </div>

            <div className="lg:col-span-6 space-y-5">
              <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                Our Philosophy & Roasting Ethos
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] font-normal leading-tight">
                Every mood has a flavour.
              </h2>
              <p className="text-sm text-[#B6BAC7] leading-relaxed">
                Traditional coffee shops hand you a list of 40 names and expect you to know what you crave. The Mood Menu was founded on a simple observation: our desire for beverages is deeply emotional.
              </p>
              <p className="text-sm text-[#B6BAC7] leading-relaxed">
                On some mornings, you need the grounding safety of a warm, Madagascar vanilla latte like The Soft Landing. On others, you need the crystalline clarity of cold-pulled espresso with citrus notes to power through a breakthrough.
              </p>
              <div className="pt-2 flex items-center gap-6 text-xs text-[#F8F6F2]">
                <div>
                  <span className="block font-mono text-xl text-[#E6A85C] font-semibold">100%</span>
                  <span className="text-[#B6BAC7]">Direct-Trade Single Origins</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div>
                  <span className="block font-mono text-xl text-[#E6A85C] font-semibold">0%</span>
                  <span className="text-[#B6BAC7]">Artificial Flavorings</span>
                </div>
                <div className="w-[1px] h-8 bg-white/10" />
                <div>
                  <span className="block font-mono text-xl text-[#E6A85C] font-semibold">Organic</span>
                  <span className="text-[#B6BAC7]">Cold-Pressed Botanicals</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CUSTOMER TASTING NOTES & REVIEWS */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/10">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
              Patron Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] mt-1 font-normal">
              Words From Our Guests
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "I walked in exhausted from back-to-back reviews. The Mood Finder suggested 'The Soft Landing'—that vanilla microfoam genuinely felt like taking a deep breath.",
                author: "Elena Rostova",
                role: "Architectural Designer",
                drink: "The Soft Landing",
              },
              {
                quote: "The Clear Cut is my daily companion for deep work sprints. Pulling espresso over sparkling mineral ice makes every other iced coffee taste muddy.",
                author: "Marcus Vance",
                role: "Software Engineer",
                drink: "The Clear Cut",
              },
              {
                quote: "Golden Hour during sunset on their patio is perfection. The salted honey caramel and gold dust make an ordinary Tuesday feel like a milestone celebration.",
                author: "Priya Nair",
                role: "Creative Director",
                drink: "Golden Hour",
              },
            ].map((rev, idx) => (
              <div key={idx} className="p-6 bg-[#1E293B]/30 border border-white/10 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex text-[#E6A85C] gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-[#B6BAC7] leading-relaxed italic">
                    "{rev.quote}"
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-[#F8F6F2]">{rev.author}</h4>
                    <span className="text-[11px] text-[#B6BAC7]">{rev.role}</span>
                  </div>
                  <span className="text-[11px] text-[#E6A85C] font-mono">{rev.drink}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. VISIT US / CAFÉ LOCATION */}
        <section id="visit-us" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="p-8 sm:p-12 bg-[#1E293B]/40 border border-white/10 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                Atmosphere & Espresso Bar
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif text-[#F8F6F2] mt-1 font-normal">
                Visit The Mood Menu
              </h2>
              <p className="text-xs text-[#B6BAC7] mt-3 leading-relaxed max-w-md">
                Our space is designed for quiet contemplation, intimate conversations, and deep creative focus. Step up to our tasting bar or reserve an alcove table.
              </p>

              <div className="mt-6 space-y-3 text-xs text-[#F8F6F2]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#E6A85C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Arts District Sanctuary</strong>
                    <span className="text-[#B6BAC7]">742 Arts District Blvd, Suite 100, Downtown</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#E6A85C] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block">Barista Hours</strong>
                    <span className="text-[#B6BAC7]">Monday – Friday: 7:00 AM – 8:00 PM</span>
                    <span className="text-[#B6BAC7] block">Saturday – Sunday: 8:00 AM – 9:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#10172A] p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="font-serif text-lg text-[#F8F6F2]">Express Counter Pickup</h3>
              <p className="text-xs text-[#B6BAC7] leading-relaxed">
                Order your mood drink online before arriving. We calibrate extraction timing so your beverage is pulled within 60 seconds of your arrival.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setIsMoodFinderOpen(true)}
                  className="w-full py-3 bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Order For Pickup
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. FOOTER */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-[#B6BAC7]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
          <div>
            <span className="font-serif text-lg text-[#F8F6F2] tracking-wider block">
              THE MOOD MENU
            </span>
            <span className="text-[11px] text-[#B6BAC7]">
              Every mood has a flavour.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <a href="#menu-section" className="hover:text-[#F8F6F2] transition-colors">Menu</a>
            <a href="#coffee-gallery" className="hover:text-[#E6A85C] transition-colors">Coffee Gallery</a>
            <button onClick={() => setIsMoodFinderOpen(true)} className="hover:text-[#E6A85C] transition-colors">Mood Finder</button>
            <a href="#our-story" className="hover:text-[#F8F6F2] transition-colors">Philosophy</a>
            <a href="#visit-us" className="hover:text-[#F8F6F2] transition-colors">Visit</a>
            <button onClick={() => setIsAdminOpen(true)} className="text-[#B6BAC7] hover:text-[#E6A85C] transition-colors">Barista Console</button>
          </div>
        </div>

        {/* PRD Legal Disclaimer & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#B6BAC7]/80">
          <p>
            © {new Date().getFullYear()} The Mood Menu Specialty Café. All rights reserved.
          </p>
          <p className="max-w-md text-center sm:text-right">
            Mood-based recommendations are creative culinary pairings, not medical advice or clinical treatments.
          </p>
        </div>
      </footer>

      {/* MODALS & DRAWERS */}
      <MoodFinderModal
        isOpen={isMoodFinderOpen}
        onClose={() => setIsMoodFinderOpen(false)}
        products={products}
        onAddToCart={handleAddToCart}
        onSelectProductForDetails={(product) => setSelectedProductForModal(product)}
      />

      <ProductCustomizationModal
        product={selectedProductForModal}
        isOpen={!!selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
        availablePoints={availablePoints}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={handleOrderSuccess}
        onClearCart={() => setCart([])}
        onOpenLoyalty={() => setIsLoyaltyOpen(true)}
      />

      <LoyaltyRewardsModal
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        products={products}
        orders={orders}
        availablePoints={availablePoints}
        lifetimePoints={lifetimePoints}
        redemptions={loyaltyRedemptions}
        onRedeemDrink={handleRedeemDrink}
        onSimulateOrder={handleSimulateOrder}
        onOpenTray={() => {
          setIsLoyaltyOpen(false);
          setIsCartOpen(true);
        }}
      />

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProduct={handleUpdateProduct}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </div>
  );
}
