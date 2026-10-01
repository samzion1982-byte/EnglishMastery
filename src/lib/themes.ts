export const THEME_KEY = 'em-theme';

export const THEMES = [
  { id: 'forest', mode: 'dark', label: 'Forest', note: 'Teal night' },
  { id: 'midnight', mode: 'dark', label: 'Midnight', note: 'Deep blue' },
  { id: 'plum', mode: 'dark', label: 'Plum', note: 'Purple dusk' },
  { id: 'ember', mode: 'dark', label: 'Ember', note: 'Warm charcoal' },
  { id: 'lagoon', mode: 'dark', label: 'Lagoon', note: 'Deep sea' },
  { id: 'dune', mode: 'dark', label: 'Dune', note: 'Dark bronze' },
  { id: 'cobalt', mode: 'dark', label: 'Cobalt', note: 'Ink blue' },
  { id: 'wine', mode: 'dark', label: 'Wine', note: 'Dark rose' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];

const IDS = new Set<string>(THEMES.map((t) => t.id));

const LEGACY: Record<string, ThemeId> = {
  light: 'forest',
  dark: 'forest',
  mist: 'lagoon',
  paper: 'dune',
  sky: 'cobalt',
  blossom: 'wine',
};

export function asTheme(value: unknown): ThemeId {
  if (typeof value === 'string' && LEGACY[value]) return LEGACY[value];
  return IDS.has(value as string) ? (value as ThemeId) : 'forest';
}

export function themeOf(id: ThemeId) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function applyTheme(id: ThemeId) {
  const theme = themeOf(id);
  document.documentElement.dataset.theme = theme.id;
  document.documentElement.dataset.themeMode = 'dark';
  try {
    localStorage.setItem(THEME_KEY, theme.id);
    window.dispatchEvent(new CustomEvent('em-theme-change'));
  } catch {}
}

export function readTheme(): ThemeId {
  try {
    return asTheme(localStorage.getItem(THEME_KEY) ?? localStorage.getItem('em-admin-theme') ?? document.documentElement.dataset.theme);
  } catch {
    return 'forest';
  }
}
