/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product, Order, LoyaltyRedemption } from '../types/cafe';
import { fetchCoffeeProductImage, handleImageError } from '../services/imageService';
import { 
  X, 
  Sparkles, 
  Coffee, 
  Award, 
  Gift, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Flame, 
  Snowflake, 
  Check, 
  Star, 
  TrendingUp, 
  ShoppingBag,
  Ticket,
  ChevronRight,
  Info
} from 'lucide-react';

interface LoyaltyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  orders: Order[];
  availablePoints: number;
  lifetimePoints: number;
  redemptions: LoyaltyRedemption[];
  onRedeemDrink: (product: Product, pointsCost: number) => void;
  onSimulateOrder?: () => void;
  onOpenTray: () => void;
}

const REDEEMABLE_PRODUCTS_CONFIG = [
  { id: 'daily-ritual', pointsCost: 120, category: 'Espresso' },
  { id: 'cortado', pointsCost: 140, category: 'Espresso' },
  { id: 'clear-cut', pointsCost: 140, category: 'Iced Coffee' },
  { id: 'flat-white', pointsCost: 160, category: 'Latte' },
  { id: 'soft-landing', pointsCost: 180, category: 'Signature Latte' },
  { id: 'golden-hour', pointsCost: 200, category: 'Signature Latte' },
  { id: 'velvet-orbit', pointsCost: 200, category: 'Signature Latte' },
  { id: 'cocoa-cloud', pointsCost: 180, category: 'Signature Latte' },
  { id: 'mint-condition', pointsCost: 180, category: 'Iced Coffee' },
  { id: 'kyoto-cloud-matcha', pointsCost: 190, category: 'Tea & Matcha' },
  { id: 'cardamom-brioche', pointsCost: 100, category: 'Bakery' },
  { id: 'truffle-brownie', pointsCost: 110, category: 'Bakery' },
];

const MILESTONES = [
  { points: 50, label: 'Flavor Add-on', desc: 'Free vanilla bean or salted caramel' },
  { points: 100, label: 'Artisan Pastry', desc: 'Cardamom brioche or sea salt brownie' },
  { points: 150, label: 'Single Origin', desc: 'Double espresso or iced americano' },
  { points: 200, label: 'Free Drink', desc: 'Any signature latte or botanical elixir' },
];

