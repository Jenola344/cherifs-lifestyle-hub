import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';

export async function GET() {
    const orders = await readData('orders.json');
    return NextResponse.json(orders);
}

export async function POST(request: Request) {
    const body = await request.json();
    const orders = await readData('orders.json');

    const newOrder = {
        id: uuidv4(),
        ...body,
        status: 'Pending',
        createdAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await writeData('orders.json', orders);

    return NextResponse.json(newOrder);
}

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, status } = body;

    const orders = await readData('orders.json');
    const index = orders.findIndex((o: any) => o.id === id);

    if (index !== -1) {
        const oldStatus = orders[index].status;
        orders[index].status = status;
        await writeData('orders.json', orders);

        // Notify User about Status Change
        try {
            const userRes = await fetch(`${request.url.split('/api')[0]}/api/users`);
            const users = await userRes.json();
            const user = users.find((u: any) => u.email === orders[index].userEmail);

            if (user) {
                await fetch(`${request.url.split('/api')[0]}/api/notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        type: 'order_status',
                        title: status === 'Completed' ? 'Acquisition Approved' : 'Acquisition Update',
                        message: status === 'Completed'
                            ? `Your acquisition for ${orders[index].items.length} items has been approved.`
                            : `Your order status has been updated to: ${status}`,
                        link: '/profile'
                    })
                });
            }
        } catch (e) { console.error('Notify Order Error', e); }

        return NextResponse.json(orders[index]);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
}
