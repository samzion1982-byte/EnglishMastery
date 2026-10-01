import type { Language } from './learner';

export const MOTHER_TONGUES: { value: Language; label: string }[] = [
  { value: 'en', label: 'English only' },
  { value: 'ta', label: 'தமிழ் · Tamil' },
  { value: 'hi', label: 'हिन्दी · Hindi' },
  { value: 'ml', label: 'മലയാളം · Malayalam' },
  { value: 'te', label: 'తెలుగు · Telugu' },
  { value: 'kn', label: 'ಕನ್ನಡ · Kannada' },
  { value: 'fr', label: 'Français · French' },
];

export const MOTHER_TONGUE_CODES = MOTHER_TONGUES.map((language) => language.value);
