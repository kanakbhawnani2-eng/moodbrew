export type MoodType = 'comfort' | 'focus' | 'adventure' | 'celebration' | 'refresh' | 'treat';

export type FlavorType = 'chocolatey' | 'creamy' | 'sweet' | 'fruity' | 'nutty' | 'bold' | 'light';

export type TempType = 'hot' | 'iced' | 'either';

export type DietaryType = 'dairy-free' | 'low-sugar' | 'none';

export type CategoryType = 
  | 'Signature Lattes'
  | 'Espresso and Coffee'
  | 'Iced Coffee'
  | 'Tea and Matcha'
  | 'Refreshers and Mocktails'
  | 'Desserts and Snacks'
  | 'Seasonal Specials';

export interface CustomizationOption {
  id: string;
  label: string;
  priceDelta: number;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  category: CategoryType;
  description: string;
  price: number;
  ingredients: string[];
  allergens: string[];
  moodTags: MoodType[];
  flavorTags: FlavorType[];
  tempOption: 'hot' | 'iced' | 'both';
  defaultTemp: 'hot' | 'iced';
  isAvailable: boolean;
  image: string;
  flavorNotes: string[];
  caffeineLevel: 'high' | 'medium' | 'low' | 'caffeine-free';
  customization: {
    sizes: CustomizationOption[];
    milks?: CustomizationOption[];
    sweetnessLevels?: string[];
    extras?: CustomizationOption[];
  };
}

export interface CartItem {
  cartItemId: string;
  product: Product;
  selectedTemp: 'hot' | 'iced';
  selectedSize: string;
  sizePriceDelta: number;
  selectedMilk?: string;
  milkPriceDelta: number;
  selectedSweetness?: string;
  selectedExtras: CustomizationOption[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
  isRedeemed?: boolean;
  pointsCost?: number;
}

export type OrderStatus = 'Received' | 'Brewing' | 'Ready for Pickup' | 'Completed';

export interface Order {
  orderId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  fulfillment: 'pickup' | 'dine-in';
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  paymentMethod: 'card' | 'apple-pay' | 'cash';
  status: OrderStatus;
  estimatedMinutes: number;
  pointsEarned?: number;
}

export interface LoyaltyRedemption {
  redemptionId: string;
  productId: string;
  productName: string;
  pointsSpent: number;
  redeemedAt: string;
  code: string;
}

export interface LoyaltyReward {
  id: string;
  productId: string;
  name: string;
  tagline: string;
  pointsCost: number;
  category: string;
  moodTag: MoodType;
  image: string;
}

