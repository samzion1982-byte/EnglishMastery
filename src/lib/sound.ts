let ctx: AudioContext | null = null;

function context() {
  if (typeof window === 'undefined') return null;
  const Audio = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Audio) return null;
  if (!ctx) ctx = new Audio();
  return ctx;
}

export function playCue(kind: 'tap' | 'ok' | 'miss') {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const audio = context();
  if (!audio) return;
  void audio.resume();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.connect(gain);
  gain.connect(audio.destination);
  if (kind === 'tap') {
    osc.frequency.value = 420;
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.start(now);
    osc.stop(now + 0.06);
    return;
  }
  if (kind === 'ok') {
    osc.frequency.setValueAtTime(523, now);
    osc.frequency.exponentialRampToValueAtTime(784, now + 0.12);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.18);
    return;
  }
  osc.frequency.value = 180;
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  osc.start(now);
  osc.stop(now + 0.16);
}
