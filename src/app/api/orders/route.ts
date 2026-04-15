import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Art from '@/models/Art';
import { requireAdmin, requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Extremely flexible schema to ensure orders processed even if frontend/backend are slightly out of sync
const CreateOrderSchema = z.object({
    items: z.array(z.any()).min(1),
    customerName: z.string().optional(),
    platform: z.string().optional(),
    shippingAddress: z.any().optional().default({}),
}).passthrough();

export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
        const formattedOrders = orders.map((o) => ({
            ...o,
            id: (o as any)._id.toString()
        }));
        return NextResponse.json(formattedOrders);
    } catch (error) {
        logger.error('Failed to fetch orders', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const body = await request.json();

        const parsed = CreateOrderSchema.safeParse(body);
        if (!parsed.success) {
            logger.error('[Orders] Validation failed', parsed.error.format());
            return NextResponse.json(
                { error: 'Invalid order data', details: parsed.error.format() },
                { status: 400 }
            );
        }

        const { items, shippingAddress, customerName, platform } = parsed.data;

        // Extract Art IDs safely
        const artIds = items.map((i: any) => i.artId || i.id).filter(Boolean);
        const artRecords = await Art.find({ _id: { $in: artIds } }).lean();

        let serverTotal = 0;
        const validatedItems = items.map((item: any) => {
            const artId = item.artId || item.id;
            const record = artRecords.find((a: any) => a._id.toString() === artId);
            
            // Fallback to item price if record not found (prevents order failure)
            const price = record ? (record as any).price : (item.price || 0);
            const quantity = Math.max(1, item.quantity || 1);
            serverTotal += price * quantity;

            return {
                ...item,
                artId: artId,
                price: price,
                quantity: quantity
            };
        });

        const userId = (session!.user as any).id;
        const userEmail = session!.user?.email;

        const newOrder = await Order.create({
            userId,
            customerName: customerName || session!.user?.name || 'Guest',
            userEmail,
            platform: platform || 'web',
            items: validatedItems,
            totalPrice: serverTotal,
            shippingAddress: shippingAddress || {
                name: customerName || 'N/A',
                address: 'Consult WhatsApp',
                city: 'N/A',
                phone: 'N/A'
            },
            status: 'Pending'
        });

        return NextResponse.json({
            ...newOrder.toObject(),
            id: newOrder._id.toString()
        });
    } catch (error: any) {
        logger.error('Failed to create order', error);
        return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const { id, status } = await request.json();

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

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
        } catch (e) {
            logger.error('[Orders] Failed to create status notification', e);
        }

        return NextResponse.json({
            ...updatedOrder.toObject(),
            id: updatedOrder._id.toString()
        });
    } catch (error) {
        logger.error('Failed to update order', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}
