import React, { useState } from 'react';
import { MoodType, FlavorType, TempType, DietaryType, Product, CustomizationOption } from '../types/cafe';
import { fetchCoffeeProductImage } from '../services/imageService';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, Check, ShoppingBag, Sliders, X, Flame, Snowflake, Heart, Camera } from 'lucide-react';
import { ThreeDrinkCanvas } from './ThreeDrinkCanvas';

interface MoodFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
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
  onSelectProductForDetails?: (product: Product) => void;
}

interface Answers {
  mood?: MoodType;
  flavor?: FlavorType;
  temp: TempType;
  dietary: DietaryType;
}

const MOOD_OPTIONS: { id: MoodType; title: string; subtitle: string; icon: string; accentColor: string }[] = [
  { id: 'comfort', title: 'I need comfort.', subtitle: 'Warm, familiar, embracing flavors to unwind', icon: '☕', accentColor: '#E6A85C' },
  { id: 'focus', title: 'I need to focus.', subtitle: 'Clean, bold, clarifying notes for deep work', icon: '🎯', accentColor: '#60A5FA' },
  { id: 'adventure', title: 'I’m feeling adventurous.', subtitle: 'Complex, unexpected botanicals and spices', icon: '✨', accentColor: '#A855F7' },
  { id: 'celebration', title: 'I’m in a celebratory mood.', subtitle: 'Indulgent caramel, sparkle, and effervescence', icon: '🥂', accentColor: '#F59E0B' },
  { id: 'refresh', title: 'I want something refreshing.', subtitle: 'Chilled citrus, botanical mint, crisp clarity', icon: '🍃', accentColor: '#10B981' },
  { id: 'treat', title: 'I just want a little treat.', subtitle: 'Velvety sweetness and dessert-like indulgence', icon: '🍰', accentColor: '#F472B6' },
];

const FLAVOR_OPTIONS: { id: FlavorType; title: string; desc: string }[] = [
  { id: 'chocolatey', title: 'Chocolatey', desc: 'Rich Valrhona dark cocoa, fudge, and cacao nibs' },
  { id: 'creamy', title: 'Sweet & Creamy', desc: 'Velvety microfoam, vanilla bean, and honey caramel' },
  { id: 'fruity', title: 'Fruity', desc: 'Ruby blood orange, white peach, and wild berry' },
  { id: 'nutty', title: 'Nutty', desc: 'Roasted almond, Sicilian pistachio, and toasted hazelnut' },
  { id: 'bold', title: 'Bold & Bitter', desc: 'Deep single-origin espresso with complex roast character' },
  { id: 'light', title: 'Light & Refreshing', desc: 'Floral botanicals, spearmint, and mineral clarity' },
];

