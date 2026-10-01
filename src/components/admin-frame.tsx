'use client';

import { useEffect, useState } from 'react';
import { useDialog } from './use-dialog';
import Link, { useLinkStatus } from 'next/link';
import { usePathname } from 'next/navigation';
import { ADMIN_PAGES, canOpenAdminPage, isFullAccess, isSchoolStaff, isSuperAdmin, ROLE_LABELS } from '@/lib/access';
import { Icon } from './icon';
import { SignOutButton } from './sign-out-button';

import { Logo } from './logo';

function NavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="side-pending" aria-hidden="true" />;
}

function SideLink({ href, current, onNavigate, icon, label }: { href: string; current: boolean; onNavigate: () => void; icon: string; label: string }) {
  return (
    <Link href={href} aria-current={current ? 'page' : undefined} onClick={onNavigate} className={current ? 'side-link on' : 'side-link'}>
      <Icon kind={icon} />
      {label}
      <NavPending />
    </Link>
  );
}

const ICONS: Record<string, string> = {
  'core-vocabulary': 'book',
  appendix: 'list',
  users: 'users',
  'school-staff': 'user',
  permissions: 'shield',
  licences: 'lock',
  reports: 'notepad',
  logs: 'clock',
};

export function AdminFrame({
  role,
  name,
  grants,
  designation,
  children,
}: {
  role: string;
  name?: string;
  grants: Record<string, boolean>;
  designation?: string | null;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const drawer = useDialog<HTMLElement>(() => setOpen(false), open);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', resize);
    return () => desktop.removeEventListener('change', resize);
  }, []);
  const items = ADMIN_PAGES.filter((page) => canOpenAdminPage(role, page.key, grants, designation));
  const content = items.filter((p) => p.section === 'content');
  const access = items.filter((p) => p.section === 'access');
  const distribution = items.filter((p) => p.section === 'distribution');
  const reports = items.filter((p) => p.section === 'reports');
  const logs = items.filter((p) => p.section === 'logs');
  const initials = (name || 'SA')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  function current(itemPath: string) {
    if (itemPath === '/admin') return path === '/admin';
    return path === itemPath || path.startsWith(`${itemPath}/`);
  }

  function nav(pages: typeof items) {
    return pages.map((item) => (
      <SideLink key={item.key} href={item.path} current={current(item.path)} onNavigate={() => setOpen(false)} icon={ICONS[item.key] || 'diamond'} label={item.label} />
    ));
  }

  return (
    <div className="admin-app">
      <a className="skip" href="#admin-content">Skip to content</a>
      <header className="admin-mobile-head"><strong>English Mastery <small>Admin</small></strong><button type="button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(true)}>Menu</button></header>
      {open && <div className="admin-nav-backdrop" onClick={() => setOpen(false)} />}
      <aside ref={drawer} id="admin-navigation" className={`admin-side${open ? " is-open" : ""}`} aria-label="Admin navigation" role={open ? "dialog" : undefined} aria-modal={open || undefined}>
        <button type="button" className="admin-nav-close" onClick={() => setOpen(false)}>Close navigation</button>
        <Link href="/admin/overview" className="side-brand">
          <Logo size={32} />
          <span>
            <strong>English Mastery</strong>
            <em>Administration</em>
          </span>
        </Link>
        <nav>
          <p className="nav-label">Workspace</p>
          <SideLink href="/admin/overview" current={path === '/admin/overview'} onNavigate={() => setOpen(false)} icon="home" label="Overview" />
          <p className="nav-label">Learning content</p>
          {nav(content)}
          {access.length > 0 && (
            <>
              <p className="nav-label">People & access</p>
              {nav(access)}
            </>
          )}
          {distribution.length > 0 && (
            <>
              <p className="nav-label">Distribution</p>
              {nav(distribution)}
            </>
          )}
          {reports.length > 0 && (
            <>
              <p className="nav-label">Reports</p>
              {nav(reports)}
            </>
          )}
          {logs.length > 0 && (
            <>
              <p className="nav-label">Logs</p>
              {nav(logs)}
            </>
          )}
          {isFullAccess(role) ? (
            <>
              <p className="nav-label">Preferences</p>
              <SideLink href="/admin/settings" current={path === '/admin/settings'} onNavigate={() => setOpen(false)} icon="settings" label="Settings" />
            </>
          ) : null}
        </nav>
        <div className="side-foot">
          <div className="who">
            <span className="who-av" aria-hidden="true">
              {initials}
            </span>
            <span>
              <strong>{name || ROLE_LABELS[role]}</strong>
              <em>{isSuperAdmin(role) ? 'Super Admin' : designation === 'principal' ? 'Principal' : designation === 'hod' ? 'HOD' : isSchoolStaff(role) ? 'School staff' : ROLE_LABELS[role] || role}</em>
            </span>
          </div>

          <Link href="/" className="side-link">
            <Icon kind="home" />
            Student hub
          </Link>
          <SignOutButton className="side-link sign-out" icon to="/login?as=admin" />
        </div>
      </aside>
      <main id="admin-content" className="admin-main"><div className="admin-context"><span>Administration <span aria-hidden="true">/</span> {path === '/admin/settings' ? 'Settings' : path === '/admin/overview' ? 'Overview' : path.startsWith('/admin/licences/') ? 'School roster' : path === '/admin/staff' ? 'Staff' : items.find(p=>p.path===path)?.label || 'Workspace'}</span><Link href="/">View student hub ↗</Link></div>{children}</main>
    </div>
  );
}
