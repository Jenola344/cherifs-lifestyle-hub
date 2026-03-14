import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/auth?error=invalid_verification', request.url));
    }

    try {
        await dbConnect();
        
        // Find user with matching token and expiry date greater than now
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpiry: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.redirect(new URL('/auth?error=invalid_verification', request.url));
        }

        // Update user
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;
        await user.save();

        // Redirect to login with verified flag
        return NextResponse.redirect(new URL('/auth?verified=true', request.url));
    } catch (error) {
        logger.error('Email verification error', error);
        return NextResponse.redirect(new URL('/auth?error=server_error', request.url));
    }
}
