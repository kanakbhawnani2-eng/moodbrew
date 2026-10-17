import React, { useState } from 'react';
import { Product, Order, OrderStatus } from '../types/cafe';
import { fetchCoffeeProductImage, handleImageError } from '../services/imageService';
import { X, Check, Edit3, Eye, EyeOff, Coffee, Clock, DollarSign, Package } from 'lucide-react';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProduct,
  orders,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedPrice, setEditedPrice] = useState<number>(0);

  if (!isOpen) return null;

  const handleStartEdit = (product: Product) => {
    setEditingProductId(product.id);
    setEditedPrice(product.price);
  };

  const handleSavePrice = (product: Product) => {
    onUpdateProduct({
      ...product,
      price: editedPrice,
    });
    setEditingProductId(null);
  };

  const handleToggleAvailability = (product: Product) => {
    onUpdateProduct({
      ...product,
      isAvailable: !product.isAvailable,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#10172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10172A] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-[#E6A85C]/20 text-[#E6A85C]">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-[#F8F6F2]">Café Barista & Manager Console</h2>
              <p className="text-[11px] text-[#B6BAC7]">Live orders, inventory availability, and pricing</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 px-6 border-b border-white/10 bg-[#1E293B]/40 shrink-0">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'orders'
                ? 'border-[#E6A85C] text-[#E6A85C]'
                : 'border-transparent text-[#B6BAC7] hover:text-[#F8F6F2]'
            }`}
          >
            Live Orders Queue ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-[#E6A85C] text-[#E6A85C]'
                : 'border-transparent text-[#B6BAC7] hover:text-[#F8F6F2]'
            }`}
          >
            Drink Menu & Stock ({products.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="py-16 text-center text-[#B6BAC7]">
                <Package className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-sm">No incoming orders yet.</p>
                <p className="text-xs text-[#B6BAC7] mt-1">
                  Place an order from the Mood Finder or Menu to see live ticket progression.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.orderId}
                    className="p-4 bg-[#1E293B]/50 border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#E6A85C]">
                          #{order.orderId}
                        </span>
                        <span className="text-xs text-[#B6BAC7]">· {order.createdAt}</span>
                        <span className="text-xs text-[#F8F6F2] font-semibold">
                          {order.customer.name}
                        </span>
                        <span className="text-[11px] text-[#B6BAC7] capitalize">
                          ({order.fulfillment})
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-[#F8F6F2] space-y-0.5">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="text-[#B6BAC7]">
                            <span className="text-[#F8F6F2] font-medium">{it.quantity}x {it.product.name}</span>
                            {' '}({it.selectedTemp}, {it.selectedSize}
                            {it.selectedMilk ? `, ${it.selectedMilk}` : ''})
                          </div>
                        ))}
                      </div>

                      {order.customer.notes && (
                        <p className="text-[11px] text-[#93C5FD] mt-1.5 italic">
                          Notes: {order.customer.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#B6BAC7] block">Ticket Total</span>
                        <span className="font-mono text-sm text-[#F8F6F2] font-semibold">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={order.status}
                        onChange={(e) => onUpdateOrderStatus(order.orderId, e.target.value as OrderStatus)}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium bg-[#10172A] focus:outline-none ${
                          order.status === 'Completed'
                            ? 'border-emerald-500/50 text-emerald-400'
                            : order.status === 'Ready for Pickup'
                            ? 'border-blue-500/50 text-blue-400'
                            : order.status === 'Brewing'
                            ? 'border-amber-500/50 text-amber-400'
                            : 'border-white/20 text-[#F8F6F2]'
                        }`}
                      >
                        <option value="Received">Received</option>
                        <option value="Brewing">Brewing</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-2">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 bg-[#1E293B]/40 border border-white/5 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        const meta = fetchCoffeeProductImage(prod);
                        handleImageError(e, meta.fallbackSrc, meta.staticPath);
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-[#F8F6F2] truncate">{prod.name}</h4>
                      <p className="text-[11px] text-[#B6BAC7]">{prod.category} · {prod.moodTags.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {/* Price edit */}
                    {editingProductId === prod.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#B6BAC7]">$</span>
                        <input
                          type="number"
                          step="0.25"
                          value={editedPrice}
                          onChange={(e) => setEditedPrice(parseFloat(e.target.value) || 0)}
                          className="w-16 bg-[#10172A] border border-[#E6A85C] rounded px-1.5 py-0.5 text-xs text-[#F8F6F2] font-mono"
                        />
                        <button
                          onClick={() => handleSavePrice(prod)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save price"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#F8F6F2]">
                          ${prod.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleStartEdit(prod)}
                          className="text-[#B6BAC7] hover:text-[#E6A85C] p-1"
                          title="Edit price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Stock availability toggle */}
                    <button
                      onClick={() => handleToggleAvailability(prod)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                        prod.isAvailable
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : 'border-red-500/30 text-red-400 bg-red-500/10'
                      }`}
                    >
                      {prod.isAvailable ? (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>In Stock</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Sold Out</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
