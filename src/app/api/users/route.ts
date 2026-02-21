import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { APP_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { action, email, password, userId, favoriteId } = body;

        if (action === 'toggle-favorite') {
            const user = await User.findById(userId);
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            if (!user.favorites) user.favorites = [];

            const index = user.favorites.indexOf(favoriteId);
            if (index === -1) {
                user.favorites.push(favoriteId);
            } else {
                user.favorites.splice(index, 1);
            }

            await user.save();
            return NextResponse.json(user);
        }

        // Login handled by NextAuth generally, but keep this for backward compatibility if needed
        if (action === 'login') {
            const user = await User.findOne({ email });
            // Fallback for admin access
            if (!user && email === APP_CONFIG.adminFallback.email && password === APP_CONFIG.adminFallback.password) {
                return NextResponse.json({
                    id: 'admin',
                    name: 'Hub Director',
                    email: APP_CONFIG.adminFallback.email,
                    role: 'admin'
                });
            }
        }

        return NextResponse.json({ error: 'Action not supported via this route' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await dbConnect();
        const users = await User.find({}, '-password');
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
