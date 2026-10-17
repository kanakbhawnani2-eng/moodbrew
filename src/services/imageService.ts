/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../types/cafe';

// Pre-generated Studio Imagery assets created via the Image Generation tool
import softLandingImg from '../assets/images/drink_soft_landing_1792082480097.jpg';
import goldenHourImg from '../assets/images/drink_golden_hour_1792082481328.jpg';
import citrusStateImg from '../assets/images/drink_citrus_state_1792082480315.jpg';
import velvetOrbitImg from '../assets/images/drink_velvet_orbit_1792082480440.jpg';
import espressoRitualImg from '../assets/images/drink_espresso_ritual_1792084551480.jpg';
import icedAmericanoImg from '../assets/images/drink_iced_americano_1792084553134.jpg';
import cocoaCloudImg from '../assets/images/drink_cocoa_cloud_1792084552527.jpg';
import mintColdBrewImg from '../assets/images/drink_mint_coldbrew_1792084552939.jpg';
import kyotoMatchaImg from '../assets/images/drink_kyoto_matcha_1792084554095.jpg';
import wildCardImg from '../assets/images/drink_wild_card_1792084904781.jpg';
import afterglowImg from '../assets/images/drink_afterglow_mocktail_1792084905498.jpg';
import cardamomBriocheImg from '../assets/images/pastry_cardamom_brioche_1792084905842.jpg';
import truffleBrownieImg from '../assets/images/pastry_truffle_brownie_1792084905782.jpg';
import cafeAmbianceImg from '../assets/images/cafe_interior_ambiance_1792082482147.jpg';

// Newly generated coffee category types
import cortadoGlassImg from '../assets/images/coffee_cortado_glass_1792085840846.jpg';
import flatWhiteRosettaImg from '../assets/images/coffee_flat_white_rosetta_1792085842264.jpg';
import cappuccinoCinnamonImg from '../assets/images/coffee_cappuccino_cinnamon_1792085842780.jpg';
import viennaCreamImg from '../assets/images/coffee_vienna_cream_1792085842407.jpg';

export { 
  cafeAmbianceImg,
  cortadoGlassImg,
  flatWhiteRosettaImg,
  cappuccinoCinnamonImg,
  viennaCreamImg
};

export interface StudioImageMetadata {
  src: string;
  alt: string;
  cameraAngle: string;
  lightingSetup: string;
  glassware: string;
  aspectRatio: '4:3' | '16:9' | '1:1';
  dominantHex: string;
  accentHex: string;
  aestheticPromptFormula: string;
}

export interface FetchImageOptions {
  lightingMode?: 'warm-amber' | 'cool-focus' | 'golden-hour' | 'midnight-noir';
  preferredAngle?: 'hero-angle' | 'macro-crema' | 'highball-side';
}

