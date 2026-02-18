import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const notifications = await readData('notifications.json');

    // Filter for specific user or broadcast messages
    const filtered = notifications.filter((n: any) => n.userId === 'all' || n.userId === userId);

    // Sort by newest first
    return NextResponse.json(filtered.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
}

export async function POST(request: Request) {
    const body = await request.json();
    const { userId, type, title, message, link } = body;

    const notifications = await readData('notifications.json');

    const newNotification = {
        id: uuidv4(),
        userId: userId || 'all',
        type: type || 'general',
        title,
        message,
        link: link || '',
        readBy: [], // Track which users have read it if it's 'all'
        createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    await writeData('notifications.json', notifications);

    return NextResponse.json(newNotification);
}

// For marking as read
export async function PUT(request: Request) {
    const body = await request.json();
    const { notificationId, userId } = body;

    const notifications = await readData('notifications.json');
    const index = notifications.findIndex((n: any) => n.id === notificationId);

    if (index !== -1) {
        if (!notifications[index].readBy) notifications[index].readBy = [];
        if (!notifications[index].readBy.includes(userId)) {
            notifications[index].readBy.push(userId);
        }
        await writeData('notifications.json', notifications);
        return NextResponse.json(notifications[index]);
    }

    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
}
