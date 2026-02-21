import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Notification from '@/models/Notification';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 'all';

        const notifications = await Notification.find({
            $or: [{ userId: 'all' }, { userId: userId }]
        }).sort({ createdAt: -1 }).lean();

        // Map _id to id
        const formatted = notifications.map((n: any) => ({
            ...n,
            id: n._id.toString()
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const notification = await Notification.create(body);
        return NextResponse.json(notification);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const { notificationId, userId } = await request.json();

        if (!notificationId || !userId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const notification = await Notification.findById(notificationId);
        if (!notification) return NextResponse.json({ error: 'Notification not found' }, { status: 404 });

        if (!notification.readBy) notification.readBy = [];

        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            notification.isRead = true; // For legacy support
            await notification.save();
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
