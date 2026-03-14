import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    // Rate limit: 3 password reset requests per IP per 15 minutes
    const ip = getClientIp(request);
    if (!rateLimit(ip, 3, 15 * 60_000)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }
 
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        // Don't reveal if user exists to prevent email enumeration
        if (!user) {
            return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
        }

        // Generate token and expiry (1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        const urlObj = new URL(request.url);
        const appUrl = process.env.NEXTAUTH_URL || urlObj.origin;
        const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${email}`;

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Reset your password - Cherif\'s Hub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>You requested to reset your password. Click the button below to set a new password. This link is valid for 1 hour.</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        });

        return NextResponse.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error: any) {
        logger.error('Forgot password error', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