export const MoodFinderModal: React.FC<MoodFinderModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddToCart,
  onSelectProductForDetails,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 'result'>(1);
  const [answers, setAnswers] = useState<Answers>({
    mood: undefined,
    flavor: undefined,
    temp: 'either',
    dietary: 'none',
  });

  // Customization state for recommended drink
  const [selectedTemp, setSelectedTemp] = useState<'hot' | 'iced'>('hot');
  const [selectedSize, setSelectedSize] = useState('regular');
  const [selectedMilk, setSelectedMilk] = useState('whole');
  const [selectedSweetness, setSelectedSweetness] = useState('100% Standard');
  const [selectedExtras, setSelectedExtras] = useState<CustomizationOption[]>([]);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [show3DPreview, setShow3DPreview] = useState(true);

  if (!isOpen) return null;

  // Recommendation engine
  const computeRecommendations = () => {
    const scores = products.map((product) => {
      let score = 0;
      if (answers.mood && product.moodTags.includes(answers.mood)) score += 5;
      if (answers.flavor && product.flavorTags.includes(answers.flavor)) score += 4;
      if (answers.temp !== 'either') {
        if (product.tempOption === answers.temp || product.tempOption === 'both') score += 2;
        else score -= 3;
      }
      if (answers.dietary === 'dairy-free') {
        if (product.allergens.some(a => a.toLowerCase().includes('dairy') || a.toLowerCase().includes('milk'))) {
          // If milk customization exists, it's ok, but give slight preference to naturally dairy free
          score += 1;
        } else {
          score += 3;
        }
      }
      return { product, score };
    });

    scores.sort((a, b) => b.score - a.score);
    const topMatch = scores[0]?.product || products[0];
    const alternatives = scores.slice(1, 4).map(s => s.product);

    return { topMatch, alternatives };
  };

  const { topMatch, alternatives } = computeRecommendations();

  const handleNext = () => {
    if (step === 1 && answers.mood) setStep(2);
    else if (step === 2 && answers.flavor) setStep(3);
    else if (step === 3) setStep(4);
    else if (step === 4) {
      // Set defaults for recommended drink
      const targetTemp = answers.temp === 'either' ? topMatch.defaultTemp : (answers.temp as 'hot' | 'iced');
      setSelectedTemp(targetTemp);
      if (answers.dietary === 'dairy-free') {
        setSelectedMilk('oat');
      } else {
        setSelectedMilk('whole');
      }
      setStep('result');
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
    else if (step === 'result') setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setAnswers({
      mood: undefined,
      flavor: undefined,
      temp: 'either',
      dietary: 'none',
    });
  };

  // Price calculation for top match
  const sizeOption = topMatch.customization.sizes.find(s => s.id === selectedSize);
  const sizeDelta = sizeOption ? sizeOption.priceDelta : 0;
  const milkOption = topMatch.customization.milks?.find(m => m.id === selectedMilk);
  const milkDelta = milkOption ? milkOption.priceDelta : 0;
  const extrasDelta = selectedExtras.reduce((sum, extra) => sum + extra.priceDelta, 0);
  const calculatedPrice = topMatch.price + sizeDelta + milkDelta + extrasDelta;

  const handleAddTopToCart = () => {
    onAddToCart(topMatch, {
      selectedTemp,
      selectedSize,
      sizePriceDelta: sizeDelta,
      selectedMilk: topMatch.customization.milks ? selectedMilk : undefined,
      milkPriceDelta: milkDelta,
      selectedSweetness: topMatch.customization.sweetnessLevels ? selectedSweetness : undefined,
      selectedExtras,
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose();
    }, 1200);
  };

  const toggleExtra = (extra: CustomizationOption) => {
    if (selectedExtras.some(e => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#10172A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#10172A]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6A85C]" />
            <span className="font-serif text-lg tracking-wide text-[#F8F6F2]">
              {step === 'result' ? 'Your Recommended Beverage' : 'The Mood Finder'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {step !== 'result' && (
              <span className="text-xs text-[#B6BAC7] font-mono">
                Step {step} of 4
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-[#B6BAC7] hover:text-[#F8F6F2] hover:bg-white/5 rounded-lg transition-colors"
              aria-label="Close Mood Finder"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 min-h-[460px]">
          {/* STEP 1: MOOD */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Step 01
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1 font-normal">
                  How are you feeling today?
                </h2>
                <p className="text-sm text-[#B6BAC7] mt-2">
                  Select your current emotional state or the feeling you want to invoke.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {MOOD_OPTIONS.map((mood) => {
                  const isSelected = answers.mood === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => setAnswers({ ...answers, mood: mood.id })}
                      className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#E6A85C] bg-[#E6A85C]/10 ring-1 ring-[#E6A85C]'
                          : 'border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="text-2xl mb-2">{mood.icon}</div>
                        <h3 className="font-medium text-[#F8F6F2] text-base">{mood.title}</h3>
                        <p className="text-xs text-[#B6BAC7] mt-1 leading-relaxed">{mood.subtitle}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="capitalize" style={{ color: mood.accentColor }}>{mood.id}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#E6A85C]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: FLAVOUR */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Step 02
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1 font-normal">
                  What flavour sounds good?
                </h2>
                <p className="text-sm text-[#B6BAC7] mt-2">
                  Choose the dominant sensory profile you are craving right now.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {FLAVOR_OPTIONS.map((f) => {
                  const isSelected = answers.flavor === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setAnswers({ ...answers, flavor: f.id })}
                      className={`text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#E6A85C] bg-[#E6A85C]/10 ring-1 ring-[#E6A85C]'
                          : 'border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#F8F6F2] text-base">{f.title}</h3>
                        {isSelected && <Check className="w-4 h-4 text-[#E6A85C]" />}
                      </div>
                      <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">{f.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: TEMPERATURE */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Step 03
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1 font-normal">
                  Hot or cold?
                </h2>
                <p className="text-sm text-[#B6BAC7] mt-2">
                  Select your thermal preference for this moment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'hot', title: 'Hot & Steaming', desc: 'Silky microfoam, warm ceramics, soothing steam', icon: Flame },
                  { id: 'iced', title: 'Iced & Chilled', desc: 'Hand-carved ice cubes, crisp condensation, chilled straw', icon: Snowflake },
                  { id: 'either', title: 'Either / Barista Choice', desc: 'Let the beverage recipe dictate the ideal serving style', icon: Sparkles },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = answers.temp === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setAnswers({ ...answers, temp: t.id as TempType })}
                      className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#E6A85C] bg-[#E6A85C]/10 ring-1 ring-[#E6A85C]'
                          : 'border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <div className="p-2 w-fit rounded-lg bg-white/5 mb-3 text-[#E6A85C]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-medium text-[#F8F6F2] text-base">{t.title}</h3>
                        <p className="text-xs text-[#B6BAC7] mt-1 leading-relaxed">{t.desc}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        {isSelected && <Check className="w-4 h-4 text-[#E6A85C]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: DIETARY PREFERENCES */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="max-w-xl">
                <span className="text-xs uppercase tracking-widest text-[#E6A85C] font-semibold">
                  Step 04
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1 font-normal">
                  Dietary preferences
                </h2>
                <p className="text-sm text-[#B6BAC7] mt-2">
                  We cater to wholesome plant-based and low-glycemic dietary choices.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'dairy-free', title: 'Dairy-Free Options', desc: 'Default to plant milks (Oat, Almond, or Coconut) and vegan creams' },
                  { id: 'low-sugar', title: 'Lower-Sugar Options', desc: 'Lightly sweetened or unrefined botanicals without heavy syrups' },
                  { id: 'none', title: 'No Additional Preference', desc: 'Craft as traditionally intended by our head mixologist' },
                ].map((d) => {
                  const isSelected = answers.dietary === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setAnswers({ ...answers, dietary: d.id as DietaryType })}
                      className={`text-left p-5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#E6A85C] bg-[#E6A85C]/10 ring-1 ring-[#E6A85C]'
                          : 'border-white/10 bg-[#1E293B]/40 hover:bg-[#1E293B] hover:border-white/20'
                      }`}
                    >
                      <div>
                        <h3 className="font-medium text-[#F8F6F2] text-base">{d.title}</h3>
                        <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">{d.desc}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-end">
                        {isSelected && <Check className="w-4 h-4 text-[#E6A85C]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP RESULT: DRINK REVEAL & CUSTOMIZATION */}
          {step === 'result' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Visual Column: 3D Canvas / Photo Toggle */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-white/10 bg-[#0B0F19]">
                    {show3DPreview ? (
                      <ThreeDrinkCanvas
                        activeMood={answers.mood || 'comfort'}
                        drinkType={selectedTemp}
                        isInteractive={true}
                        className="w-full h-full"
                      />
                    ) : (() => {
                      const studioImg = fetchCoffeeProductImage(topMatch);
                      return (
                        <div className="relative w-full h-full">
                          <img
                            src={studioImg.src}
                            alt={studioImg.alt}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#10172A]/80 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-[#F8F6F2] bg-[#10172A]/90 border border-white/10">
                            <Camera className="w-3 h-3 text-[#E6A85C]" />
                            <span className="font-mono text-[#B6BAC7]">{studioImg.cameraAngle}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* View Switcher button */}
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() => setShow3DPreview(!show3DPreview)}
                        className="px-2.5 py-1 text-xs text-[#F8F6F2] bg-[#10172A]/80 hover:bg-[#1E293B] border border-white/20 rounded-md transition-colors"
                      >
                        {show3DPreview ? 'View Studio Photo' : 'Interactive 3D'}
                      </button>
                    </div>

                    {/* Mood tag badge */}
                    <div className="absolute top-3 left-3 z-20 px-2.5 py-1 text-xs text-[#10172A] bg-[#E6A85C] font-semibold rounded-md uppercase tracking-wider">
                      Match for {answers.mood || 'Your Mood'}
                    </div>
                  </div>

                  {/* Tasting Notes */}
                  <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[11px] uppercase tracking-wider text-[#B6BAC7] font-medium block mb-1.5">
                      Flavour Notes
                    </span>
                    <div className="flex flex-wrap gap-1.5 text-xs text-[#F8F6F2]">
                      {topMatch.flavorNotes.map((note, idx) => (
                        <span key={idx} className="bg-white/10 px-2 py-0.5 rounded">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Details & Customization Column */}
                <div className="lg:col-span-7 space-y-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#E6A85C] uppercase tracking-wider font-semibold">
                      <span>{topMatch.category}</span>
                      <span>·</span>
                      <span>{topMatch.caffeineLevel} Caffeine</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif text-[#F8F6F2] mt-1 font-normal">
                      {topMatch.name}
                    </h2>
                    <p className="text-sm text-[#B6BAC7] mt-1 italic font-accent text-base">
                      "{topMatch.tagline}"
                    </p>
                    <p className="text-xs text-[#B6BAC7] mt-2 leading-relaxed">
                      {topMatch.description}
                    </p>
                  </div>

                  {/* Ingredients Disclosure */}
                  <div className="text-xs text-[#B6BAC7] border-t border-b border-white/10 py-2.5 space-y-1">
                    <div>
                      <strong className="text-[#F8F6F2]">Ingredients: </strong>
                      {topMatch.ingredients.join(', ')}
                    </div>
                    <div>
                      <strong className="text-[#F8F6F2]">Allergens: </strong>
                      {topMatch.allergens.join(', ')}
                    </div>
                  </div>

                  {/* Customization Options */}
                  <div className="space-y-3">
                    {/* Temperature Toggle */}
                    {topMatch.tempOption === 'both' && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#B6BAC7]">Serving:</span>
                        <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-lg border border-white/10">
                          <button
                            onClick={() => setSelectedTemp('hot')}
                            className={`px-3 py-1 rounded-md transition-colors ${
                              selectedTemp === 'hot'
                                ? 'bg-[#E6A85C] text-[#10172A] font-semibold'
                                : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                            }`}
                          >
                            Hot
                          </button>
                          <button
                            onClick={() => setSelectedTemp('iced')}
                            className={`px-3 py-1 rounded-md transition-colors ${
                              selectedTemp === 'iced'
                                ? 'bg-[#E6A85C] text-[#10172A] font-semibold'
                                : 'text-[#B6BAC7] hover:text-[#F8F6F2]'
                            }`}
                          >
                            Iced
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Size Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#B6BAC7]">Cup Size:</span>
                      <div className="flex items-center gap-1.5">
                        {topMatch.customization.sizes.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedSize(s.id)}
                            className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                              selectedSize === s.id
                                ? 'border-[#E6A85C] bg-[#E6A85C]/15 text-[#E6A85C] font-medium'
                                : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                            }`}
                          >
                            {s.label} {s.priceDelta > 0 && `(+$${s.priceDelta.toFixed(2)})`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Milk Selector (if applicable) */}
                    {topMatch.customization.milks && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#B6BAC7]">Milk Choice:</span>
                        <select
                          value={selectedMilk}
                          onChange={(e) => setSelectedMilk(e.target.value)}
                          className="bg-[#1E293B] text-[#F8F6F2] border border-white/15 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E6A85C]"
                        >
                          {topMatch.customization.milks.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label} {m.priceDelta > 0 ? `(+$${m.priceDelta.toFixed(2)})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Sweetness Selector */}
                    {topMatch.customization.sweetnessLevels && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#B6BAC7]">Sweetness:</span>
                        <select
                          value={selectedSweetness}
                          onChange={(e) => setSelectedSweetness(e.target.value)}
                          className="bg-[#1E293B] text-[#F8F6F2] border border-white/15 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E6A85C]"
                        >
                          {topMatch.customization.sweetnessLevels.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Extras */}
                    {topMatch.customization.extras && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] uppercase tracking-wider text-[#B6BAC7] block">
                          Add artisanal touches:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {topMatch.customization.extras.map((extra) => {
                            const isAdded = selectedExtras.some(e => e.id === extra.id);
                            return (
                              <button
                                key={extra.id}
                                onClick={() => toggleExtra(extra)}
                                className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                                  isAdded
                                    ? 'border-[#E6A85C] bg-[#E6A85C]/20 text-[#E6A85C]'
                                    : 'border-white/10 text-[#B6BAC7] hover:text-[#F8F6F2]'
                                }`}
                              >
                                {isAdded ? '✓ ' : '+ '}
                                {extra.label} (+${extra.priceDelta.toFixed(2)})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="pt-3 flex items-center justify-between border-t border-white/10">
                    <div>
                      <span className="text-[11px] text-[#B6BAC7] block">Total for this Drink</span>
                      <span className="text-2xl font-serif text-[#F8F6F2] font-semibold tabular-nums">
                        ${calculatedPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReset}
                        className="px-3 py-2 text-xs text-[#B6BAC7] hover:text-[#F8F6F2] transition-colors"
                      >
                        Retake Quiz
                      </button>

                      <button
                        onClick={handleAddTopToCart}
                        disabled={addedAnimation}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                          addedAnimation
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A] shadow-lg shadow-[#E6A85C]/20'
                        }`}
                      >
                        {addedAnimation ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Your Order!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Order This Drink</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alternative Recommendations (PRD Requirement: Users must be able to view alternative recommendations) */}
              {alternatives.length > 0 && (
                <div className="pt-6 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif text-[#F8F6F2] tracking-wide">
                      Alternative Recommendations for Your Mood
                    </h3>
                    <span className="text-xs text-[#B6BAC7]">
                      Other drinks calibrated for your mood profile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {alternatives.map((alt) => (
                      <div
                        key={alt.id}
                        className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={alt.image}
                            alt={alt.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-xs font-semibold text-[#F8F6F2]">{alt.name}</h4>
                            <p className="text-[11px] text-[#B6BAC7] line-clamp-1">{alt.tagline}</p>
                            <span className="text-xs font-mono text-[#E6A85C] mt-1 block">
                              ${alt.price.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] text-[#B6BAC7] uppercase">
                            {alt.moodTags.join(' · ')}
                          </span>
                          <button
                            onClick={() => {
                              if (onSelectProductForDetails) {
                                onSelectProductForDetails(alt);
                                onClose();
                              }
                            }}
                            className="text-xs text-[#E6A85C] hover:underline"
                          >
                            Customize →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Navigation Footer (Steps 1-4) */}
        {step !== 'result' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#10172A]/80">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#B6BAC7] hover:text-[#F8F6F2] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Skip question
                  handleNext();
                }}
                className="text-xs text-[#B6BAC7] hover:text-[#F8F6F2] transition-colors"
              >
                Skip Question
              </button>

              <button
                onClick={handleNext}
                disabled={step === 1 && !answers.mood}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-colors ${
                  step === 1 && !answers.mood
                    ? 'bg-white/10 text-[#B6BAC7] cursor-not-allowed'
                    : 'bg-[#E6A85C] hover:bg-[#d49344] text-[#10172A]'
                }`}
              >
                <span>{step === 4 ? 'Reveal My Drink' : 'Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
