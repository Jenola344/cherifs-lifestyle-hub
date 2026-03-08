import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';

export async function GET() {
    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();

        // Map _id to id
        const formattedOrders = orders.map((o: any) => ({
            ...o,
            id: o._id.toString()
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();

        const newOrder = await Order.create({
            ...body,
            status: 'Pending'
        });

        const responseObj = {
            ...newOrder.toObject(),
            id: newOrder._id.toString()
        };

        return NextResponse.json(responseObj);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to compile order' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { id, status } = body;

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Notify User about Status Change
        try {
            const Notification = (await import('@/models/Notification')).default;
            await Notification.create({
                userId: updatedOrder.userEmail || updatedOrder.userId,
                type: 'order_status',
                title: status === 'Completed' ? 'Acquisition Approved' : 'Acquisition Update',
                message: status === 'Completed'
                    ? `Your acquisition for ${updatedOrder.items.length} items has been approved.`
                    : `Your order status has been updated to: ${status}`,
                link: '/profile'
            });
        } catch (e) { console.error('Notify Order Error', e); }

        return NextResponse.json({ ...updatedOrder.toObject(), id: updatedOrder._id.toString() });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
