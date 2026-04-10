import { getServerSession, Session } from 'next-auth';
import { authOptions } from './auth';
import { NextResponse } from 'next/server';

import { cookies } from 'next/headers';

type AuthSuccessStrict = { error: null; session: Session };
type AuthSuccessLax = { error: null; session: Session | null };
type AuthFailure = { error: NextResponse; session: null };

type AuthResultStrict = AuthSuccessStrict | AuthFailure;
type AuthResultLax = AuthSuccessLax | AuthFailure;

/**
 * requireAuth — ensures the caller has an active NextAuth session.
 * Use this on routes that require any logged-in user.
 */
export async function requireAuth(): Promise<AuthResultStrict> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return {
            error: NextResponse.json({ error: 'Unauthorized — please sign in' }, { status: 401 }),
            session: null,
        };
    }
    return { error: null, session };
}

/**
 * requireAdmin — ensures the caller is authenticated AND has role === 'admin'.
 * Can authenticate via NextAuth session or the fallback Access Code cookie.
 * Use this on all admin-only routes (user list, order management, art CRUD, etc.).
 */
export async function requireAdmin(): Promise<AuthResultLax> {
    // 1. Check fallback Access Code cookie
    const cookieStore = await cookies();
    const fallbackAccessCookie = cookieStore.get('cherif_admin_access');
    const isValidFallback = fallbackAccessCookie && fallbackAccessCookie.value === process.env.ADMIN_PASSWORD;

    // 2. Check NextAuth session
    const session = await getServerSession(authOptions);
    const isValidSession = session && session.user && (session.user as any).role === 'admin';

    if (!isValidFallback && !isValidSession) {
        return {
            error: NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 }),
            session: null,
        };
    }

    return { error: null, session: session || null };
}
