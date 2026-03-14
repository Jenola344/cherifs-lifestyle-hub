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
            const verifyURL = `https://cherifs-lifestyle-hub.onrender.com/auth/verify-email?token=${verificationToken}`;

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                port: 587,
                host: 'smtp.gmail.com',
                secure: false,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            });

            const info = await transporter.sendMail({
                from: `"Cherif's Lifestyle Hub" <${process.env.EMAIL_SERVER_USER}>`,
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
            console.log('Verification email sent:', info.messageId);
        } catch (mailError) {
            console.error('Mail sending failed:', mailError);
            // We still return 200/success because the user WAS created in the DB.
            // But we warn them that the email might not have arrived.
            return NextResponse.json({
                message: mailError,
                warning: 'User registered but failed to send verification email'
            });
        }

        return NextResponse.json({ message: 'User registered. Please check your email for verification.' });
    } catch (error: any) {
        console.error('Registration error details:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
