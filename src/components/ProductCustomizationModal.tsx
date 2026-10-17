import React, { useState } from 'react';
import { Product, CustomizationOption } from '../types/cafe';
import { fetchCoffeeProductImage } from '../services/imageService';
import { X, Check, Flame, Snowflake, Plus, Minus, ShoppingBag, Camera } from 'lucide-react';

interface ProductCustomizationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, options: {
    selectedTemp: 'hot' | 'iced';
    selectedSize: string;
    sizePriceDelta: number;
    selectedMilk?: string;
    milkPriceDelta: number;
    selectedSweetness?: string;
    selectedExtras: CustomizationOption[];
    quantity: number;
  }) => void;
}

export const ProductCustomizationModal: React.FC<ProductCustomizationModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  if (!isOpen || !product) return null;

  const [selectedTemp, setSelectedTemp] = useState<'hot' | 'iced'>(product.defaultTemp);
  const [selectedSize, setSelectedSize] = useState(product.customization.sizes[0]?.id || 'regular');
  const [selectedMilk, setSelectedMilk] = useState(product.customization.milks?.[0]?.id || 'whole');
  const [selectedSweetness, setSelectedSweetness] = useState(product.customization.sweetnessLevels?.[0] || '100% Standard');
  const [selectedExtras, setSelectedExtras] = useState<CustomizationOption[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const sizeOption = product.customization.sizes.find(s => s.id === selectedSize);
  const sizeDelta = sizeOption ? sizeOption.priceDelta : 0;
  const milkOption = product.customization.milks?.find(m => m.id === selectedMilk);
  const milkDelta = milkOption ? milkOption.priceDelta : 0;
  const extrasDelta = selectedExtras.reduce((sum, e) => sum + e.priceDelta, 0);

  const unitPrice = product.price + sizeDelta + milkDelta + extrasDelta;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extra: CustomizationOption) => {
    if (selectedExtras.some(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, {
      selectedTemp,
      selectedSize,
      sizePriceDelta: sizeDelta,
      selectedMilk: product.customization.milks ? selectedMilk : undefined,
      milkPriceDelta: milkDelta,
      selectedSweetness: product.customization.sweetnessLevels ? selectedSweetness : undefined,
      selectedExtras,
      quantity,
    });
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#10172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header with studio image preview */}
        {(() => {
          const studioImage = fetchCoffeeProductImage(product);
          return (
            <div className="relative h-48 sm:h-56 w-full overflow-hidden">
              <img
                src={studioImage.src}
                alt={studioImage.alt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10172A] via-[#10172A]/40 to-transparent" />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-[#10172A]/80 hover:bg-[#10172A] text-[#B6BAC7] hover:text-[#F8F6F2] rounded-full border border-white/10 transition-colors z-10"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Studio Camera Spec badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-[#F8F6F2] bg-[#10172A]/85 border border-white/10">
                <Camera className="w-3 h-3 text-[#E6A85C]" />
                <span className="font-mono text-[#B6BAC7]">{studioImage.cameraAngle}</span>
              </div>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#E6A85C] font-semibold">
                  <span>{product.category}</span>
                  <span>·</span>
                  <span className="capitalize">{product.moodTags.join(', ')} Mood</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-0.5">
                  {product.name}
                </h2>
              </div>
            </div>
          );
        })()}

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-[#B6BAC7] leading-relaxed">
            {product.description}
          </p>

          {/* Flavor Notes */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[#B6BAC7] mr-1">Tasting Notes:</span>
            {product.flavorNotes.map((note, i) => (
              <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[#F8F6F2]">
                {note}
              </span>
            ))}
          </div>

          {/* Ingredients & Allergens Disclosure */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-[#B6BAC7] space-y-1">
            <div>
              <span className="font-semibold text-[#F8F6F2]">Ingredients: </span>
              {product.ingredients.join(', ')}
            </div>
            <div>
              <span className="font-semibold text-[#F8F6F2]">Allergens: </span>
              {product.allergens.join(', ')}
            </div>
          </div>

          {/* Customization Controls */}
          <div className="space-y-4 pt-2">
            {/* Temperature Option */}
            {product.tempOption === 'both' && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                  Temperature
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTemp('hot')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedTemp === 'hot'
                        ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                        : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Hot</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTemp('iced')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                      selectedTemp === 'iced'
                        ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                        : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                    }`}
                  >
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>Iced</span>
                  </button>
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.customization.sizes.length > 1 && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                  Cup Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.customization.sizes.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSize(s.id)}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        selectedSize === s.id
                          ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                          : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                      }`}
                    >
                      <span>{s.label}</span>
                      {s.priceDelta > 0 && <span className="font-mono">+${s.priceDelta.toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Milk Options */}
            {product.customization.milks && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                  Milk Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {product.customization.milks.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMilk(m.id)}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        selectedMilk === m.id
                          ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                          : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                      }`}
                    >
                      <span>{m.label}</span>
                      {m.priceDelta > 0 && <span className="font-mono">+${m.priceDelta.toFixed(2)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sweetness */}
            {product.customization.sweetnessLevels && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                  Sweetness Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {product.customization.sweetnessLevels.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedSweetness(lvl)}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-medium text-center transition-colors ${
                        selectedSweetness === lvl
                          ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                          : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras */}
            {product.customization.extras && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[#B6BAC7] block mb-2 font-medium">
                  Artisanal Add-ons
                </label>
                <div className="space-y-1.5">
                  {product.customization.extras.map((extra) => {
                    const isSelected = selectedExtras.some(e => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        type="button"
                        onClick={() => toggleExtra(extra)}
                        className={`w-full flex items-center justify-between py-2 px-3 rounded-lg border text-xs transition-colors ${
                          isSelected
                            ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C]'
                            : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isSelected ? <Check className="w-3.5 h-3.5 text-[#E6A85C]" /> : <Plus className="w-3.5 h-3.5" />}
                          <span>{extra.label}</span>
                        </span>
                        <span className="font-mono">+${extra.priceDelta.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10 bg-[#10172A] flex items-center justify-between">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-1 text-[#B6BAC7] hover:text-[#F8F6F2] rounded"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-8 text-center text-xs font-mono font-medium text-[#F8F6F2]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-1 text-[#B6BAC7] hover:text-[#F8F6F2] rounded"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-[#B6BAC7] uppercase block">Total</span>
              <span className="text-xl font-serif text-[#F8F6F2] font-semibold tabular-nums">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleAdd}
              disabled={addedSuccess}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-xs transition-all ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] shadow-lg shadow-[#E6A85C]/20'
              }`}
            >
              {addedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
