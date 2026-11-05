/**
 * Blisk data carried over from the Twig theme: the store verticals
 * (src/assets/js/obsidian/verticals.js) and the background palettes
 * (src/assets/styles/obsidian/_v12.scss).
 */
export const VERTICAL_IDS = ["beauty", "skincare", "makeup", "perfume", "haircare", "bodycare", "gifts", "devices", "nails", "kbeauty", "mens"] as const;
export type VerticalId = (typeof VERTICAL_IDS)[number];

export interface Vertical {
  ar: string;
  en: string;
  /** Metallic accent for this vertical (used when the accent is «champagne»). */
  acc: string;
  /** Words that point to this vertical in the store's name and description. */
  kw: string[];
  /** Arabic hero line. */
  hero: string;
}

export const VERTICALS: Record<VerticalId, Vertical> = {
  "beauty": {
    "ar": "التجميل والعناية",
    "en": "Beauty & care",
    "acc": "#d9b779",
    "kw": [
      "تجميل",
      "مستحضرات",
      "كوزمتك",
      "cosmetic",
      "cosmetics",
      "بيوتي"
    ],
    "hero": "جمالك، بذكاء فاخر"
  },
  "skincare": {
    "ar": "العناية بالبشرة",
    "en": "Skincare",
    "acc": "#e8c9b5",
    "kw": [
      "سيروم",
      "serum",
      "كريم",
      "cream",
      "مرطب",
      "moisturizer",
      "غسول",
      "منظف",
      "cleanser",
      "تونر",
      "toner",
      "واقي",
      "sunscreen",
      "spf",
      "ريتينول",
      "retinol",
      "نياسيناميد",
      "niacinamide",
      "هيالورونيك",
      "hyaluronic",
      "ماسك",
      "mask",
      "بشره",
      "skincare"
    ],
    "hero": "بشرة تلمع من الداخل"
  },
  "makeup": {
    "ar": "المكياج",
    "en": "Makeup",
    "acc": "#d99aa0",
    "kw": [
      "مكياج",
      "makeup",
      "فاونديشن",
      "foundation",
      "كونسيلر",
      "concealer",
      "احمر شفاه",
      "روج",
      "lipstick",
      "ماسكارا",
      "mascara",
      "ظلال",
      "eyeshadow",
      "بلاشر",
      "blush",
      "هايلايتر",
      "highlighter",
      "برايمر",
      "primer",
      "بودره",
      "powder",
      "ايلاينر",
      "eyeliner",
      "فرشاه",
      "فرش"
    ],
    "hero": "إطلالة تخطف الأنظار"
  },
  "perfume": {
    "ar": "العطور",
    "en": "Perfumes",
    "acc": "#c9a26b",
    "kw": [
      "عطر",
      "عطور",
      "perfume",
      "fragrance",
      "parfum",
      "عود",
      "oud",
      "بخور",
      "مسك",
      "musk",
      "دهن",
      "معطر",
      "بخاخ",
      "mist",
      "او دي بارفان",
      "edp",
      "edt"
    ],
    "hero": "أثرٌ يبقى بعد رحيلك"
  },
  "haircare": {
    "ar": "العناية بالشعر",
    "en": "Haircare",
    "acc": "#c7b08a",
    "kw": [
      "شعر",
      "hair",
      "شامبو",
      "shampoo",
      "بلسم",
      "conditioner",
      "زيت شعر",
      "hair oil",
      "ماسك شعر",
      "سيروم شعر",
      "صبغه",
      "صبغة",
      "كيراتين",
      "keratin",
      "بروتين",
      "فروه"
    ],
    "hero": "شعر صحي يلمع بالحياة"
  },
  "bodycare": {
    "ar": "العناية بالجسم",
    "en": "Body care",
    "acc": "#e0b8a0",
    "kw": [
      "جسم",
      "body",
      "لوشن",
      "lotion",
      "زبده",
      "butter",
      "مقشر",
      "scrub",
      "شاور",
      "شاور جل",
      "shower",
      "مزيل عرق",
      "deodorant",
      "زيت جسم",
      "body oil",
      "صابون",
      "soap"
    ],
    "hero": "نعومة تلمسينها كل يوم"
  },
  "gifts": {
    "ar": "هدايا ومجموعات",
    "en": "Gifts & sets",
    "acc": "#d9b779",
    "kw": [
      "هديه",
      "هدايا",
      "gift",
      "مجموعه",
      "مجموعات",
      "set",
      "بوكس",
      "box",
      "بكج",
      "باكج",
      "طقم"
    ],
    "hero": "هدية تُبهر من أول نظرة"
  },
  "devices": {
    "ar": "أجهزة التجميل",
    "en": "Beauty devices",
    "acc": "#b9c3d1",
    "kw": [
      "جهاز",
      "اجهزه",
      "device",
      "سشوار",
      "مجفف",
      "dryer",
      "مكواه شعر",
      "straightener",
      "مكواة",
      "فير",
      "curler",
      "ليزر",
      "laser",
      "ازاله الشعر",
      "منظف بشره",
      "ديرما",
      "derma",
      "led",
      "ماساج",
      "massager"
    ],
    "hero": "تقنية الصالون في بيتك"
  },
  "nails": {
    "ar": "الأظافر",
    "en": "Nails",
    "acc": "#e3a1b0",
    "kw": [
      "اظافر",
      "مناكير",
      "nail",
      "nails",
      "طلاء",
      "polish",
      "جل",
      "gel",
      "اكريليك",
      "acrylic",
      "مزيل طلاء",
      "remover",
      "مبرد"
    ],
    "hero": "أظافر تحكي أناقتك"
  },
  "kbeauty": {
    "ar": "الجمال الكوري",
    "en": "K-beauty",
    "acc": "#f0c8cf",
    "kw": [
      "كوري",
      "كوريه",
      "korean",
      "k-beauty",
      "kbeauty",
      "كوسركس",
      "cosrx",
      "لانيج",
      "laneige",
      "انيسفري",
      "innisfree",
      "بيوتي اوف جوسون",
      "sheet mask",
      "حلزون",
      "snail",
      "سنتيلا",
      "centella"
    ],
    "hero": "سر البشرة الزجاجية"
  },
  "mens": {
    "ar": "العناية الرجالية",
    "en": "Men's grooming",
    "acc": "#b8a78a",
    "kw": [
      "رجالي",
      "رجال",
      "men",
      "for men",
      "لحيه",
      "beard",
      "حلاقه",
      "shave",
      "شيفر",
      "shaver",
      "افترشيف",
      "aftershave",
      "كولونيا",
      "cologne"
    ],
    "hero": "حضور رجولي بلمسة فاخرة"
  }
};

