'use client';

import { useEffect, useState } from 'react';
import { Icon } from './icon';
import { applyTheme, readTheme, THEMES, themeOf, type ThemeId } from '@/lib/themes';

export const THEME_KEY = 'em-theme';

export function ThemeToggle({ className = 'side-link' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeId>('forest');

  useEffect(() => {
    const initial = readTheme();
    applyTheme(initial);
    setTheme(initial);
    const changed = () => setTheme(readTheme());
    window.addEventListener("em-theme-change", changed);
    return () => window.removeEventListener("em-theme-change", changed);
  }, []);

  function toggle() {
    const current = readTheme();
    const index = THEMES.findIndex((item) => item.id === current);
    const next: ThemeId = THEMES[(index + 1) % THEMES.length]?.id ?? 'forest';
    applyTheme(next);
    setTheme(next);
  }

  return (
    <button type="button" className={className} onClick={toggle} aria-label={`Theme: ${themeOf(theme).label}. Choose the next dark theme`}>
      <Icon kind="moon" />
      {themeOf(theme).label}
    </button>
  );
}
