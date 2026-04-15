import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5, 10 * 60_000)) {
        return NextResponse.json({ error: 'Too many registration attempts.' }, { status: 429 });
    }

    try {
        await dbConnect();
        const { name, email, password } = await request.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        // TEMPORARILY DISABLED VERIFICATION: Setting isVerified to true by default
        await User.create({
            name,
            email,
            password: hashedPassword,
            isVerified: true, // Auto-verify members for now
            verificationToken: null,
            verificationTokenExpiry: null
        });

        logger.info(`New user registered and auto-verified: ${email}`);
        return NextResponse.json({ message: 'Registration successful! You can now sign in.' });
    } catch (error: any) {
        logger.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}