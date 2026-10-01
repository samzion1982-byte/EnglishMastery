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
  const access = items.filter((p) => p.section === 'access' && p.key !== 'permissions');
  const permissions = items.filter((p) => p.key === 'permissions');
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
      <SideLink key={item.key} href={item.path} current={current(item.path)} onNavigate={() => setOpen(false)} icon={ICONS[item.key] || 'diamond'} label={item.key === 'logs' ? 'Logs' : item.label} />
    ));
  }

  return (
    <div className="admin-app">
      <a className="skip" href="#admin-content">Skip to content</a>
      <header className="admin-mobile-head"><strong>English Mastery <small>Admin</small></strong><button type="button" aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(true)}>Menu</button></header>
      {open && <div className="admin-nav-backdrop" onClick={() => setOpen(false)} />}
      <aside ref={drawer} id="admin-navigation" className={`admin-side${open ? " is-open" : ""}`} aria-label="Admin navigation" role={open ? "dialog" : undefined} aria-modal={open || undefined}>
        <button type="button" className="admin-nav-close" onClick={() => setOpen(false)}>Close navigation</button>
        <div className="admin-identity-card">
        <Link href="/admin/overview" className="side-brand">
          <Logo size={32} />
          <span>
            <strong>English Mastery</strong>
            <em>Administration</em>
          </span>
        </Link>
          <div className="who admin-user-badge">
            <span className="who-av" aria-hidden="true">
              {initials}
            </span>
            <span>
              <strong>{name || ROLE_LABELS[role]}</strong>
              <em>{isSuperAdmin(role) ? 'Super Admin' : designation === 'principal' ? 'Principal' : designation === 'hod' ? 'HOD' : isSchoolStaff(role) ? 'School staff' : ROLE_LABELS[role] || role}</em>
            </span>
            <SignOutButton className="admin-signout danger" iconOnly to="/login?as=admin" />
          </div>
        </div>
        <nav>
          <SideLink href="/" current={false} onNavigate={() => setOpen(false)} icon="home" label="Student Hub" />
          {(isFullAccess(role) || distribution.length > 0 || logs.length > 0 || permissions.length > 0) && (
            <details className="admin-nav-group admin-nav-fold" open>
              <summary>Admin</summary>
              <div className="admin-nav-items">
              {isFullAccess(role) && <SideLink href="/admin/settings" current={path === '/admin/settings'} onNavigate={() => setOpen(false)} icon="settings" label="Settings" />}
              {nav(permissions)}
              {nav(distribution)}
              {nav(logs)}
              </div>
            </details>
          )}
          <section className="admin-nav-group" aria-label="Workspace">
            <p className="nav-label">Workspace</p>
            <SideLink href="/admin/overview" current={path === '/admin/overview'} onNavigate={() => setOpen(false)} icon="home" label="Overview" />
            {nav(content)}
            {nav(access)}
            {nav(reports)}
          </section>
        </nav>
      </aside>
      <main id="admin-content" className="admin-main"><div className="admin-context"><span>Administration <span aria-hidden="true">/</span> {path === '/admin/settings' ? 'Settings' : path === '/admin/overview' ? 'Overview' : path.startsWith('/admin/licences/') ? 'School roster' : path === '/admin/staff' ? 'Staff' : items.find(p=>p.path===path)?.label || 'Workspace'}</span><Link href="/">View student hub ↗</Link></div>{children}</main>
    </div>
  );
}
