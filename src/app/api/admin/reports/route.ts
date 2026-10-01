import { execFile } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { isFullAccess } from '@/lib/access';
import { getSessionRole } from '@/lib/supabase-server';

const FOLDER = 'Reports - All Schools';
const execFileAsync = promisify(execFile);

const reply = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

async function desktopDir() {
  if (process.platform === 'win32') {
    try {
      const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-Command', "[Environment]::GetFolderPath('Desktop')"], { windowsHide: true });
      const dir = stdout.trim();
      if (dir) return dir;
    } catch {
      /* Use a Desktop path under the home folder. */
    }
  }
  const candidates = [path.join(os.homedir(), 'OneDrive', 'Desktop'), path.join(os.homedir(), 'Desktop')];
  for (const dir of candidates) {
    try {
      await access(dir);
      return dir;
    } catch {
      /* Try the next known Desktop location. */
    }
  }
  return path.join(os.homedir(), 'Desktop');
}

function workbookName(name: string) {
  const base = path.basename(name).replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '').trim();
  if (!base.toLowerCase().endsWith('.xlsx') || base.length < 6 || base.length > 180 || base.includes('..')) return '';
  return base;
}

export async function POST(request: Request) {
  const auth = await getSessionRole();
  if (!auth.user || !auth.active || !isFullAccess(auth.role)) return reply({ error: 'Unauthorized' }, 403);
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return reply({ error: 'Missing workbook.' }, 400);
  const name = workbookName(file.name);
  if (!name) return reply({ error: 'The workbook name is not valid.' }, 400);
  try {
    const folder = path.join(await desktopDir(), FOLDER);
    await mkdir(folder, { recursive: true });
    const target = path.join(folder, name);
    if (path.dirname(target) !== folder) return reply({ error: 'The workbook name is not valid.' }, 400);
    await writeFile(target, Buffer.from(await file.arrayBuffer()));
    return reply({ saved: true, folder });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create the reports folder.';
    return reply({ error: message }, 500);
  }
}
