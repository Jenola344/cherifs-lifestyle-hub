import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Next.js Edge Middleware — runs before every request matching the config below.
 *
 * /admin/* routes require:
 *   1. An active NextAuth JWT session (withAuth enforces this)
 *   2. The session token must have role === 'admin'
 *
 * If either check fails the user is redirected to /auth with an error param.
 * This runs at the edge (before the page renders), so DevTools tricks cannot bypass it.
 *
 * To make your account an admin, set role: "admin" on your User document in MongoDB Atlas.
 */
export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // If accessing any admin route and not an admin, redirect to login
        if (pathname.startsWith('/admin') && token?.role !== 'admin') {
            const url = req.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('error', 'AccessDenied');
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // withAuth will call this first; returning false forces a redirect to signIn page
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    // Only run middleware on admin routes — keeps all other pages fast
    matcher: ['/admin/:path*'],
};
