/** Turn captured microphone floats into a WAV Groq can transcribe. */

const RATE = 16000;

function writeAscii(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) view.setUint8(offset + index, text.charCodeAt(index));
}

export function encodeWav(chunks: Float32Array[], inputRate: number, outputRate = RATE, lastMs?: number) {
  const rate = inputRate > 0 ? inputRate : outputRate;
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const mixed = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    mixed.set(chunk, offset);
    offset += chunk.length;
  }
  const keep = lastMs && lastMs > 0 ? Math.floor(rate * (lastMs / 1000)) : mixed.length;
  const slice = keep < mixed.length ? mixed.subarray(mixed.length - keep) : mixed;
  const step = rate / outputRate;
  const count = Math.max(0, Math.floor(slice.length / step));
  const pcm = new Int16Array(count);
  for (let index = 0; index < count; index += 1) {
    const sample = slice[Math.min(slice.length - 1, Math.floor(index * step))] ?? 0;
    const clipped = Math.max(-1, Math.min(1, sample));
    pcm[index] = clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
  }
  const bytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + bytes);
  const view = new DataView(buffer);
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + bytes, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, outputRate, true);
  view.setUint32(28, outputRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, bytes, true);
  new Uint8Array(buffer, 44).set(new Uint8Array(pcm.buffer));
  return new Blob([buffer], { type: 'audio/wav' });
}

export function wavDurationMs(blob: Blob, outputRate = RATE) {
  return Math.round(Math.max(0, blob.size - 44) / 2 / outputRate * 1000);
}
