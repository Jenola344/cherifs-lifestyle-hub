import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth-helpers';

/**
 * GET /api/orders/mine — Requires auth.
 * Returns only the orders belonging to the currently logged-in user.
 * Users cannot see each other's orders.
 */
export async function GET() {
    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();
        const userEmail = session.user?.email;

        const orders = await Order.find({ userEmail })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(
            orders.map((o: any) => ({ ...o, id: o._id.toString() }))
        );
    } catch {
        return NextResponse.json({ error: 'Failed to fetch your orders' }, { status: 500 });
    }
}
