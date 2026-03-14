import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Review from '@/models/Review';
import { requireAuth } from '@/lib/auth-helpers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const CreateReviewSchema = z.object({
    artId: z.string().min(1, 'artId is required').max(100),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(''),
});

/**
 * GET /api/reviews — Public.
 * Optionally filter by ?artId=xxx
 */
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const artId = searchParams.get('artId');

        const query = artId ? { artId } : {};
        const reviews = await Review.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json(
            reviews.map((r: any) => ({ ...r, id: r._id.toString() }))
        );
    } catch {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

/**
 * POST /api/reviews — Requires auth.
 * Rate limited to 5 reviews per IP per minute.
 * Prevents duplicate reviews per (artId, userEmail) — enforced by DB index.
 */
export async function POST(request: Request) {
    // Rate limit first — before any DB work
    const ip = getClientIp(request);
    if (!rateLimit(ip, 5, 60_000)) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment before submitting again.' },
            { status: 429 }
        );
    }

    const { error, session } = await requireAuth();
    if (error) return error;

    try {
        await dbConnect();

        const body = await request.json();
        const parsed = CreateReviewSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { artId, rating, comment } = parsed.data;
        const userEmail = session.user?.email ?? '';
        const userName = session.user?.name ?? 'Anonymous';

        // DB-level unique index will reject duplicate — catch it gracefully
        const review = await Review.create({ artId, userName, userEmail, rating, comment });

        return NextResponse.json({ ...review.toObject(), id: review._id.toString() }, { status: 201 });
    } catch (err: any) {
        // MongoDB duplicate key error code
        if (err?.code === 11000) {
            return NextResponse.json(
                { error: 'You have already submitted a review for this artwork.' },
                { status: 409 }
            );
        }
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
