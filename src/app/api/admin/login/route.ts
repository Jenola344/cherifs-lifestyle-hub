import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

/**
 * Admin Login Route
 * 
 * POST /api/admin/login — validates password against ADMIN_PASSWORD env var only.
 *   No hardcoded fallbacks. No legacy emails. No plain-text credentials in source.
 *
 * The GET handler that used to expose WhatsApp/site config publicly has been removed.
 * Use NEXT_PUBLIC_WHATSAPP_NUMBER env var directly in client components instead.
 */
export async function POST(request: Request) {
    // Rate limit: 10 attempts per IP per 15 minutes
    const ip = getClientIp(request);
    if (!rateLimit(ip, 10, 15 * 60_000)) {
        return NextResponse.json(
            { success: false, message: 'Too many login attempts. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();
        const { password } = body;

        // Basic input guard
        if (!password || typeof password !== 'string' || password.length > 200) {
            return NextResponse.json({ success: false, message: 'Invalid input' }, { status: 400 });
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            logger.error('[Admin Login] ADMIN_PASSWORD environment variable is not set.');
            return NextResponse.json({ success: false, message: 'Server misconfigured' }, { status: 500 });
        }

        if (password === adminPassword) {
            // Set a secure, HTTP-only cookie indicating this user passed the Access Code hurdle
            const response = NextResponse.json({ success: true, message: 'Authenticated' });
            response.cookies.set({
                name: 'cherif_admin_access',
                value: adminPassword, // Store the valid password in the cookie for verification
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });
            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
