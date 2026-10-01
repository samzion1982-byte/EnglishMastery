'use client';

import { useEffect, useState } from 'react';

const themes = [
  { id: 'classic', name: 'Classic', detail: 'Original navy · softly beveled', colors: ['#16324f', '#eef1f6', '#ffffff'] },
  { id: 'emerald', name: 'Emerald', detail: 'Forest green · rounded and soft', colors: ['#155347', '#edf5ef', '#ffffff'] },
  { id: 'ocean', name: 'Ocean', detail: 'Ocean blue · crisp and minimal', colors: ['#175b83', '#edf5fa', '#ffffff'] },
  { id: 'amethyst', name: 'Amethyst', detail: 'Plum violet · gentle lighting', colors: ['#603e80', '#f3eff8', '#ffffff'] },
  { id: 'sandstone', name: 'Sandstone', detail: 'Warm bronze · clean paper finish', colors: ['#79502d', '#f7f2e9', '#fffdf8'] },
];

export function AdminThemeSettings() {
  const [selected, setSelected] = useState('classic');
  const [saved, setSaved] = useState('');
  useEffect(() => { setSelected(document.documentElement.dataset.adminStyle || 'classic'); }, []);
  function choose(id: string) {
    document.documentElement.dataset.adminStyle = id;
    setSelected(id);
    try { localStorage.setItem('em-admin-style', id); setSaved('Theme saved for this browser.'); }
    catch { setSaved('Theme applied. Browser storage is unavailable, so it may reset on reload.'); }
  }
  return (
    <section id="themes" className="settings-panel">
      <h2>Themes</h2>
      <p>Choose the appearance of your admin panel. Your choice applies immediately and is saved on this browser.</p>
      <div className="admin-style-grid">
        {themes.map(theme => (
          <button key={theme.id} type="button" aria-pressed={selected === theme.id} onClick={() => choose(theme.id)}>
            <span className="admin-style-preview" aria-hidden="true" style={{ background: theme.colors[1], borderRadius: theme.id === 'emerald' ? 18 : theme.id === 'ocean' ? 4 : 10 }}>
              <i style={{ background: theme.colors[0] }} />
              <span style={{ background: theme.colors[2], borderTop: '4px solid ' + theme.colors[0] }}><b style={{ background: theme.colors[0] }} /></span>
            </span>
            <strong>{theme.name}{selected === theme.id ? ' ✓' : ''}</strong>
            <small>{theme.detail}</small>
          </button>
        ))}
      </div>
      <p role="status">{saved}</p>
    </section>
  );
}
