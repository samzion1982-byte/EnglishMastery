'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { IndividualValidity } from '../individual-validity';
import { Icon } from '../icon';
import { Logo } from '../logo';
import { SignOutButton } from '../sign-out-button';
import { INTERFACE_FONTS, applyFont, readFont, type InterfaceFont } from '@/lib/interface-fonts';
import { THEMES, applyTheme, readTheme, type ThemeId } from '@/lib/themes';
import { PATTERNS, applyPattern, readPattern, type PatternId } from '@/lib/patterns';

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? 'L') + (parts[1]?.[0] ?? '')).toUpperCase();
}

const ACTIVE_KEY = 'em-active-use';

function useActiveMinutes(userId: string) {
  const [minutes, setMinutes] = useState(0);
  useEffect(() => {
    let ms = 0;
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_KEY) || 'null') as { user?: string; ms?: number } | null;
      if (saved?.user === userId && typeof saved.ms === 'number') ms = saved.ms;
    } catch {}
    let mark: number | null = null;
    const flush = (visible: boolean) => {
      const now = Date.now();
      if (mark != null) ms += now - mark;
      mark = visible ? now : null;
      sessionStorage.setItem(ACTIVE_KEY, JSON.stringify({ user: userId, ms }));
      setMinutes(Math.floor(ms / 60000));
    };
    flush(document.visibilityState === 'visible');
    const tick = window.setInterval(() => {
      if (document.visibilityState === 'visible') flush(true);
    }, 10000);
    const onVis = () => flush(document.visibilityState === 'visible');
    const onHide = () => flush(false);
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    return () => {
      flush(false);
      window.clearInterval(tick);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onHide);
    };
  }, [userId]);
  return minutes;
}

export function TopBar({
  name,
  streak,
  xp,
  onHome,
  onProfile,
  staff = false,
  userId = 'guest',
}: {
  name: string;
  streak: number;
  xp: number;
  onHome: () => void;
  onProfile: () => void;
  staff?: boolean;
  userId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>('forest');
  const [pattern, setPattern] = useState<PatternId>('dots');
  const [font, setFont] = useState<InterfaceFont>('dm');
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const activeMinutes = useActiveMinutes(userId);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!menu.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('.s-menu button') ?? []);
        const index = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        event.preventDefault(); items[next]?.focus();
      }
    }
    menu.current?.querySelector<HTMLButtonElement>('.s-menu button')?.focus();
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    setTheme(readTheme());
    setFont(readFont());
    setPattern(readPattern());
    const onTheme = () => setTheme(readTheme());
    const onFont = () => setFont(readFont());
    const onPattern = () => setPattern(readPattern());
    window.addEventListener('em-theme-change', onTheme);
    window.addEventListener('em-font-change', onFont);
    window.addEventListener('em-pattern-change', onPattern);
    return () => {
      window.removeEventListener('em-theme-change', onTheme);
      window.removeEventListener('em-font-change', onFont);
      window.removeEventListener('em-pattern-change', onPattern);
    };
  }, []);

  return (
    <header className="s-top">
      <button type="button" className="s-brand" onClick={onHome} aria-label="English Mastery home">
        <Logo size={42} />
        <span className="s-brand-copy">
          <strong>
            <span className="s-word">English</span> <span className="s-word mastery">Mastery</span>
          </strong>
          <span className="s-company">by Zion Solutions</span>
        </span>
      </button>

      <div className="s-top-right">
        <span className="s-pill" title="Minutes this page has been open since you signed in">
          <Icon kind="clock" />
          <b>{activeMinutes}</b>
          <span className="pill-label">{activeMinutes === 1 ? 'min' : 'mins'}</span>
        </span>
        <span className={`s-pill streak${streak > 0 ? ' lit' : ''}`} title={`${streak}-day streak`}>
          <Icon kind="flame" />
          <b>{streak}</b>
          <span className="pill-label">{streak === 1 ? 'day' : 'days'}</span>
        </span>
        <span className="s-pill xp" data-xp-bucket title={`${xp} XP in total`}>
          <Icon kind="sparkle" />
          <b>{xp.toLocaleString()}</b>
          <span className="pill-label">XP</span>
        </span>

        <div className="s-account" ref={menu}>
          <button
            type="button"
            ref={trigger}
            aria-label="Account and settings"
            className="s-avatar-btn"
            aria-haspopup="true"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="s-avatar">{initials(name)}</span>
            <Icon kind="chevron" />
          </button>
          {open && (
            <div className="s-menu" aria-label="Account options">
              <div className="s-menu-head">
                <div>
                  <strong>{name}</strong>
                  <IndividualValidity />
                  <span>{xp.toLocaleString()} XP in total</span>
                </div>
                {staff && (
                  <Link className="s-menu-admin" href="/admin/overview">
                    Admin
                  </Link>
                )}
              </div>
              <button
                type="button"
                className="s-menu-item"
                onClick={() => {
                  setOpen(false);
                  onProfile();
                }}
              >
                <Icon kind="user" />
                Profile & settings
              </button>
              <p className="s-menu-label">Theme</p>
              <div className="s-menu-themes">
                {THEMES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`s-theme-dot skin-${item.id}${theme === item.id ? ' on' : ''}`}
                    aria-label={item.label}
                    aria-pressed={theme === item.id}
                    title={item.label}
                    onClick={() => {
                      applyTheme(item.id);
                      setTheme(item.id);
                    }}
                  >
                  </button>
                ))}
              </div>
              <p className="s-menu-label">Pattern</p>
              <div className="s-menu-themes">
                {PATTERNS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`s-pattern-dot pattern-${item.id}${pattern === item.id ? ' on' : ''}`}
                    aria-label={item.label}
                    aria-pressed={pattern === item.id}
                    title={item.label}
                    onClick={() => {
                      applyPattern(item.id);
                      setPattern(item.id);
                    }}
                  />
                ))}
              </div>
              <label className="s-menu-font">
                <p className="s-menu-label">Font</p>
                <select
                  aria-label="Font"
                  value={font}
                  style={{ fontFamily: INTERFACE_FONTS.find((item) => item.id === font)?.family }}
                  onChange={(event) => {
                    const next = event.target.value as InterfaceFont;
                    applyFont(next);
                    setFont(next);
                  }}
                >
                  {INTERFACE_FONTS.map((item) => (
                    <option key={item.id} value={item.id} style={{ fontFamily: item.family }}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <SignOutButton className="s-menu-item danger" icon />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
