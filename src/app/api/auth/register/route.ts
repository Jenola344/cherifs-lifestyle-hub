import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Resend } from 'resend';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    // Rate limit: 5 registration attempts per IP per 10 minutes
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5, 10 * 60_000)) {
        return NextResponse.json(
            { error: 'Too many registration attempts. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        await dbConnect();
        const { name, fullName, email, password } = await request.json();
        const userName = fullName || name;

        if (!userName || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Basic input length guards before hitting the DB
        if (userName.length > 100 || email.length > 200 || password.length > 200) {
            return NextResponse.json({ error: 'Input too long' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        // Create user first so we don't orphan the record if email fails
        await User.create({
            name: userName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false
        });

        // Send Verification Email via Resend (HTTP API — works on Render)
        try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const verifyURL = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

            const { error: sendError } = await resend.emails.send({
                from: process.env.EMAIL_FROM || "Cherif's Lifestyle Hub <noreply@yourdomain.com>",
                to: email,
                subject: "Verify your email – Cherif's Lifestyle Hub",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #333;">Welcome, ${userName}!</h2>
                        <p>Click the button below to verify your email address.</p>
                        <a href="${verifyURL}"
                           style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                          Verify Email
                        </a>
                        <p style="margin-top: 20px;">This link expires in <strong>1 hour</strong>.</p>
                        <p style="font-size: 12px; color: #666;">If you didn't create this account, ignore this email.</p>
                    </div>
                `,
            });

            if (sendError) {
                // Log internally — never expose Resend error details to the client
                logger.error('[Register] Resend email error', sendError);
                return NextResponse.json({
                    message: 'Account created successfully.',
                    warning: 'We could not send the verification email right now. Please use "Resend Verification" on the login page.'
                });
            }

            logger.info(`Verification email sent to ${email}`);
        } catch (mailError) {
            logger.error('[Register] Verification email failed to send', mailError);
            return NextResponse.json({
                message: 'Account created successfully.',
                warning: 'We could not send the verification email right now. Please use "Resend Verification" on the login page.'
            });
        }

        return NextResponse.json({ message: 'User registered. Please check your email for verification.' });
    } catch (error: any) {
        logger.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}