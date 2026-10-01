export const SCRIPT_SAMPLE = { ta: 'துல்லியமான', hi: 'शुद्ध' } as const;

export const TA_FONTS = [
  { id: 'noto-sans-ta', label: 'Noto Sans Tamil', family: "'Noto Sans Tamil', sans-serif" },
  { id: 'noto-serif-ta', label: 'Noto Serif Tamil', family: "'Noto Serif Tamil', serif" },
  { id: 'catamaran', label: 'Catamaran', family: "'Catamaran', sans-serif" },
  { id: 'hind-madurai', label: 'Hind Madurai', family: "'Hind Madurai', sans-serif" },
  { id: 'mukta-malar', label: 'Mukta Malar', family: "'Mukta Malar', sans-serif" },
  { id: 'pavanam', label: 'Pavanam', family: "'Pavanam', sans-serif" },
  { id: 'meera-inimai', label: 'Meera Inimai', family: "'Meera Inimai', sans-serif" },
  { id: 'kavivanar', label: 'Kavivanar', family: "'Kavivanar', cursive" },
  { id: 'tiro-ta', label: 'Tiro Tamil', family: "'Tiro Tamil', serif" },
  { id: 'anek-ta', label: 'Anek Tamil', family: "'Anek Tamil', sans-serif" },
] as const;

export const HI_FONTS = [
  { id: 'noto-sans-hi', label: 'Noto Sans Devanagari', family: "'Noto Sans Devanagari', sans-serif" },
  { id: 'noto-serif-hi', label: 'Noto Serif Devanagari', family: "'Noto Serif Devanagari', serif" },
  { id: 'mukta', label: 'Mukta', family: "'Mukta', sans-serif" },
  { id: 'hind', label: 'Hind', family: "'Hind', sans-serif" },
  { id: 'tiro-hi', label: 'Tiro Devanagari Hindi', family: "'Tiro Devanagari Hindi', serif" },
  { id: 'kalam', label: 'Kalam', family: "'Kalam', cursive" },
  { id: 'martel', label: 'Martel', family: "'Martel', serif" },
  { id: 'rajdhani', label: 'Rajdhani', family: "'Rajdhani', sans-serif" },
  { id: 'yatra', label: 'Yatra One', family: "'Yatra One', cursive" },
  { id: 'anek-hi', label: 'Anek Devanagari', family: "'Anek Devanagari', sans-serif" },
] as const;

export type TaFont = (typeof TA_FONTS)[number]['id'];
export type HiFont = (typeof HI_FONTS)[number]['id'];

const TA_IDS = new Set(TA_FONTS.map((f) => f.id));
const HI_IDS = new Set(HI_FONTS.map((f) => f.id));

const FROM_STYLE: Record<string, { ta: TaFont; hi: HiFont }> = {
  modern: { ta: 'catamaran', hi: 'mukta' },
  rounded: { ta: 'kavivanar', hi: 'yatra' },
  classic: { ta: 'noto-sans-ta', hi: 'noto-sans-hi' },
  soft: { ta: 'anek-ta', hi: 'anek-hi' },
};

export function asTaFont(value: unknown, legacy?: unknown): TaFont {
  if (typeof value === 'string' && TA_IDS.has(value as TaFont)) return value as TaFont;
  if (typeof legacy === 'string' && FROM_STYLE[legacy]) return FROM_STYLE[legacy].ta;
  return 'noto-sans-ta';
}

export function asHiFont(value: unknown, legacy?: unknown): HiFont {
  if (typeof value === 'string' && HI_IDS.has(value as HiFont)) return value as HiFont;
  if (typeof legacy === 'string' && FROM_STYLE[legacy]) return FROM_STYLE[legacy].hi;
  return 'noto-sans-hi';
}
