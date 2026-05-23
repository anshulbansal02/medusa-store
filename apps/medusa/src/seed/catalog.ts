type ProductCategoryName = "Dresses" | "Co-ords" | "Tops" | "Occasion Edit";

type ProductDefinition = {
  title: string;
  category: ProductCategoryName;
  description: string;
  handle: string;
  sku: string;
  color: string;
  price: number;
  weight: number;
  images: string[];
  details: {
    fabric: string;
    fit: string;
    care: string;
    model: string;
  };
};

export const seedProductSizeOptions = ["XS", "S", "M", "L", "XL"];

export const standardDressSizeChart = {
  unit: "in",
  note: "Garment measurements. Compare with a similar piece that fits you well.",
  columns: [
    { key: "bust", label: "Bust" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
  ],
  rows: [
    { size: "XS", values: { bust: "32", waist: "26", hip: "34" } },
    { size: "S", values: { bust: "34", waist: "28", hip: "36" } },
    { size: "M", values: { bust: "36", waist: "30", hip: "38" } },
    { size: "L", values: { bust: "38", waist: "32", hip: "40" } },
    { size: "XL", values: { bust: "40", waist: "34", hip: "42" } },
  ],
};

export const seedCatalog: ProductDefinition[] = [
  {
    title: "Noor Draped Midi Dress",
    category: "Dresses",
    description:
      "Draped midi dress in deep wine with a clean neckline and soft movement.",
    handle: "noor-draped-midi-dress",
    sku: "NOOR-WINE",
    color: "Wine",
    price: 6800,
    weight: 400,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Mid-weight draped crepe with a soft matte finish.",
      fit: "Skims the body through the waist with easy movement through the skirt.",
      care: "Dry clean recommended. Steam lightly from the reverse side.",
      model: "Model is 5'8\" and wears size S.",
    },
  },
  {
    title: "Ira Structured Co-ord",
    category: "Co-ords",
    description:
      "Structured ivory co-ord with a tailored top and easy evening fit.",
    handle: "ira-structured-coord",
    sku: "IRA-IVORY",
    color: "Ivory",
    price: 7200,
    weight: 500,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Structured woven blend with a smooth lining in the top.",
      fit: "Tailored through the shoulder and relaxed through the trouser.",
      care: "Dry clean only to preserve the set shape.",
      model: "Model is 5'7\" and wears size S.",
    },
  },
  {
    title: "Mira Satin Evening Top",
    category: "Tops",
    description:
      "Satin evening top in sage with a sharper shoulder and fluid drape.",
    handle: "mira-satin-evening-top",
    sku: "MIRA-SAGE",
    color: "Sage",
    price: 5400,
    weight: 250,
    images: [
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Fluid satin with a soft sheen and clean fall.",
      fit: "Sharp shoulder line with a relaxed body for easy tucking.",
      care: "Dry clean recommended. Avoid high-heat ironing on the face.",
      model: "Model is 5'8\" and wears size S.",
    },
  },
  {
    title: "Zoya Cutwork Dress",
    category: "Occasion Edit",
    description:
      "Cutwork occasion dress in black with a fitted waist and photo-ready shape.",
    handle: "zoya-cutwork-dress",
    sku: "ZOYA-BLACK",
    color: "Black",
    price: 8100,
    weight: 420,
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Cutwork textured fabric with a smooth inner lining.",
      fit: "Defined at the waist with a clean, occasion-ready shape.",
      care: "Dry clean only. Store flat or on a padded hanger.",
      model: "Model is 5'7\" and wears size S.",
    },
  },
  {
    title: "Ava Column Midi Dress",
    category: "Dresses",
    description:
      "Minimal column midi in cocoa satin with a narrow strap and evening polish.",
    handle: "ava-column-midi-dress",
    sku: "AVA-COCOA",
    color: "Cocoa",
    price: 7600,
    weight: 360,
    images: [
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Satin-backed crepe with a fluid fall and soft sheen.",
      fit: "Straight through the body with light shaping at the waist.",
      care: "Dry clean recommended. Hang after steaming.",
      model: "Model is 5'8\" and wears size S.",
    },
  },
  {
    title: "Rhea One-Shoulder Dress",
    category: "Occasion Edit",
    description:
      "One-shoulder evening dress in emerald with gathered detail at the waist.",
    handle: "rhea-one-shoulder-dress",
    sku: "RHEA-EMERALD",
    color: "Emerald",
    price: 8900,
    weight: 430,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Draped jersey-crepe with a smooth inner finish.",
      fit: "Close through the bodice with soft ease through the hem.",
      care: "Dry clean only. Store away from direct light.",
      model: "Model is 5'9\" and wears size S.",
    },
  },
  {
    title: "Leela Tailored Waistcoat Set",
    category: "Co-ords",
    description:
      "Tailored waistcoat and trouser set in sand with clean front shaping.",
    handle: "leela-tailored-waistcoat-set",
    sku: "LEELA-SAND",
    color: "Sand",
    price: 8400,
    weight: 620,
    images: [
      "https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Tailoring-weight woven suiting with a smooth lining.",
      fit: "Defined through the waistcoat with a relaxed straight trouser.",
      care: "Dry clean only. Keep the set hung together.",
      model: "Model is 5'7\" and wears size S.",
    },
  },
  {
    title: "Sana Wrap Blouse",
    category: "Tops",
    description:
      "Wrap blouse in pearl with a soft tie waist and an easy dressed-up finish.",
    handle: "sana-wrap-blouse",
    sku: "SANA-PEARL",
    color: "Pearl",
    price: 4800,
    weight: 240,
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Soft crepe with a matte texture and light drape.",
      fit: "Adjustable wrap waist with relaxed sleeves.",
      care: "Dry clean recommended. Tie loosely before storing.",
      model: "Model is 5'6\" and wears size S.",
    },
  },
  {
    title: "Tara Corset Midi Dress",
    category: "Dresses",
    description:
      "Corset-inspired midi in blush with panelled shaping and a clean slit.",
    handle: "tara-corset-midi-dress",
    sku: "TARA-BLUSH",
    color: "Blush",
    price: 9200,
    weight: 460,
    images: [
      "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Structured crepe with smooth lining through the bodice.",
      fit: "Fitted through the bodice with a straight midi skirt.",
      care: "Dry clean only. Do not fold the bodice panels sharply.",
      model: "Model is 5'8\" and wears size S.",
    },
  },
  {
    title: "Nila Halter Maxi Dress",
    category: "Occasion Edit",
    description:
      "Halter maxi dress in midnight blue with an open neckline and soft flare.",
    handle: "nila-halter-maxi-dress",
    sku: "NILA-MIDNIGHT",
    color: "Midnight",
    price: 9600,
    weight: 520,
    images: [
      "https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Fluid georgette layered over a soft lining.",
      fit: "Fitted at the neck and waist with movement through the skirt.",
      care: "Dry clean recommended. Steam on low from the reverse side.",
      model: "Model is 5'9\" and wears size S.",
    },
  },
  {
    title: "Meher Satin Shirt Set",
    category: "Co-ords",
    description:
      "Satin shirt and trouser set in champagne with a relaxed evening drape.",
    handle: "meher-satin-shirt-set",
    sku: "MEHER-CHAMPAGNE",
    color: "Champagne",
    price: 7800,
    weight: 560,
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Smooth satin blend with a soft hand feel.",
      fit: "Relaxed shirt with easy straight-leg trousers.",
      care: "Dry clean recommended. Store on a hanger to avoid creasing.",
      model: "Model is 5'8\" and wears size S.",
    },
  },
  {
    title: "Kiara Sculpted Bustier Top",
    category: "Tops",
    description:
      "Sculpted bustier top in black with clean seams and a cropped length.",
    handle: "kiara-sculpted-bustier-top",
    sku: "KIARA-BLACK",
    color: "Black",
    price: 5200,
    weight: 260,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=82",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1200&q=82",
    ],
    details: {
      fabric: "Structured stretch crepe with a smooth lining.",
      fit: "Close fit through the bust with light support.",
      care: "Dry clean only. Store flat or on a padded hanger.",
      model: "Model is 5'7\" and wears size S.",
    },
  },
];