const STUDIO_COFFEE_IMAGE_REGISTRY: Record<string, StudioImageMetadata> = {
  'daily-ritual': {
    src: espressoRitualImg,
    alt: 'The Daily Ritual benchmark double espresso with golden hazelnut tiger-striped crema in matte ceramic cup',
    cameraAngle: '45° Elevated Macro',
    lightingSetup: 'Warm 3200K Key Light · Deep Slate Shadow · Directional Strobe',
    glassware: 'Matte Charcoal Earthenware Demitasse',
    aspectRatio: '4:3',
    dominantHex: '#3E2723',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Studio product photography of double espresso in handcrafted matte ceramic, thick tiger-striped crema, dark slate background, 8k commercial quality.',
  },
  'cortado': {
    src: cortadoGlassImg,
    alt: 'Artisanal Cortado in faceted glass tumbler with equal parts espresso and warm silky milk',
    cameraAngle: '45° Elevated Studio Angle',
    lightingSetup: 'Soft Natural Morning Light · Rustic Oak Surface · Draped Linen',
    glassware: 'Clear Faceted Gibraltar Glass Tumbler',
    aspectRatio: '4:3',
    dominantHex: '#52341C',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Studio photography of Cortado coffee in clear faceted glass, equal parts espresso and steamed milk with tulip latte art, 8k resolution.',
  },
  'flat-white': {
    src: flatWhiteRosettaImg,
    alt: 'Velvet Flat White with intricate multi-leaf rosetta latte art on glossy microfoam in ceramic cup',
    cameraAngle: 'Overhead 90° Flatlay',
    lightingSetup: 'Diffused Softbox · Textured Linen Fabric · Warm Timber Table',
    glassware: 'Classic White Ceramic Cup with Saucer & Silver Spoon',
    aspectRatio: '4:3',
    dominantHex: '#6D4C33',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Studio overhead photography of Flat White in white ceramic cup with saucer, intricate multi-leaf rosetta latte art, 8k resolution.',
  },
  'cappuccino-cinnamon': {
    src: cappuccinoCinnamonImg,
    alt: 'Italian Cappuccino with a thick pillowy foam mountain dusted with cinnamon and cocoa in a dark ring',
    cameraAngle: 'Side Elevated 35° Perspective',
    lightingSetup: 'Warm Directional Sunlight · Ambient Espresso Bar Background',
    glassware: 'Traditional Italian Wide Porcelain Cup with Saucer',
    aspectRatio: '4:3',
    dominantHex: '#4A2C18',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Studio photography of authentic Italian Cappuccino with thick airy foam mountain dusted with cinnamon and cocoa ring, 8k resolution.',
  },
  'vienna-coffee': {
    src: viennaCreamImg,
    alt: 'Classic Vienna Coffee Einspänner with dark double espresso topped with tall cold whipped cream swirl and cocoa',
    cameraAngle: 'Profile Highball Hero',
    lightingSetup: 'Warm Golden Ambient Interior · Window Light · Antique Café Wood',
    glassware: 'Traditional Austrian Handled Glass Mug with Glass Saucer',
    aspectRatio: '4:3',
    dominantHex: '#2E1911',
    accentHex: '#FBBF24',
    aestheticPromptFormula: 'Studio photography of classic Vienna Coffee Einspanner in glass cup, double espresso topped with swirl of whipped cream dusted with cocoa, 8k resolution.',
  },
  'clear-cut': {
    src: icedAmericanoImg,
    alt: 'The Clear Cut iced Americano in faceted crystal tumbler with hand-cut diamond ice cubes and light refraction',
    cameraAngle: 'Eye-Level Refraction Hero',
    lightingSetup: 'Backlit Rim Strobe · Crisp Condensation Reflection · Midnight Navy Surface',
    glassware: 'Faceted Diamond Crystal Tumbler',
    aspectRatio: '4:3',
    dominantHex: '#1E293B',
    accentHex: '#60A5FA',
    aestheticPromptFormula: 'Luxury beverage photography of iced Americano in faceted crystal glassware, diamond ice cubes, dark amber espresso layers, 8k resolution.',
  },
  'soft-landing': {
    src: softLandingImg,
    alt: 'The Soft Landing vanilla latte in rustic matte ceramic cup with delicate microfoam latte art',
    cameraAngle: '45° Warm Studio Hero',
    lightingSetup: 'Soft Diffused Morning Light · Warm Amber Glow · Textured Slate Table',
    glassware: 'Wide-Mouth Handcrafted Stoneware Cup',
    aspectRatio: '4:3',
    dominantHex: '#2A1E17',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Studio product photography of vanilla latte in handcrafted matte ceramic cup, velvety steamed microfoam art, soft morning amber lighting, 8k resolution.',
  },
  'golden-hour': {
    src: goldenHourImg,
    alt: 'Golden Hour iced caramel latte in tall fluted ribbed glass with caramel drip and warm backlighting',
    cameraAngle: 'Frontal Highball Showcase',
    lightingSetup: 'Warm Golden Hour Backlighting · Soft Rim Illumination · Polished Wood Bar',
    glassware: 'Fluted Ribbed Highball Glass',
    aspectRatio: '4:3',
    dominantHex: '#451A03',
    accentHex: '#F59E0B',
    aestheticPromptFormula: 'Luxury beverage photography of iced caramel latte in tall ribbed glass, caramel drip, ice cubes, warm golden hour backlighting, 8k resolution.',
  },
  'cocoa-cloud': {
    src: cocoaCloudImg,
    alt: 'Cocoa Cloud chocolate coffee mocha in ceramic mug with whipped microfoam and Valrhona chocolate shavings',
    cameraAngle: 'Warm Café Close-Up',
    lightingSetup: 'Warm Ambient Interior · Soft 45° Key Light · Rustic Wood Counter',
    glassware: 'Speckled Earthenware Ceramic Mug with Brass Spoon',
    aspectRatio: '4:3',
    dominantHex: '#3B1E12',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Artisanal studio photography of chocolate coffee mocha in warm earthen ceramic mug, oat microfoam, dark cocoa, chocolate curls, 8k resolution.',
  },
  'mint-condition': {
    src: mintColdBrewImg,
    alt: 'Mint Condition spearmint nitro cold brew with cascading coconut cream foam and garden mint sprig',
    cameraAngle: 'Vertical Cascade Profile',
    lightingSetup: 'Side Accent Strobe · Chilled Condensation Glow · Dark Oak Tasting Counter',
    glassware: 'Sleek Straight Highball Glass',
    aspectRatio: '4:3',
    dominantHex: '#064E3B',
    accentHex: '#10B981',
    aestheticPromptFormula: 'Craft beverage photography of spearmint nitro cold brew in sleek highball glass, cascading coconut cold foam layer, fresh spearmint, 8k resolution.',
  },
  'velvet-orbit': {
    src: velvetOrbitImg,
    alt: 'Velvet Orbit signature dark mocha with glossy chocolate swirl and dark plum moody atmosphere',
    cameraAngle: '35° Dramatic Studio Angle',
    lightingSetup: 'Dramatic Chiaroscuro · Deep Plum & Navy Gradient · Antique Wood Surface',
    glassware: 'Dark Matte Saucer & Artisan Ceramic Mug',
    aspectRatio: '4:3',
    dominantHex: '#302238',
    accentHex: '#A855F7',
    aestheticPromptFormula: 'Dramatic studio product photography of dark mocha, glossy chocolate swirl, cocoa dusting on silky crema, 8k resolution.',
  },
  'wild-card': {
    src: wildCardImg,
    alt: 'The Wild Card lavender cold brew with thick salted pistachio cream foam and dried lavender buds',
    cameraAngle: 'Frontal Mixology Showcase',
    lightingSetup: 'Warm Accent Lamp · Soft Rim Light · Bar Accessories Background',
    glassware: 'Ribbed Rocks Glass with Laser-Etched Branding',
    aspectRatio: '4:3',
    dominantHex: '#4C1D95',
    accentHex: '#A855F7',
    aestheticPromptFormula: 'Artisanal beverage photography of lavender cold brew in modern glassware, salted pistachio cream foam, dried lavender buds, 8k resolution.',
  },
  'citrus-state': {
    src: citrusStateImg,
    alt: 'Citrus State sparkling botanical cooler with blood orange slice, rosemary sprig, and crystal ice',
    cameraAngle: 'Level Cocktail Hero',
    lightingSetup: 'Botanical Side Light · Sparkling Carbonation Highlights · Wet Slate Coaster',
    glassware: 'Minimalist Heavy-Base Tumbler',
    aspectRatio: '4:3',
    dominantHex: '#7C2D12',
    accentHex: '#FB923C',
    aestheticPromptFormula: 'Artisanal beverage photography of sparkling cooler with blood orange slice, fresh sprig, minimalist glassware, 8k resolution.',
  },
  'afterglow': {
    src: afterglowImg,
    alt: 'Afterglow layered botanical mocktail with ruby hibiscus and violet butterfly pea tea in coupe glass',
    cameraAngle: 'Elegant Stemmed Coupe Elevation',
    lightingSetup: 'Soft Bokeh Strobe · Prismatic Ice Illumination · Dark Granite Bar',
    glassware: 'Stemmed Crystal Coupe Glass',
    aspectRatio: '4:3',
    dominantHex: '#581C87',
    accentHex: '#C084FC',
    aestheticPromptFormula: 'Spectacular layered beverage photography of mocktail in coupe glass, ruby hibiscus transitioning to violet bloom, crystal ice, 8k resolution.',
  },
  'kyoto-cloud-matcha': {
    src: kyotoMatchaImg,
    alt: 'Kyoto Cloud ceremonial matcha latte with jade green whisked froth and sea salt sweet cream',
    cameraAngle: '45° Japanese Tea Ceremony Modern',
    lightingSetup: 'Clean Studio Diffused Daylight · Natural Wood Coaster · Whisk Accents',
    glassware: 'Ribbed Fluted Japanese Glass',
    aspectRatio: '4:3',
    dominantHex: '#14532D',
    accentHex: '#86EFAC',
    aestheticPromptFormula: 'Exquisite product photography of ceremonial matcha latte in modern ribbed glass, whisked matcha over oat milk, sweet cream top, 8k resolution.',
  },
  'cardamom-brioche': {
    src: cardamomBriocheImg,
    alt: 'Cardamom Brioche Bun Swedish knot with pearl sugar on dark slate plate with morning light',
    cameraAngle: 'Top 35° Bakery Editorial',
    lightingSetup: 'Soft Morning Window Light · Natural Slate Table · Linen Cloth',
    glassware: 'Handcrafted Ceramic Pastry Plate',
    aspectRatio: '4:3',
    dominantHex: '#78350F',
    accentHex: '#FBBF24',
    aestheticPromptFormula: 'Studio food photography of freshly baked cardamom brioche bun on handcrafted ceramic plate, pearl sugar, 8k resolution.',
  },
  'truffle-brownie': {
    src: truffleBrownieImg,
    alt: 'Decadent 70% Guanaja chocolate truffle brownie with gooey fudgy center and flaky sea salt crystals',
    cameraAngle: 'Close-Up Food Macro',
    lightingSetup: 'Directional Low Strobe · Warm Timber Board · Molten Chocolate Highlight',
    glassware: 'Rustic Dark Walnut Cutting Block',
    aspectRatio: '4:3',
    dominantHex: '#27100B',
    accentHex: '#E6A85C',
    aestheticPromptFormula: 'Luxury gourmet food photography of decadent chocolate truffle brownie with flaky sea salt crystals, dark walnut wood surface, 8k resolution.',
  },
};

