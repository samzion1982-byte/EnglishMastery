import { beatsOf } from './pronounce-beats';

const VOICE_LANG = { en: 'en-GB', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', fr: 'fr-FR' } as const;

const FEMALE_EN = /zira|hazel|susan|sonia|libby|maisie|aria|jenny|emma|natasha|michelle|samantha|serena|victoria|karen|moira|fiona|heera|neerja|swara|female/i;
const MALE_EN = /david|mark|george|ravi|daniel|guy|ryan|male/i;
/** Warmer female voices, chosen before the flat desktop voice. */
const PLEASANT_EN = ['sonia', 'libby', 'maisie', 'hazel', 'susan', 'google uk english female', 'aria', 'jenny', 'emma', 'natasha', 'michelle', 'samantha', 'serena', 'fiona', 'moira', 'neerja', 'heera', 'swara'];

function pickVoice(lang: keyof typeof VOICE_LANG) {
  const voices = speechSynthesis.getVoices();
  if (lang === 'en') {
    const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith('en'));
    for (const name of PLEASANT_EN) {
      const match = english.find((voice) => voice.name.toLowerCase().includes(name));
      if (match) return match;
    }
    return (
      english.find((voice) => FEMALE_EN.test(voice.name) && !/zira/i.test(voice.name)) ||
      english.find((voice) => /zira/i.test(voice.name)) ||
      english.find((voice) => !MALE_EN.test(voice.name)) ||
      english[0]
    );
  }
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(lang));
}

/** Speak a word. Tamil and Hindi use the matching browser voice when one is installed. */
export function speakWord(text: string, lang: keyof typeof VOICE_LANG = 'en', onError?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = VOICE_LANG[lang];
  utterance.rate = lang === 'en' ? 0.85 : 0.92;
  const voice = pickVoice(lang);
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
  utterance.onerror = (event) => {
    if (event.error === 'canceled' || event.error === 'interrupted' || event.error === 'not-allowed') return;
    onError?.();
  };
  speechSynthesis.speak(utterance);
  return true;
}

const VOWEL = new Set(['ih', 'ee', 'eh', 'a', 'ah', 'o', 'aw', 'uu', 'oo', 'uh', 'er', 'eye', 'ow', 'oy', 'ay', 'oh', 'air', 'eer', 'oor']);
const IPA: [string, string][] = [
  ['tʃ', 'ch'], ['dʒ', 'j'],
  ['aɪ', 'eye'], ['aʊ', 'ow'], ['ɔɪ', 'oy'], ['eɪ', 'ay'], ['oʊ', 'oh'], ['əʊ', 'oh'],
  ['ɛə', 'air'], ['ɪə', 'eer'], ['ʊə', 'oor'],
  ['iː', 'ee'], ['uː', 'oo'], ['ɑː', 'ah'], ['ɔː', 'aw'], ['ɜː', 'er'], ['əː', 'er'],
  ['ɪ', 'ih'], ['ɛ', 'eh'], ['æ', 'a'], ['ɑ', 'ah'], ['ɒ', 'o'], ['ɔ', 'aw'],
  ['ʊ', 'uu'], ['ʌ', 'uh'], ['ə', 'uh'], ['ɜ', 'er'], ['ɝ', 'er'], ['ɚ', 'er'],
  ['θ', 'th'], ['ð', 'th'], ['ʃ', 'sh'], ['ʒ', 'zh'], ['ŋ', 'ng'], ['ɡ', 'g'], ['ɫ', 'l'],
];

/**
 * Turn a dictionary pronunciation into sounds the browser voice can say.
 * "petrichor" is /pɛtrɪkɝ/, but the letters "ch" make the voice say "cher".
 */
