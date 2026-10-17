import React, { useState } from 'react';
import { CartItem, Order } from '../types/cafe';
import { X, CheckCircle2, CreditCard, DollarSign, Smartphone, ShieldCheck, MapPin, Coffee, ArrowLeft, Award, Sparkles } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (order: Order) => void;
  onClearCart: () => void;
  onOpenLoyalty?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
  onClearCart,
  onOpenLoyalty,
}) => {
  if (!isOpen) return null;

  const [fulfillment, setFulfillment] = useState<'pickup' | 'dine-in'>('pickup');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple-pay' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please provide your name for pickup order call.');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please provide a mobile number for order notifications.');
      return;
    }

    setIsProcessing(true);

    // Simulate reliable payment verification
    setTimeout(() => {
      const orderId = `MM-${Math.floor(1000 + Math.random() * 9000)}`;
      const pointsEarned = Math.round(total * 10);
      const newOrder: Order = {
        orderId,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        items: [...items],
        subtotal,
        tax,
        total,
        fulfillment,
        customer: {
          name: customerName,
          email: customerEmail || 'guest@themoodmenu.com',
          phone: customerPhone,
          notes: fulfillment === 'dine-in' ? `Table #${tableNumber}. ${notes}` : notes,
        },
        paymentMethod,
        status: 'Received',
        estimatedMinutes: 12,
        pointsEarned,
      };

      setIsProcessing(false);
      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
      onClearCart();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#10172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10172A]">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-[#E6A85C]" />
            <h2 className="font-serif text-lg text-[#F8F6F2]">
              {completedOrder ? 'Order Confirmed' : 'Checkout & Barista Dispatch'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                Order Placed Successfully
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1">
                Order #{completedOrder.orderId}
              </h3>
              <p className="text-xs text-[#B6BAC7] mt-2">
                Thank you, <strong className="text-[#F8F6F2]">{completedOrder.customer.name}</strong>. Our barista is freshly pulling your shots.
              </p>
            </div>

            {/* Live Status Tracker */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B6BAC7]">Preparation Status:</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E6A85C]/20 text-[#E6A85C] border border-[#E6A85C]/30">
                  {completedOrder.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B6BAC7]">Estimated Wait:</span>
                <span className="font-mono text-[#F8F6F2] font-semibold">
                  ~{completedOrder.estimatedMinutes} mins
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#B6BAC7]">Fulfilment:</span>
                <span className="text-[#F8F6F2] capitalize">
                  {completedOrder.fulfillment === 'pickup' ? 'Counter Pickup (Arts District)' : 'Dine-In Table'}
                </span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="text-left text-xs text-[#B6BAC7] border-t border-b border-white/10 py-3 space-y-1.5">
              <span className="font-semibold text-[#F8F6F2] block mb-1">Drink Summary:</span>
              {completedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>
                    {item.quantity}x {item.product.name} ({item.selectedTemp}, {item.selectedSize})
                  </span>
                  <span className="font-mono text-[#F8F6F2]">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-white/5 font-semibold text-[#F8F6F2]">
                <span>Total Paid</span>
                <span className="text-[#E6A85C] font-mono">${completedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Points Earned Banner */}
            <div className="p-3.5 bg-[#E6A85C]/10 border border-[#E6A85C]/30 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-left">
                <Award className="w-4 h-4 text-[#E6A85C] shrink-0" />
                <div>
                  <span className="font-semibold text-[#F8F6F2]">
                    +{completedOrder.pointsEarned} Points Added!
                  </span>
                  <span className="text-[11px] text-[#B6BAC7] block">
                    You're closer to your next complimentary beverage.
                  </span>
                </div>
              </div>
              {onOpenLoyalty && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLoyalty();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#E6A85C] text-[#10172A] font-semibold text-[11px] hover:bg-[#d49344] transition-colors shrink-0 shadow-sm"
                >
                  View Rewards
                </button>
              )}
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 text-[#F8F6F2] rounded-xl text-xs font-medium transition-colors"
              >
                Return to The Mood Menu
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Fulfilment Toggle */}
            <div>
              <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                1. Fulfilment Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                    fulfillment === 'pickup'
                      ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#F8F6F2]'
                      : 'border-white/10 text-[#B6BAC7] hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-[#F8F6F2]">Quick Counter Pickup</div>
                  <div className="text-[11px] text-[#B6BAC7] mt-0.5">Express pickup bar ready in 10-12 mins</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillment('dine-in')}
                  className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                    fulfillment === 'dine-in'
                      ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#F8F6F2]'
                      : 'border-white/10 text-[#B6BAC7] hover:border-white/20'
                  }`}
                >
                  <div className="font-semibold text-[#F8F6F2]">Dine-In Table Delivery</div>
                  <div className="text-[11px] text-[#B6BAC7] mt-0.5">Delivered straight to your café seat</div>
                </button>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block font-medium">
                2. Guest Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#B6BAC7] block mb-1">Your Name *</span>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Somya Patel"
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#E6A85C]"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-[#B6BAC7] block mb-1">Mobile Phone *</span>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 019-2834"
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#E6A85C]"
                  />
                </div>
              </div>

              {fulfillment === 'dine-in' && (
                <div>
                  <span className="text-[11px] text-[#B6BAC7] block mb-1">Table Number (see table marker)</span>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="e.g. Table 07"
                    className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#E6A85C]"
                  />
                </div>
              )}

              <div>
                <span className="text-[11px] text-[#B6BAC7] block mb-1">Special Notes / Allergens</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra hot, separate lid, or please call my name"
                  className="w-full bg-[#1E293B] border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F8F6F2] focus:outline-none focus:border-[#E6A85C]"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block font-medium">
                3. Payment
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Credit Card', icon: CreditCard },
                  { id: 'apple-pay', label: 'Apple Pay / Digital', icon: Smartphone },
                  { id: 'cash', label: 'Pay at Counter', icon: DollarSign },
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition-colors ${
                        isSelected
                          ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                          : 'border-white/10 text-[#B6BAC7] hover:border-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security note & Total */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-[#B6BAC7]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Encrypted Order Transmission</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#B6BAC7] block">Total Amount</span>
                <span className="text-lg font-serif font-semibold text-[#E6A85C] font-mono">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-medium text-xs transition-all ${
                isProcessing
                  ? 'bg-white/10 text-[#B6BAC7] cursor-wait'
                  : 'bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] shadow-lg shadow-[#E6A85C]/20'
              }`}
            >
              {isProcessing ? 'Verifying with Café Terminal...' : `Confirm & Place Order ($${total.toFixed(2)})`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
