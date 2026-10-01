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
        <span>Theme and font are in the account menu. Translation languages stay here.</span>
      </header>
      <div className="settings-layout">
        <nav aria-label="Settings sections">
          <a href="#languages">Translation languages</a>
        </nav>
        <div className="settings-sections">
          <TranslationControls />
        </div>
      </div>
    </div>
  );
}
