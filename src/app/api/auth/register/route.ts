import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { name, fullName, email, password } = await request.json();
        const userName = fullName || name;

        if (!userName || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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

        // Create user
        const user = await User.create({
            name: userName,
            email,
            password: hashedPassword,
            verificationToken,
            verificationTokenExpiry,
            isVerified: false
        });

        // Send Verification Email
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });

            const verifyURL = `https://cherifs-lifestyle-hub.onrender.com/auth/verify-email?token=${verificationToken}`;

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: email,
                subject: 'Verify your email',
                html: `<p>Hi ${userName},</p>
                       <p>Click the link below to verify your email. It expires in 1 hour.</p>
                       <a href="${verifyURL}">Verify Email</a>`
            });
        } catch (mailError) {
            console.error('Mail sending failed:', mailError);
            // We still return 200/success because the user WAS created in the DB.
            // But we warn them that the email might not have arrived.
            return NextResponse.json({
                message: 'User registered, but verification email could not be sent. Please contact support or try logging in.',
                warning: 'Mail delivery error'
            });
        }

        return NextResponse.json({ message: 'User registered. Please check your email for verification.' });
    } catch (error: any) {
        console.error('Registration error details:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
