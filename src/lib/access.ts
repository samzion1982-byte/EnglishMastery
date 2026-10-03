export const SUPER_ADMIN_NICKNAME = 'Sam';

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin1: 'Admin',
  user4: 'Level 4',
  demo: 'Level 3',
  user: 'Level 2',
  admin: 'Level 1',
  student: 'Student',
};

export const ASSIGNABLE_ROLES = ['admin1', 'user4', 'demo', 'user', 'admin', 'student'] as const;
export const ADMIN_STAFF_ROLES = ['super_admin', 'admin1', 'admin', 'user', 'demo', 'user4'] as const;
export const SUPER_ONLY_PAGES = ['users', 'permissions', 'licences', 'logs'] as const;

export const ADMIN_PAGES = [
  { key: 'core-vocabulary', label: 'Core Vocabulary', path: '/admin', alwaysOn: true, superOnly: false, principalOnly: false, section: 'content' },
  { key: 'appendix', label: 'Appendix', path: '/admin/appendix', alwaysOn: false, superOnly: false, principalOnly: false, section: 'content' },
  { key: 'users', label: 'Staff', path: '/admin/users', alwaysOn: false, superOnly: true, principalOnly: false, section: 'access' },
  { key: 'school-staff', label: 'Staff', path: '/admin/staff', alwaysOn: false, superOnly: false, principalOnly: true, section: 'access' },
  { key: 'permissions', label: 'Permissions', path: '/admin/permissions', alwaysOn: false, superOnly: true, principalOnly: false, section: 'access' },
  { key: 'licences', label: 'Licences', path: '/admin/licences', alwaysOn: false, superOnly: true, principalOnly: false, section: 'distribution' },
  { key: 'reports', label: 'Reports', path: '/admin/reports', alwaysOn: false, superOnly: false, principalOnly: false, section: 'reports' },
  { key: 'logs', label: 'Speech recognition', path: '/admin/logs', alwaysOn: false, superOnly: true, principalOnly: false, section: 'logs' },
] as const;

export const STUDENT_DEFAULT_PASSWORD = '123456';

export const SCHOOL_STAFF_ROLES = ['teacher', 'school_admin'] as const;

export function isAdminStaff(role: string | null | undefined) {
  return !!role && (ADMIN_STAFF_ROLES as readonly string[]).includes(role);
}

export function isSchoolStaff(role: string | null | undefined) {
  return !!role && (SCHOOL_STAFF_ROLES as readonly string[]).includes(role);
}

/** Console staff and school staff may open the admin panel. Students may not. */
export function isStaff(role: string | null | undefined) {
  return isAdminStaff(role) || isSchoolStaff(role);
}

export function isSuperAdmin(role: string | null | undefined) {
  return role === 'super_admin';
}

export function isFullAccess(role: string | null | undefined) {
  return role === 'super_admin' || role === 'admin1';
}

export function permissionRole(role: string | null | undefined, designation?: string | null) {
  if (designation === 'principal') return 'user4';
  if (designation === 'hod') return 'demo';
  if (designation === 'teacher') return 'user';
  if (designation === 'tutor') return 'admin';
  return role || '';
}

export function canOpenReports(role: string | null | undefined, designation?: string | null) {
  if (isFullAccess(role)) return true;
  return designation === 'principal' || designation === 'hod' || designation === 'teacher' || designation === 'tutor';
}

export function canOpenAdminPage(role: string | null | undefined, pageKey: string, grants: Record<string, boolean>, designation?: string | null) {
  const page = ADMIN_PAGES.find((p) => p.key === pageKey);
  if (page?.principalOnly) return designation === 'principal';
  if (page?.key === 'reports') {
    if (isSuperAdmin(role)) return true;
    const level = permissionRole(role, designation);
    if (!isAdminStaff(level)) return false;
    if (Object.prototype.hasOwnProperty.call(grants, pageKey)) return !!grants[pageKey];
    return canOpenReports(role, designation);
  }
  if ((SUPER_ONLY_PAGES as readonly string[]).includes(pageKey)) return isSuperAdmin(role);
  if (isSuperAdmin(role)) return true;
  const level = permissionRole(role, designation);
  if (!isAdminStaff(level)) return false;
  if (Object.prototype.hasOwnProperty.call(grants, pageKey)) return !!grants[pageKey];
  if (level === 'admin1') return true;
  if (page?.alwaysOn) return true;
  return !!grants[pageKey];
}

/** Publish a looked-up word. Super Admin always; junior staff only if you grant `add-words` later. */
export const ADD_WORDS_GRANT = 'add-words';

export function canAddCoreWords(role: string | null | undefined, grants: Record<string, boolean> = {}) {
  if (isFullAccess(role)) return true;
  if (!isAdminStaff(role)) return false;
  return !!grants[ADD_WORDS_GRANT];
}
