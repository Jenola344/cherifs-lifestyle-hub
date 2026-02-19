import { NextResponse } from 'next/server';
import { APP_CONFIG, getEnv } from '@/lib/config';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password, email } = body;

        const adminPassword = getEnv('ADMIN_PASSWORD', APP_CONFIG.adminFallback.password);

        // Match against official admin or fallback config
        const isOfficialAdmin = (password === adminPassword);
        const isUserFallback = (email === 'jesutolaolusegun@gmail.com' && password === 'admin123');

        if (isOfficialAdmin || isUserFallback) {
            return NextResponse.json({ success: true, message: 'Authenticated' });
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        whatsappNumber: getEnv('WHATSAPP_NUMBER', APP_CONFIG.whatsappNumber),
        siteName: getEnv('SITE_NAME', APP_CONFIG.siteName)
    });
}
