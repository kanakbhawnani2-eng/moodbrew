import React from 'react';
import { CartItem } from '../types/cafe';
import { fetchCoffeeProductImage, handleImageError } from '../services/imageService';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Clock, Award, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQuantity: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
  onOpenLoyalty?: () => void;
  availablePoints?: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenLoyalty,
  availablePoints = 160,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.0825; // 8.25% tax
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#10172A] border-l border-white/10 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-[#10172A]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#E6A85C]" />
              <h2 className="font-serif text-lg text-[#F8F6F2]">Your Mood Tray</h2>
              <span className="text-xs font-mono text-[#B6BAC7]">
                ({items.reduce((sum, i) => sum + i.quantity, 0)})
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close tray"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Pickup Notice */}
          <div className="px-6 py-2.5 bg-[#1E293B]/60 border-b border-white/5 flex items-center justify-between text-xs text-[#B6BAC7]">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#E6A85C] shrink-0" />
              <span>Café Express Bar: ~10–12 mins</span>
            </div>
            {onOpenLoyalty && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLoyalty();
                }}
                className="flex items-center gap-1 text-[11px] text-[#E6A85C] hover:underline font-medium"
              >
                <Award className="w-3 h-3" />
                <span>{availablePoints} pts · Club</span>
              </button>
            )}
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#B6BAC7]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-[#E6A85C] mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-lg text-[#F8F6F2]">Your tray is empty</h3>
                <p className="text-xs text-[#B6BAC7] mt-1.5 max-w-xs leading-relaxed">
                  Start with the Mood Finder or explore the menu to find the beverage made for your moment.
                </p>
                <button
                  onClick={onClose}
                  className="mt-5 px-4 py-2 bg-[#E6A85C] text-[#10172A] rounded-xl text-xs font-medium hover:bg-[#d49344] transition-colors"
                >
                  Discover Drinks
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartItemId} className="py-4 flex gap-4 items-start">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
                    onError={(e) => {
                      const meta = fetchCoffeeProductImage(item.product);
                      handleImageError(e, meta.fallbackSrc, meta.staticPath);
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="text-sm font-semibold text-[#F8F6F2] truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.cartItemId)}
                        className="text-[#B6BAC7] hover:text-red-400 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customization Badges */}
                    <div className="text-[11px] text-[#B6BAC7] mt-1 space-y-0.5 leading-tight">
                      <div>
                        <span className="capitalize text-[#E6A85C]">{item.selectedTemp}</span>
                        {' · '}
                        <span className="capitalize">{item.selectedSize}</span>
                        {item.selectedMilk && ` · ${item.selectedMilk}`}
                      </div>
                      {item.selectedSweetness && (
                        <div>Sweetness: {item.selectedSweetness}</div>
                      )}
                      {item.selectedExtras.length > 0 && (
                        <div className="text-[10px] text-[#93C5FD]">
                          +{item.selectedExtras.map(e => e.label).join(', ')}
                        </div>
                      )}
                    </div>

                    {/* Redeemed Reward Indicator */}
                    {item.isRedeemed && (
                      <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E6A85C]/20 text-[#E6A85C] border border-[#E6A85C]/40">
                        <Sparkles className="w-3 h-3" />
                        <span>Loyalty Free Reward ({item.pointsCost} pts)</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity adjustments */}
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-md p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-[#B6BAC7] hover:text-[#F8F6F2] rounded"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono text-[#F8F6F2]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-[#B6BAC7] hover:text-[#F8F6F2] rounded"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        {item.isRedeemed ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] line-through text-[#B6BAC7] font-mono">
                              ${(item.unitPrice > 0 ? item.unitPrice * item.quantity : item.product.price * item.quantity).toFixed(2)}
                            </span>
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              $0.00
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-medium text-[#F8F6F2]">
                            ${item.totalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-white/10 bg-[#10172A] space-y-4">
              <div className="space-y-1.5 text-xs text-[#B6BAC7]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-[#F8F6F2]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax (8.25%)</span>
                  <span className="font-mono text-[#F8F6F2]">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-semibold text-[#F8F6F2]">
                  <span>Total Amount</span>
                  <span className="font-mono text-[#E6A85C] text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] rounded-xl font-medium text-xs transition-all shadow-lg shadow-[#E6A85C]/20"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