export function speakable(phonetic: string | null | undefined) {
  if (!phonetic) return null;
  let rest = phonetic.replace(/[\/\[\]]/g, '').replace(/[ˈˌ.ˑ\s]/g, '');
  if (!rest) return null;
  const tokens: string[] = [];
  while (rest) {
    const hit = IPA.find(([symbol]) => rest.startsWith(symbol));
    if (hit) {
      tokens.push(hit[1]);
      rest = rest.slice(hit[0].length);
      continue;
    }
    const ch = rest[0].toLowerCase();
    rest = rest.slice(1);
    if (/[a-z]/.test(ch)) tokens.push(ch === 'i' ? 'ee' : ch === 'u' ? 'oo' : ch === 'e' ? 'eh' : ch);
  }
  const syllables: string[] = [];
  let chunk = '';
  for (const token of tokens) {
    chunk += token;
    if (VOWEL.has(token)) {
      syllables.push(chunk);
      chunk = '';
    }
  }
  if (chunk) {
    if (syllables.length) syllables[syllables.length - 1] += chunk;
    else syllables.push(chunk);
  }
  const phrase = syllables.join(' ').trim();
  return phrase || null;
}

/** "ch" read as /k/ in a rare word, like petrichor. Familiar words stay as written. */
function spellingMisleads(word: string, phonetic?: string | null) {
  if (!phonetic) return false;
  const letters = word.toLowerCase();
  if (!letters.includes('ch')) return false;
  const ipa = phonetic.replace(/[\/\[\]]/g, '');
  if (ipa.includes('tʃ') || ipa.includes('ʧ') || !ipa.includes('k')) return false;
  return !/sch|tech|chem|chor|char|arch|mech|psych|chris|chrom|chao|choi|echo|ache|anch|stoma|monar|orchi|orche|schem|sched|schol/.test(letters);
}

function forVoice(word: string, phonetic?: string | null) {
  if (!spellingMisleads(word, phonetic)) return word;
  return speakable(phonetic) || word;
}

/** The female English voice. A rare spelling such as petrichor uses the dictionary sounds. */
export function pronounce(text: string, phonetic?: string | null) {
  return speakWord(forVoice(text, phonetic));
}

export type DictateTick = { parts: string[]; at: number; phase: 'part' | 'whole' | 'done' };

let dictateId = 0;

export function stopDictate() {
  dictateId += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.cancel();
}

function attachEnglish(utterance: SpeechSynthesisUtterance, rate: number) {
  utterance.lang = VOICE_LANG.en;
  utterance.rate = rate;
  const voice = pickVoice('en');
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  }
}

/** True when the browser has an English text-to-speech voice. Voices can arrive late. */
export function watchEnglishVoice(onChange: (ready: boolean) => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onChange(false);
    return () => undefined;
  }
  const look = () => speechSynthesis.getVoices().some((voice) => voice.lang.toLowerCase().startsWith('en'));
  const report = () => onChange(look());
  report();
  speechSynthesis.addEventListener('voiceschanged', report);
  const timer = window.setTimeout(report, 700);
  return () => {
    window.clearTimeout(timer);
    speechSynthesis.removeEventListener('voiceschanged', report);
  };
}

/** Short pieces so a long passage is not cut off by the browser. */
export function speechChunks(text: string) {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const chunks: string[] = [];
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    const words = trimmed.split(/\s+/);
    if (words.length <= 22) {
      chunks.push(trimmed);
      continue;
    }
    const parts = trimmed.split(/,\s+/);
    let bucket: string[] = [];
    const flush = () => {
      if (bucket.length) chunks.push(bucket.join(', '));
      bucket = [];
    };
    for (const part of parts) {
      const next = bucket.concat(part);
      if (next.join(', ').split(/\s+/).length > 22) flush();
      bucket.push(part);
    }
    flush();
  }
  return chunks.length ? chunks : [text.trim()];
}

