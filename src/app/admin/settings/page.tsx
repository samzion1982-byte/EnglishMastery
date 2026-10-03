import { TrustGateSettings } from '@/components/trustgate-settings';
import { AdminThemeSettings } from '@/components/admin-theme-settings';
import { redirect } from 'next/navigation';
import { TranslationControls } from '@/components/translation-controls';
import { isFullAccess } from '@/lib/access';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';

export default async function Settings() {
  const { role } = await getSessionRole();
  if (!isFullAccess(role)) redirect('/admin/overview');
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <p>WORKSPACE / SETTINGS</p>
        <h1>Settings</h1>
        <span>Personalise your admin theme and manage translation languages.</span>
      </header>
      <div className="settings-layout">
        <nav aria-label="Settings sections">
          <a href="#themes">Themes</a>
          <a href="#languages">Translation languages</a>
          {role === 'super_admin' && <a href="#trustgate">TrustGate</a>}
        </nav>
        <div className="settings-sections">
          <AdminThemeSettings />
          <TranslationControls />
          {role === 'super_admin' && <TrustGateSettings />}
        </div>
      </div>
    </div>
  );
}
