import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAdminStaff, isSchoolStaff } from '@/lib/access';

export async function proxy(request: NextRequest) {
  // Never trust a client-supplied admin session. Only this proxy may set it.
  request.headers.delete('x-em-admin-session');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request: { headers: request.headers } });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isLogin = path === '/login' || path.startsWith('/login/');
  const isChange = path === '/change-password' || path.startsWith('/change-password/');
  const isReset = path === '/reset-password' || path.startsWith('/reset-password/');
  const isJoin = path.startsWith('/j/') || path.startsWith('/join/');

  if (!user && !isLogin && !isJoin && !isReset) {
    const next = request.nextUrl.clone();
    next.pathname = '/login';
    if (path.startsWith('/admin')) next.searchParams.set('as', 'admin');
    return NextResponse.redirect(next);
  }

  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role, display_name, nickname, must_change_password, is_active').eq('id', user.id).maybeSingle();
    role = profile?.role ?? null;
    if (profile?.is_active === false) {
      await supabase.auth.signOut();
      const next = request.nextUrl.clone();
      next.pathname = '/login';
      next.search = '';
      return NextResponse.redirect(next);
    }
    if (profile?.must_change_password && !isChange && !isReset) {
      const next = request.nextUrl.clone();
      next.pathname = '/change-password';
      next.search = '';
      return NextResponse.redirect(next);
    }
    if ((path === '/admin' || path.startsWith('/admin/')) && (isAdminStaff(role) || isSchoolStaff(role))) {
      const forwarded = new Headers(request.headers);
      forwarded.set('x-em-admin-session', encodeURIComponent(JSON.stringify({
        user: { id: user.id }, role,
        name: profile?.nickname || profile?.display_name || null,
        mustChange: false, active: true,
      })));
      const next = NextResponse.next({ request: { headers: forwarded } });
      // Keep any refreshed Supabase cookies from the earlier auth check.
      for (const cookie of response.cookies.getAll()) next.cookies.set(cookie);
      response = next;
    }
  }

  if (user && role === 'student' && !isLogin && !isChange && !isReset && !isJoin) {
    const gate = await supabase.rpc('individual_sign_in_gate');
    const body = gate.data && typeof gate.data === 'object' ? gate.data as { ok?: boolean } : null;
    if (!gate.error && body && body.ok === false) {
      await supabase.auth.signOut();
      const next = request.nextUrl.clone();
      next.pathname = '/login';
      next.search = '?as=individual&error=licence';
      return NextResponse.redirect(next);
    }
  }

  if (user && isLogin) {
    const dest = request.nextUrl.clone();
    dest.pathname = '/';
    dest.search = '';
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