export function fetchCoffeeProductImage(
  productOrId: Product | string,
  options?: FetchImageOptions
): StudioImageMetadata {
  const productId = typeof productOrId === 'string' ? productOrId : productOrId.id;
  const productName = typeof productOrId === 'string' ? productOrId : productOrId.name;
  const productCategory = typeof productOrId === 'string' ? 'Specialty Beverage' : productOrId.category;

  const registeredImage = STUDIO_COFFEE_IMAGE_REGISTRY[productId];
  if (registeredImage) {
    return registeredImage;
  }

  const isIced = typeof productOrId !== 'string' && productOrId.defaultTemp === 'iced';
  const isMocha = typeof productOrId !== 'string' && productOrId.flavorTags.includes('chocolatey');
  const isMatcha = typeof productOrId !== 'string' && productOrId.category === 'Tea and Matcha';

  let fallbackSrc = softLandingImg;
  let glassware = 'Handcrafted Ceramic Mug';
  let cameraAngle = '45° Studio Hero';
  let dominantHex = '#2A1E17';
  let accentHex = '#E6A85C';

  if (isIced) {
    fallbackSrc = icedAmericanoImg;
    glassware = 'Faceted Crystal Tumbler with Clear Ice';
    dominantHex = '#1E293B';
    accentHex = '#60A5FA';
  } else if (isMocha) {
    fallbackSrc = cocoaCloudImg;
    glassware = 'Earthenware Mug with Chocolate Dusting';
    dominantHex = '#3B1E12';
    accentHex = '#E6A85C';
  } else if (isMatcha) {
    fallbackSrc = kyotoMatchaImg;
    glassware = 'Ribbed Contemporary Japanese Glass';
    dominantHex = '#14532D';
    accentHex = '#86EFAC';
  }

  return {
    src: fallbackSrc,
    alt: `${productName} — Studio photographed specialty coffee (${productCategory})`,
    cameraAngle,
    lightingSetup: 'Warm 3200K Directional Strobe · Dark Slate Surface · Studio Rim Highlight',
    glassware,
    aspectRatio: '4:3',
    dominantHex,
    accentHex,
    aestheticPromptFormula: `Studio product photography of ${productName} in ${glassware}, soft morning amber lighting, minimalist luxury café aesthetic, dark slate surface, 8k resolution.`,
  };
}

export function getAllStudioCoffeeProducts(): { id: string; meta: StudioImageMetadata }[] {
  return Object.entries(STUDIO_COFFEE_IMAGE_REGISTRY).map(([id, meta]) => ({
    id,
    meta,
  }));
}
