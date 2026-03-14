import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import Art from '@/models/Art';
import { requireAdmin, requireAuth } from '@/lib/auth-helpers';
import { z } from 'zod';
import { logger } from '@/lib/logger';

/**
 * Zod schema — validated before any DB interaction
 */
const OrderItemSchema = z.object({
    artId: z.string().min(1).max(100),
    title: z.string().max(200).optional().default(''),
    image: z.string().max(500).optional().default(''),
    size: z.string().max(50).optional().default(''),
    frame: z.string().max(50).optional().default(''),
    quantity: z.number().int().min(1).max(50),
    // price field is intentionally NOT trusted from client — server recalculates
    price: z.number().optional(),
});

const CreateOrderSchema = z.object({
    items: z.array(OrderItemSchema).min(1, 'At least one item required').max(50),
    customerName: z.string().max(200).optional(),
    platform: z.string().max(50).optional(),
    shippingAddress: z.object({
        name: z.string().min(1).max(200),
        address: z.string().min(1).max(500),
        city: z.string().min(1).max(100),
        phone: z.string().min(1).max(30),
    }),
});

/**
 * GET /api/orders — Admin only. Returns all orders sorted newest first.
 */
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

/**
 * POST /api/orders — Requires auth. Creates a new order.
 *
 * SECURITY: totalPrice is recalculated server-side from actual Art DB records.
 * The client-submitted price is discarded. This prevents price tampering.
 */
export async function POST(request: Request) {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const body = await request.json();

        // Validate shape before touching the DB
        const parsed = CreateOrderSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid order data', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { items, shippingAddress, customerName, platform } = parsed.data;

        // Server-side price recalculation — never trust the client's totalPrice
        const artIds = items
            .map((i: any) => i.artId)
            .filter((id: any) => typeof id === 'string' && id.length > 0);

        const artRecords = await Art.find({ _id: { $in: artIds } }).lean();

        let serverTotal = 0;
        for (const item of items) {
            const record = artRecords.find((a: any) => a._id.toString() === item.artId);
            if (!record) {
                return NextResponse.json(
                    { error: `Art item not found: ${item.artId}` },
                    { status: 400 }
                );
            }
            serverTotal += (record as any).price * Math.max(1, item.quantity || 1);
        }

        const userEmail = session!.user?.email;
        const userId = (session!.user as any).id;

        const newOrder = await Order.create({
            userId,
            customerName: customerName || session!.user?.name || 'Guest',
            userEmail,
            platform: platform || 'web',
            items,
            totalPrice: serverTotal,   // ← server-calculated, not client-submitted
            shippingAddress,
            status: 'Pending'
        });

        return NextResponse.json({
            ...newOrder.toObject(),
            id: newOrder._id.toString()
        });
    } catch (error) {
        logger.error('Failed to create order', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

/**
 * PUT /api/orders — Admin only. Updates order status.
 */
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

        // Notify user about status change
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
            // Notification failure is non-critical — log but don't fail the request
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
