import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    // Rate limit: 5 password reset attempts per IP per 15 minutes
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5, 15 * 60_000)) {
        return NextResponse.json(
            { error: 'Too many reset attempts. Please try again later.' },
            { status: 429 }
        );
    }
 
    try {
        await dbConnect();
        const { email, token, newPassword } = await request.json();

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const user = await User.findOne({
            email,
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update user
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        // if user had unverified account, maybe verified them? Let's verify them so they aren't stuck
        user.isVerified = true;

        await user.save();

        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error: any) {
        logger.error('Reset password error', error);
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }
}