export const LoyaltyRewardsModal: React.FC<LoyaltyRewardsModalProps> = ({
  isOpen,
  onClose,
  products,
  orders,
  availablePoints,
  lifetimePoints,
  redemptions,
  onRedeemDrink,
  onSimulateOrder,
  onOpenTray,
}) => {
  const [activeTab, setActiveTab] = useState<'redeem' | 'history' | 'tiers'>('redeem');
  const [redeemedSuccessItem, setRedeemedSuccessItem] = useState<{
    product: Product;
    pointsCost: number;
    code: string;
  } | null>(null);

  if (!isOpen) return null;

  // Next free beverage milestone is 200 points
  const FREE_DRINK_TARGET = 200;
  const progressRatio = Math.min(1, availablePoints / FREE_DRINK_TARGET);
  const progressPercent = Math.round(progressRatio * 100);
  const pointsToNextFreeDrink = availablePoints >= FREE_DRINK_TARGET ? 0 : FREE_DRINK_TARGET - availablePoints;
  const freeDrinksEarnedCount = Math.floor(availablePoints / FREE_DRINK_TARGET);

  // Determine membership tier
  const tier = 
    lifetimePoints >= 500 ? 'Gold Ambient' :
    lifetimePoints >= 200 ? 'Silver Crema' : 'Bronze Sip';

  const handleRedeemClick = (product: Product, pointsCost: number) => {
    if (availablePoints < pointsCost) return;
    
    const code = `MM-FREE-${Math.floor(1000 + Math.random() * 9000)}`;
    onRedeemDrink(product, pointsCost);
    setRedeemedSuccessItem({ product, pointsCost, code });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#10172A] border border-white/15 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#10172A] via-[#1E293B] to-[#302238] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6A85C]/20 border border-[#E6A85C]/30 flex items-center justify-center text-[#E6A85C] shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl text-[#F8F6F2] font-normal">
                  The Mood Club Rewards
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#E6A85C]/15 text-[#E6A85C] border border-[#E6A85C]/30">
                  {tier}
                </span>
              </div>
              <p className="text-xs text-[#B6BAC7] mt-0.5">
                Every mood order earns 10 points per $1 spent towards complimentary signature drinks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/10 rounded-full transition-colors border border-white/5"
            aria-label="Close loyalty modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. PROGRESS BAR TOWARDS NEXT FREE BEVERAGE */}
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#162032] border border-white/10 shadow-lg overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E6A85C]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#E6A85C] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Next Free Beverage Progress</span>
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-3xl sm:text-4xl font-bold text-[#F8F6F2]">
                    {availablePoints}
                  </span>
                  <span className="text-sm text-[#B6BAC7]">/ {FREE_DRINK_TARGET} Points</span>
                </div>
              </div>

              <div className="sm:text-right">
                {pointsToNextFreeDrink === 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6A85C]/20 border border-[#E6A85C]/40 rounded-xl text-xs font-semibold text-[#E6A85C] animate-pulse">
                    <Star className="w-4 h-4 fill-[#E6A85C]" />
                    <span>Free Drink Available ({freeDrinksEarnedCount})</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-medium text-[#F8F6F2]">
                      <span className="text-[#E6A85C] font-bold">{pointsToNextFreeDrink} pts</span> away from a Free Drink
                    </span>
                    <span className="block text-[11px] text-[#B6BAC7] mt-0.5">
                      Spend ~${(pointsToNextFreeDrink / 10).toFixed(0)} more to unlock
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Visual Progress Track */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#10172A] rounded-full overflow-hidden border border-white/10 relative p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-[#d49344] via-[#E6A85C] to-[#FDE047] rounded-full transition-all duration-700 relative shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>

              {/* Milestones markers */}
              <div className="grid grid-cols-4 gap-1 text-[11px] pt-1">
                {MILESTONES.map((m) => {
                  const isAchieved = availablePoints >= m.points;
                  return (
                    <div key={m.points} className="flex flex-col items-center text-center">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${isAchieved ? 'bg-[#E6A85C]' : 'bg-white/20'}`} />
                        <span className={`font-mono text-[10px] ${isAchieved ? 'text-[#E6A85C] font-semibold' : 'text-[#B6BAC7]'}`}>
                          {m.points} pts
                        </span>
                      </div>
                      <span className="text-[10px] text-[#F8F6F2] font-medium mt-0.5 truncate w-full">
                        {m.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick action buttons & simulation */}
            <div className="mt-5 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#B6BAC7]">
                <TrendingUp className="w-3.5 h-3.5 text-[#E6A85C]" />
                <span>Lifetime Points Earned: <strong className="text-[#F8F6F2] font-mono">{lifetimePoints}</strong></span>
              </div>

              {onSimulateOrder && (
                <button
                  onClick={onSimulateOrder}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#E6A85C] border border-white/10 transition-colors flex items-center gap-1.5"
                  title="Simulate placing a coffee run to test real-time points accumulation"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Simulate Order (+65 pts)</span>
                </button>
              )}
            </div>
          </div>

          {/* 2. NAVIGATION TABS */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab('redeem')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'redeem'
                  ? 'bg-[#E6A85C] text-[#10172A] font-semibold shadow-md'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Redeem Drinks ({REDEEMABLE_PRODUCTS_CONFIG.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-[#E6A85C] text-[#10172A] font-semibold shadow-md'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Order History & Points Ledger ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tiers')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'tiers'
                  ? 'bg-[#E6A85C] text-[#10172A] font-semibold shadow-md'
                  : 'text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Member Perks & Tiers</span>
            </button>
          </div>

          {/* TAB CONTENT 1: REDEEM DRINKS */}
          {activeTab === 'redeem' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#B6BAC7]">
                <span>Choose a signature drink or artisanal pastry to redeem with your points:</span>
                <span className="text-[#E6A85C] font-mono">Available: {availablePoints} pts</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REDEEMABLE_PRODUCTS_CONFIG.map((config) => {
                  const product = products.find(p => p.id === config.id) || products[0];
                  const studioImg = fetchCoffeeProductImage(product);
                  const canRedeem = availablePoints >= config.pointsCost;
                  const ptsNeeded = config.pointsCost - availablePoints;

                  return (
                    <div
                      key={config.id}
                      className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                        canRedeem
                          ? 'border-[#E6A85C]/30 bg-[#1E293B]/70 hover:border-[#E6A85C]'
                          : 'border-white/10 bg-[#1E293B]/30 opacity-75'
                      }`}
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
                        <img
                          src={studioImg.src}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(e) => handleImageError(e, studioImg.fallbackSrc, studioImg.staticPath)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#10172A] via-transparent to-transparent" />

                        {/* Points Cost Pill */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#10172A]/90 text-[#E6A85C] border border-[#E6A85C]/40 flex items-center gap-1 shadow-md">
                          <Sparkles className="w-3 h-3" />
                          <span>{config.pointsCost} pts</span>
                        </div>

                        {/* Mood Tag */}
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-[#10172A]/85 text-[#B6BAC7] border border-white/10">
                          {config.category}
                        </div>

                        {/* Standard Value */}
                        <div className="absolute bottom-2 left-3 text-[11px] text-[#B6BAC7] font-mono">
                          Standard price: ${product.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-serif text-base text-[#F8F6F2] font-medium leading-snug">
                            {product.name}
                          </h4>
                          <p className="text-xs text-[#B6BAC7] mt-1 line-clamp-2 leading-relaxed">
                            {product.tagline}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                          {canRedeem ? (
                            <button
                              onClick={() => handleRedeemClick(product, config.pointsCost)}
                              className="w-full py-2 px-3 rounded-xl bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-1.5"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Redeem for {config.pointsCost} pts</span>
                            </button>
                          ) : (
                            <div className="w-full py-1.5 px-3 rounded-xl bg-white/5 text-[#B6BAC7] text-xs text-center border border-white/5">
                              <span>Need {ptsNeeded} more pts</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT 2: ORDER HISTORY & POINTS LEDGER */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Previous Orders & Points Earned */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-base text-[#F8F6F2] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E6A85C]" />
                    <span>Order History & Points Earned</span>
                  </h3>
                  <span className="text-xs text-[#B6BAC7]">
                    10 points credited per $1 spent
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center text-[#B6BAC7]">
                    <Coffee className="w-8 h-8 text-[#E6A85C] mx-auto mb-2 opacity-60" />
                    <p className="text-sm text-[#F8F6F2]">No past orders on record yet.</p>
                    <p className="text-xs text-[#B6BAC7] mt-1">
                      Orders placed through The Mood Menu automatically earn 10 points per dollar!
                    </p>
                    {onSimulateOrder && (
                      <button
                        onClick={onSimulateOrder}
                        className="mt-4 px-4 py-2 bg-[#E6A85C] text-[#10172A] rounded-xl text-xs font-semibold hover:bg-[#d49344] transition-colors"
                      >
                        Simulate Sample Order (+65 pts)
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const pointsEarned = order.pointsEarned || Math.round(order.total * 10);
                      return (
                        <div
                          key={order.orderId}
                          className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-[#F8F6F2]">
                                Order #{order.orderId}
                              </span>
                              <span className="text-[10px] text-[#B6BAC7] bg-white/10 px-2 py-0.5 rounded">
                                {order.createdAt}
                              </span>
                              <span className="text-[10px] text-[#E6A85C] capitalize">
                                {order.fulfillment}
                              </span>
                            </div>
                            <div className="text-xs text-[#B6BAC7] mt-1">
                              {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            <span className="font-mono text-xs text-[#F8F6F2]">
                              ${order.total.toFixed(2)}
                            </span>
                            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1">
                              <span>+{pointsEarned} pts</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Redemptions History */}
              <div>
                <div className="flex items-center justify-between mb-3 pt-4 border-t border-white/10">
                  <h3 className="font-serif text-base text-[#F8F6F2] flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#E6A85C]" />
                    <span>Redeemed Free Rewards Ledger</span>
                  </h3>
                  <span className="text-xs text-[#B6BAC7]">
                    {redemptions.length} Drinks Redeemed
                  </span>
                </div>

                {redemptions.length === 0 ? (
                  <p className="text-xs text-[#B6BAC7] italic">
                    No points redeemed yet. Choose a beverage in the 'Redeem Drinks' tab when you hit the milestone!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {redemptions.map((redemption) => (
                      <div
                        key={redemption.redemptionId}
                        className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-[#E6A85C]/20 text-[#E6A85C] flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[#F8F6F2] font-medium">{redemption.productName}</span>
                            <div className="text-[10px] text-[#B6BAC7] font-mono">
                              Code: {redemption.code} · {redemption.redeemedAt}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-amber-400 font-semibold">
                          -{redemption.pointsSpent} pts
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: MEMBER PERKS & TIERS */}
          {activeTab === 'tiers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Bronze */}
                <div className={`p-5 rounded-2xl border ${tier === 'Bronze Sip' ? 'border-[#E6A85C] bg-[#E6A85C]/10' : 'border-white/10 bg-white/5'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-base text-[#F8F6F2]">Bronze Sip</span>
                    <span className="text-[10px] font-mono text-[#B6BAC7]">0–199 pts</span>
                  </div>
                  <ul className="text-xs text-[#B6BAC7] space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>10 points per $1 spent</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Free beverage at 200 pts</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Birthday surprise treat</span>
                    </li>
                  </ul>
                </div>

                {/* Silver */}
                <div className={`p-5 rounded-2xl border ${tier === 'Silver Crema' ? 'border-[#E6A85C] bg-[#E6A85C]/10' : 'border-white/10 bg-white/5'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-base text-[#F8F6F2]">Silver Crema</span>
                    <span className="text-[10px] font-mono text-[#E6A85C]">200–499 pts</span>
                  </div>
                  <ul className="text-xs text-[#B6BAC7] space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>12 points per $1 spent (20% bonus)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Free Oat / Almond plant milk upgrades</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Priority express counter dispatch</span>
                    </li>
                  </ul>
                </div>

                {/* Gold */}
                <div className={`p-5 rounded-2xl border ${tier === 'Gold Ambient' ? 'border-[#E6A85C] bg-[#E6A85C]/10' : 'border-white/10 bg-white/5'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-base text-[#F8F6F2]">Gold Ambient</span>
                    <span className="text-[10px] font-mono text-[#E6A85C] font-semibold">500+ pts</span>
                  </div>
                  <ul className="text-xs text-[#B6BAC7] space-y-2 leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>15 points per $1 spent (50% bonus)</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Complimentary seasonal cupping sessions</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#E6A85C] shrink-0 mt-0.5" />
                      <span>Secret avant-garde drink drops</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-white/10 bg-[#0E1526] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#B6BAC7]">
            <Info className="w-4 h-4 text-[#E6A85C]" />
            <span>Points never expire · Redeem in-store or online</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8F6F2] font-medium transition-colors"
          >
            Done
          </button>
        </div>

        {/* Success Modal / Toast Overlay when user successfully redeems a beverage */}
        {redeemedSuccessItem && (
          <div className="absolute inset-0 z-50 bg-[#10172A]/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#1E293B] border border-[#E6A85C]/40 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
              <div className="w-16 h-16 rounded-full bg-[#E6A85C]/20 text-[#E6A85C] mx-auto flex items-center justify-center border border-[#E6A85C]/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Reward Unlocked & Claimed!
                </span>
                <h3 className="font-serif text-2xl text-[#F8F6F2] mt-1">
                  {redeemedSuccessItem.product.name}
                </h3>
                <p className="text-xs text-[#B6BAC7] mt-1.5 leading-relaxed">
                  We've added this complimentary drink to your Tray for <strong className="text-[#E6A85C]">$0.00</strong>.
                </p>
              </div>

              <div className="p-3 bg-[#10172A] rounded-xl border border-white/10 text-xs font-mono space-y-1">
                <span className="text-[#B6BAC7] text-[10px] uppercase">Barista Voucher Code</span>
                <div className="text-base font-bold text-[#E6A85C] tracking-wider">
                  {redeemedSuccessItem.code}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setRedeemedSuccessItem(null);
                    onClose();
                    onOpenTray();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>View Tray ($0.00)</span>
                </button>

                <button
                  onClick={() => setRedeemedSuccessItem(null)}
                  className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8F6F2] text-xs transition-colors"
                >
                  Keep Browsing
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
