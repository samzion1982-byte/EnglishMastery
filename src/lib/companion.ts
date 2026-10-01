export type CompanionPresence = { ok: true; deviceId: string } | { ok: false };

export async function readCompanion(): Promise<CompanionPresence> {
  for (const host of ['127.0.0.1', 'localhost']) {
    try {
      const response = await fetch(`http://${host}:65432/status`, { cache: 'no-store', credentials: 'omit', signal: AbortSignal.timeout(3500) });
      if (!response.ok) continue;
      const payload = await response.json();
      const id = payload.deviceId ?? payload.device_id;
      if (payload.running === true && typeof id === 'string' && id.length > 0) return { ok: true, deviceId: id };
    } catch { /* Try the CMS fallback host; never grant access on failure. */ }
  }
  return { ok: false };
}

export async function checkCompanion(): Promise<boolean> {
  return (await readCompanion()).ok;
}
