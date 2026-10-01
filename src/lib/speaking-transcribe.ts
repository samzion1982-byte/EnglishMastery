import 'server-only';
import { cleanHeard, isSilentTake, matchSpeech, type SpeakMatch } from './speaking-lines';

/**
 * Groq hosts both Whisper models. Large v3 is the one for these checks.
 * A beginner line is a few seconds, so Turbo's speed does not change the wait,
 * and Large v3 mis-hears accented classroom speech less often.
 * Set GROQ_SPEAK_MODEL=whisper-large-v3-turbo to compare.
 */
const ALLOWED = new Set(['whisper-large-v3', 'whisper-large-v3-turbo']);
export const SPEAK_MODEL = ALLOWED.has(process.env.GROQ_SPEAK_MODEL ?? '') ? process.env.GROQ_SPEAK_MODEL! : 'whisper-large-v3';

export class SpeakCheckError extends Error {
  constructor(message: string, public status = 503, public retryAfter = 0) { super(message); }
}

type Verbose = { text?: string; segments?: { no_speech_prob?: number; text?: string }[] };

const EXT: [string, string][] = [
  ['mp4', 'mp4'], ['m4a', 'm4a'], ['aac', 'm4a'], ['ogg', 'ogg'], ['wav', 'wav'], ['mpeg', 'mp3'], ['mp3', 'mp3'],
];

function extension(type: string) {
  const hit = EXT.find(([needle]) => type.includes(needle));
  return hit ? hit[1] : 'webm';
}

/** Hear the recording. The target line is not sent as a prompt, so the model cannot be nudged toward the answer. */
export async function transcribeLine(target: string, audio: Blob, type: string, options?: { model?: string; keepText?: boolean }): Promise<SpeakMatch & { silent: boolean }> {
  if (!process.env.GROQ_API_KEY) throw new SpeakCheckError('Speaking check is not configured yet.');
  const model = options?.model && ALLOWED.has(options.model) ? options.model : SPEAK_MODEL;
  const form = new FormData();
  form.set('file', audio, `line.${extension(type)}`);
  form.set('model', model);
  form.set('language', 'en');
  form.set('response_format', 'verbose_json');
  form.set('temperature', '0');
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(options?.keepText ? 12000 : 20000),
  });
  if (response.status === 429) {
    const wait = Number(response.headers.get('retry-after')) || 20;
    throw new SpeakCheckError('The speaking check is busy. Try this line again in a moment.', 429, wait);
  }
  if (!response.ok) throw new SpeakCheckError('Speaking check could not hear that recording. Try again.');
  const payload = await response.json() as Verbose;
  const heard = cleanHeard(typeof payload.text === 'string' ? payload.text : '');
  const probs = (payload.segments ?? []).map((segment) => segment.no_speech_prob).filter((value): value is number => typeof value === 'number');
  const noSpeechProb = probs.length ? Math.min(...probs) : heard ? 0 : 1;
  const silent = isSilentTake(target, heard, noSpeechProb);
  if (silent && !options?.keepText) {
    const empty = matchSpeech(target, '');
    return { ...empty, silent: true };
  }
  return { ...matchSpeech(target, heard), silent };
}
