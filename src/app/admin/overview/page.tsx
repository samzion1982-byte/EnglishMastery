import Link from 'next/link';
import { ADMIN_PAGES, canOpenAdminPage, isFullAccess, isSchoolStaff, isSuperAdmin } from '@/lib/access';
import { createServerSupabase } from '@/lib/supabase-server';
import { getAdminSessionRole as getSessionRole } from '@/lib/admin-session';
import { loadRoleGrants } from '@/lib/grants';
import { readSchoolPost } from '@/lib/school-post';
import { classRank } from '@/lib/school-tracker';
import type { ClassRef } from '@/lib/school-report';

const SECTION_LABEL: Record<string, string> = {
  content: 'LEARNING CONTENT',
  access: 'PEOPLE & ACCESS',
  distribution: 'DISTRIBUTION',
  reports: 'REPORTS',
  logs: 'LOGS',
};

const DESIGNATION: Record<string, string> = {
  principal: 'Principal',
  hod: 'HOD',
  teacher: 'Teacher',
  tutor: 'Tutor',
};

function entitlementText(designation: string, items: ClassRef[]) {
  if (designation === 'principal') return 'Whole School';
  const ranked = [...items].sort((a, b) => classRank(a.standard, a.section || 'A') - classRank(b.standard, b.section || 'A'));
  if (designation === 'hod') {
    return [...new Set(ranked.map((item) => item.standard))].join(', ');
  }
  return ranked.filter((item) => item.section).map((item) => `${item.standard} - ${item.section}`).join(', ');
}

export default async function Overview() {
  const { role, name } = await getSessionRole();
  const sb = await createServerSupabase();
  const [grants, post] = await Promise.all([
    isSuperAdmin(role) ? {} : loadRoleGrants(sb, role || ''),
    isSchoolStaff(role) ? readSchoolPost(sb) : null,
  ]);
  const pages = ADMIN_PAGES.filter((p) => canOpenAdminPage(role, p.key, grants, post?.designation));
  const contentPages = pages.filter(page => page.section === 'content');
  const otherPages = pages.filter(page => page.section !== 'content');
  const descriptions: Record<string, string> = {
    'core-vocabulary': 'Review, organize, enrich, and publish vocabulary across learning tracks.',
    appendix: 'Organize extra word lists and topic collections.',
    users: 'Open a school to add, deactivate, or remove its staff.',
    'school-staff': 'Add, edit, disable, reset, or remove staff at your school.',
    permissions: 'Choose which learning pages each level can open.',
    licences: 'Upload a school tracker, copy its registration link, and approve waiting students.',
    reports: 'Download a learning workbook for the classes you cover.',
    logs: 'See who is using speech recognition, how many speak at once, and when Groq is rate-limiting checks.',
  };
  const title = post?.designation ? DESIGNATION[post.designation] || post.designation : '';
  const schoolLine = post ? [post.school, title, post.email].filter(Boolean).join(' · ') : '';
  let entitlement = post?.designation === 'principal' ? 'Whole School' : '';
  if (post?.licenceId && post.designation && post.designation !== 'principal') {
    const coverage = await sb.rpc('list_school_coverage', { p_licence_id: post.licenceId });
    const desk = coverage.data as { staff?: { coverage?: ClassRef[] }[] } | null;
    entitlement = coverage.error ? '' : entitlementText(post.designation, desk?.staff?.[0]?.coverage || []);
  }
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <p>WORKSPACE / OVERVIEW</p>
        <h1>Welcome back{name ? ', ' + name : ''}</h1>
        <span>{schoolLine || 'Manage learning content, support students, and configure your workspace.'}</span>
      </header>
      <section aria-labelledby="work-heading">
        <h2 id="work-heading">Your workspace</h2>
        {pages.length === 0 ? <p>You are signed in to the admin panel.</p> : (
          <div className="admin-destinations">
            {contentPages.length > 0 && (
              <article className="overview-content-tile">
                <span className="admin-kicker">LEARNING CONTENT</span>
                <h3>{contentPages.map(page => page.label).join(' & ')}</h3>
                <p>Manage vocabulary, word lists, and topic collections.</p>
                <div className="overview-content-actions">
                  {contentPages.map(page => <Link className="overview-content-link" key={page.key} href={page.path}>{page.label} →</Link>)}
                </div>
              </article>
            )}
            {otherPages.map((p) => (
              <Link href={p.path} key={p.key}>
                {p.key === 'reports' && entitlement ? <em className="entitlement">{entitlement}</em> : null}
                <span>{SECTION_LABEL[p.section] || 'LEARNING CONTENT'}</span>
                <h3>{p.label}</h3>
                <p>{descriptions[p.key]}</p>
                <strong>Open {p.label.toLowerCase()} →</strong>
              </Link>
            ))}
          </div>
        )}
      </section>
      {isFullAccess(role) ? (
        <section className="settings-panel overview-settings">
          <div>
            <h2>A workspace that fits you</h2>
            <p>Set your color theme and interface font separately.</p>
          </div>
          <Link href="/admin/settings">Open settings →</Link>
        </section>
      ) : null}
    </div>
  );
}