export type PassagePlayer = {
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

/**
 * Speak a passage as one track. Chunks play in order. Progress is 0–1 across the whole passage.
 */
export function playPassage(
  chunks: string[],
  rate: number,
  handlers: { onProgress: (ratio: number) => void; onEnd: () => void; onWord?: (index: number) => void },
): PassagePlayer {
  let stopped = false;
  let paused = false;
  let index = 0;
  let kickoff = 0;
  const weights = chunks.map((chunk) => Math.max(1, chunk.split(/\s+/).filter(Boolean).length));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let completed = 0;
  let wordBase = 0;
  let chunkStarted = 0;
  let chunkElapsed = 0;
  let boundaries = 0;
  let scale = 1.6;
  const tick = window.setInterval(() => {
    if (stopped || paused || index >= chunks.length || !chunkStarted) return;
    const words = weights[index] ?? 1;
    const expected = Math.max(800, (words / (150 * rate)) * 60_000);
    const elapsed = chunkElapsed + performance.now() - chunkStarted;
    const fraction = Math.min(0.92, elapsed / (expected * scale));
    if (boundaries === 0) handlers.onWord?.(wordBase + Math.min(words - 1, Math.floor(fraction * words)));
    handlers.onProgress(Math.min(0.99, (completed + words * fraction) / total));
  }, 200);

  function finish() {
    window.clearInterval(tick);
    window.clearTimeout(kickoff);
  }

  function speakAt(next: number) {
    if (stopped) return;
    if (next >= chunks.length) {
      handlers.onProgress(1);
      finish();
      handlers.onEnd();
      return;
    }
    index = next;
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    attachEnglish(utterance, rate);
    chunkStarted = 0;
    chunkElapsed = 0;
    boundaries = 0;
    let moved = false;
    const words = weights[index] ?? 1;
    const expected = Math.max(800, (words / (150 * rate)) * 60_000);
    utterance.onstart = () => {
      if (stopped) return;
      chunkStarted = performance.now();
    };
    utterance.onboundary = (event) => {
      if (stopped || paused || event.name !== 'word') return;
      boundaries += 1;
      const local = chunks[index].slice(0, event.charIndex).split(/\s+/).filter(Boolean).length;
      handlers.onWord?.(wordBase + Math.min(words - 1, local));
    };
    const advance = () => {
      if (stopped || paused || moved) return;
      moved = true;
      if (chunkStarted) {
        const actual = chunkElapsed + performance.now() - chunkStarted;
        if (actual > 400) scale = Math.min(2.6, Math.max(1, actual / expected));
      }
      completed += words;
      wordBase += words;
      handlers.onWord?.(wordBase - 1);
      speakAt(index + 1);
    };
    utterance.onend = advance;
    utterance.onerror = advance;
    speechSynthesis.speak(utterance);
  }

  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    finish();
    handlers.onEnd();
    return { pause() {}, resume() {}, stop() {} };
  }
  speechSynthesis.cancel();
  kickoff = window.setTimeout(() => speakAt(0), 40);

  return {
    pause() {
      paused = true;
      if (chunkStarted) {
        chunkElapsed += performance.now() - chunkStarted;
        chunkStarted = 0;
      }
      speechSynthesis.pause();
    },
    resume() {
      if (stopped) return;
      paused = false;
      chunkStarted = performance.now();
      speechSynthesis.resume();
    },
    stop() {
      stopped = true;
      finish();
      speechSynthesis.cancel();
    },
  };
}

function speakOnce(text: string, rate: number) {
  return new Promise<void>((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    attachEnglish(utterance, rate);
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    speechSynthesis.speak(utterance);
  });
}

function wait(ms: number, id: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (id === dictateId) resolve();
    }, ms);
  });
}

/**
 * Say the real word only. Colour moves across dictionary hyphen breaks while it plays,
 * then the word is said once more at a normal pace.
 */
export function dictate(word: string, onTick: (tick: DictateTick) => void, phonetic?: string | null) {
  const spoken = forVoice(word, phonetic);
  const parts = beatsOf(word);
  const id = ++dictateId;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) speechSynthesis.cancel();

  void (async () => {
    const slow = speakOnce(spoken, 0.62);
    if (parts.length > 1) {
      const each = Math.max(320, Math.round((word.length * 160) / parts.length));
      for (let i = 0; i < parts.length; i++) {
        if (id !== dictateId) return;
        onTick({ parts, at: i, phase: 'part' });
        await wait(each, id);
      }
    }
    await slow;
    if (id !== dictateId) return;
    onTick({ parts, at: parts.length, phase: 'whole' });
    await speakOnce(spoken, 0.86);
    if (id !== dictateId) return;
    onTick({ parts, at: parts.length, phase: 'done' });
  })();

  return parts;
}
