export const FONT_KEY = 'em-interface-font';
// Keep stored IDs stable so existing choices map to their replacement fonts.
export const INTERFACE_FONTS = [
    { id: 'dm', label: 'Nunito', family: "'Nunito', sans-serif", note: 'Soft and rounded' },
    { id: 'plex', label: 'Merriweather', family: "'Merriweather', Georgia, serif", note: 'Expressive editorial serif' },
    { id: 'space', label: 'Space Grotesk', family: "'Space Grotesk', sans-serif", note: 'Distinctive and geometric' },
    { id: 'system', label: 'System', family: 'system-ui, sans-serif', note: 'Native to your device' },
    { id: 'serif', label: 'Classic serif', family: 'Georgia, serif', note: 'A traditional reading style' },
] as const;
export type InterfaceFont = (typeof INTERFACE_FONTS)[number]['id'];
export function readFont(): InterfaceFont { try {
    const id = localStorage.getItem(FONT_KEY);
    return INTERFACE_FONTS.find(f => f.id === id)?.id ?? 'dm';
}
catch {
    return 'dm';
} }
export function applyFont(id: InterfaceFont) { document.documentElement.dataset.interfaceFont = id; try {
    localStorage.setItem(FONT_KEY, id);
}
catch { } window.dispatchEvent(new Event('em-font-change')); }