/** Background palettes: [page, surface, glow]. */
export const BACKGROUNDS: Record<string, [string, string, string]> = {
  "graphite": [
    "#0b0b0d",
    "#141417",
    "#25211a"
  ],
  "midnight": [
    "#070a14",
    "#0f1424",
    "#1a2240"
  ],
  "onyx": [
    "#000000",
    "#0c0c0c",
    "#1c1c1c"
  ],
  "titanium": [
    "#16181b",
    "#202328",
    "#3a3e45"
  ],
  "espresso": [
    "#120b07",
    "#1c130d",
    "#3a2617"
  ],
  "navy": [
    "#06101f",
    "#0d1a30",
    "#16325a"
  ],
  "emerald": [
    "#04110c",
    "#0a1d16",
    "#123b2c"
  ],
  "plum": [
    "#12081a",
    "#1d1028",
    "#3a1d4f"
  ],
  "wine": [
    "#16070b",
    "#240d13",
    "#4a1726"
  ],
  "ocean": [
    "#03141a",
    "#082430",
    "#0e4456"
  ],
  "ivory": [
    "#fbf8f1",
    "#ffffff",
    "#efe3c8"
  ],
  "sand": [
    "#f4ede1",
    "#fbf7ef",
    "#e3cfa8"
  ],
  "pearl": [
    "#f5f5f3",
    "#ffffff",
    "#e2e2de"
  ],
  "softblue": [
    "#eef3f9",
    "#ffffff",
    "#cfdcee"
  ],
  "mint": [
    "#eef6f1",
    "#ffffff",
    "#cfe6d8"
  ],
  "blush": [
    "#faf0ee",
    "#ffffff",
    "#efd2cb"
  ],
  "lavender": [
    "#f3f0f9",
    "#ffffff",
    "#ddd3ee"
  ],
  "cloud": [
    "#f2f4f6",
    "#ffffff",
    "#d9dee4"
  ]
};

export const LIGHT_BACKGROUNDS = ["ivory", "sand", "pearl", "softblue", "mint", "blush", "lavender", "cloud"];

export const ACCENTS: Record<string, string> = {
  titanium: '#c9ccd1',
  rose: '#e0a98f',
  ice: '#e8b4b8',
};
