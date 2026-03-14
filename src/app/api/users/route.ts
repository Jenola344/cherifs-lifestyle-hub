import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { requireAdmin, requireAuth } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';

/**
 * GET /api/users — Admin only. Returns all users (passwords excluded).
 */
export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const users = await User.find({}, '-password -verificationToken -resetToken');
        return NextResponse.json(users);
    } catch (error) {
        logger.error('Failed to fetch users', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

/**
 * POST /api/users — Requires auth. Supports toggle-favorite action.
 * The old plain-text admin login path has been removed — use NextAuth instead.
 */
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const body = await request.json();
        const { action, favoriteId } = body;

        if (action === 'toggle-favorite') {
            // Users can only modify their own favorites
            const userId = (session.user as any).id;
            if (!userId) {
                return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
            }

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
            return NextResponse.json({ favorites: user.favorites });
        }

        return NextResponse.json({ error: 'Action not supported' }, { status: 400 });
    } catch (error) {
        logger.error('User API error', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
