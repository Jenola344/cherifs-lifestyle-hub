import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
        return NextResponse.redirect(new URL('/auth?error=invalid_verification', request.url));
    }

    try {
        await dbConnect();
        const user = await User.findOne({ email, verificationToken: token });

        if (!user) {
            return NextResponse.redirect(new URL('/auth?error=invalid_verification', request.url));
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        return NextResponse.redirect(new URL('/auth?success=verified', request.url));
    } catch (error) {
        return NextResponse.redirect(new URL('/auth?error=server_error', request.url));
    }
}
