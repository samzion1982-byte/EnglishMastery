export const PATTERN_KEY = 'em-pattern';

export const PATTERNS = [
  { id: 'dots', label: 'Dots' },
  { id: 'waves', label: 'Waves' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'weave', label: 'Weave' },
] as const;

export type PatternId = (typeof PATTERNS)[number]['id'];

export function asPattern(value: unknown): PatternId {
  return PATTERNS.some((item) => item.id === value) ? (value as PatternId) : 'dots';
}

export function applyPattern(id: PatternId) {
  document.documentElement.dataset.pattern = id;
  try {
    localStorage.setItem(PATTERN_KEY, id);
  } catch {}
  window.dispatchEvent(new Event('em-pattern-change'));
}

export function readPattern(): PatternId {
  try {
    return asPattern(localStorage.getItem(PATTERN_KEY) ?? document.documentElement.dataset.pattern);
  } catch {
    return 'dots';
  }
}
