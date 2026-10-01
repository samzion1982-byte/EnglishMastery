'use client';
import { useCallback, useState } from 'react';
export type NoticeTone = 'info' | 'success' | 'warning' | 'error';
export function useNotice(initial = '') {
  const [notice, update] = useState({ text: initial, tone: 'info' as NoticeTone });
  const setNotice = useCallback((text: string, tone: NoticeTone = 'info') => update({ text, tone }), []);
  return [notice.text, setNotice, notice.tone] as const;
}
