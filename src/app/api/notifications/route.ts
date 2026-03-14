import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';
import { requireAdmin, requireAuth } from '@/lib/auth-helpers';

/**
 * GET /api/notifications — Requires auth. Returns notifications for the current user.
 * Users only see their own notifications + global ("all") broadcasts.
 */
export async function GET(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        // Always use session userId — don't trust the query param for scoping
        const userId = (session!.user as any).id || searchParams.get('userId') || 'all';

        const notifications = await Notification.find({
            $or: [{ userId: 'all' }, { userId }]
        }).sort({ createdAt: -1 }).lean();

        const formatted = notifications.map((n: any) => ({
            ...n,
            id: n._id.toString()
        }));

        return NextResponse.json(formatted);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

/**
 * POST /api/notifications — Admin only. Creates a new notification broadcast.
 */
export async function POST(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const body = await request.json();
        const notification = await Notification.create(body);
        return NextResponse.json(notification);
    } catch {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

/**
 * PUT /api/notifications — Requires auth. Marks a notification as read.
 */
export async function PUT(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const { notificationId } = await request.json();

        if (!notificationId) {
            return NextResponse.json({ error: 'Missing notificationId' }, { status: 400 });
        }

        // Always use session userId — never trust client-submitted userId
        const userId = (session!.user as any).id;

        const notification = await Notification.findById(notificationId);
        if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

        if (!notification.readBy) notification.readBy = [];
        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            notification.isRead = true;
            await notification.save();
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
