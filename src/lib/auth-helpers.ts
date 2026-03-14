import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

type AuthSuccess = { error: null; session: Session };
type AuthFailure = { error: NextResponse; session: null };
type AuthResult = AuthSuccess | AuthFailure;

/**
 * requireAuth — ensures the caller has an active NextAuth session.
 * Use this on routes that require any logged-in user.
 */
export async function requireAuth(): Promise<AuthResult> {
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
 * Use this on all admin-only routes (user list, order management, art CRUD, etc.).
 */
export async function requireAdmin(): Promise<AuthResult> {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return {
            error: NextResponse.json({ error: 'Unauthorized — please sign in' }, { status: 401 }),
            session: null,
        };
    }
    if ((session.user as any).role !== 'admin') {
        return {
            error: NextResponse.json({ error: 'Forbidden — admin access required' }, { status: 403 }),
            session: null,
        };
    }
    return { error: null, session };
}
