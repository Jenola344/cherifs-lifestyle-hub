import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

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

        // Send Verification Email
        try {
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const verifyURL = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
                port: Number(process.env.EMAIL_SERVER_PORT) || 465,
                secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for others
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });
            
            const info = await transporter.sendMail({
                from: process.env.EMAIL_FROM || `"Cherif's Lifestyle Hub" <${process.env.EMAIL_SERVER_USER}>`,
                to: email,
                subject: 'Verify your email – Cherif\'s Lifestyle Hub',
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
                `
            });
            logger.info(`Verification email sent: ${info.messageId}`);
        } catch (mailError) {
            console.log("mailError: ", mailError);
            // Log internally only — never expose SMTP error details to the client.
            logger.error('[Register] Verification email failed to send', mailError);
            // User was created successfully in DB. Warn them without leaking internals.
            return NextResponse.json({
                message: 'Account created successfully.',
                warning: 'We could not send the verification email right now. Please use "Resend Verification" on the login page.'
            });
        }

        // Create user
        const user = await User.create({
            name: userName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false
        });

        return NextResponse.json({ message: 'User registered. Please check your email for verification.' });
    } catch (error: any) {
        console.log("registration error: ", error);
        logger.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }
}
