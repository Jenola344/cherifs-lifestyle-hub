import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60);

        // Define transporter INSIDE the function to ensure environment variables are loaded
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Let nodemailer handle the host/port/secure for Gmail
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        // 1. Try sending the email BEFORE creating the user
        try {
            const baseUrl = process.env.NEXT_URL || process.env.NEXTAUTH_URL || 'https://cherififestyle.onrender.com';
            const verifyURL = `${baseUrl}/auth/verify-email?token=${verificationToken}`;

            await transporter.sendMail({
                from: `"CherifLifestyle" <${process.env.EMAIL_SERVER_USER}>`,
                to: email,
                subject: "Verify your email - CherifLifestyle",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
                        <h2 style="color: #333;">Welcome!</h2>
                        <p>Click the button below to verify your email address.</p>
                        <a href="${verifyURL}"
                           style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                          Verify Email
                        </a>
                        <p style="margin-top: 20px;">This link expires in 1 hour.</p>
                    </div>
                `,
            });

            logger.info(`Verification email sent to ${email}`);
        } catch (mailError: any) {
            logger.error('[Register] Email failed', mailError);
            // RELAY THE ERROR TO THE USER FOR DEBUGGING
            return NextResponse.json({ 
                error: `Email failed to send. Error: ${mailError.message}. Please check your App Password or Gmail Security.` 
            }, { status: 500 });
        }

        // 2. Only if email succeeded, create the user
        await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false
        });

        return NextResponse.json({ message: 'User registered. Please check your email.' });
    } catch (error: any) {
        logger.error('Registration error:', error);
        return NextResponse.json({ error: 'Registration failed overall' }, { status: 500 });
    }
}