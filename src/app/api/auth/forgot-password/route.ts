import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
    const ip = getClientIp(request);
    if (!rateLimit(ip, 3, 15 * 60_000)) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000;

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        const appUrl = process.env.NEXTAUTH_URL || new URL(request.url).origin;
        const resetUrl = `${appUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        try {
            await transporter.sendMail({
                from: `"CherifLifestyle" <${process.env.EMAIL_SERVER_USER}>`,
                to: email,
                subject: "Reset your password - CherifLifestyle",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
                        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, please ignore this email.</p>
                    </div>
                `,
            });
        } catch (sendError: any) {
            logger.error('[ForgotPassword] Email error', sendError);
            // We return generic message to client for security, but log the error
        }

        return NextResponse.json({
            message: 'If an account with that email exists, a password reset link has been sent.'
        });
    } catch (error: any) {
        logger.error('Forgot password error', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}