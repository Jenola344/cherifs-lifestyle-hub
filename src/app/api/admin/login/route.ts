import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { password } = body;

        const adminPassword = process.env.ADMIN_PASSWORD;

        if (password && password === adminPassword) {
            // In a real production app, you would set a secure HTTP-only cookie session here
            return NextResponse.json({ success: true, message: 'Authenticated' });
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    // Provide non-sensitive configuration to the client
    return NextResponse.json({
        whatsappNumber: process.env.WHATSAPP_NUMBER,
        siteName: process.env.SITE_NAME || "Cherif's Lifestyle Hub"
    });
}
