import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FeedbackModel from '@/models/Feedback';
import { requireAdmin } from '@/lib/auth-helpers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { z } from 'zod';

const CreateFeedbackSchema = z.object({
    userName: z.string().min(1, 'Name is required').max(100),
    email: z.string().email().max(200).optional().or(z.literal('')),
    rating: z.number().int().min(1).max(5),
    message: z.string().min(1, 'Message is required').max(3000),
});

/**
 * GET /api/feedback — Admin only.
 * Returns all submitted feedback from MongoDB.
 */
export async function GET() {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const feedback = await FeedbackModel.find({}).sort({ createdAt: -1 }).lean();
        return NextResponse.json(
            feedback.map((f: any) => ({ ...f, id: f._id.toString() }))
        );
    } catch {
        return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }
}

/**
 * POST /api/feedback — Public.
 * Rate limited to 3 submissions per IP per 5 minutes.
 * Validated with Zod. Persisted to MongoDB.
 */
export async function POST(request: Request) {
    // Rate limit — 3 feedback entries per IP per 5 minutes
    const ip = getClientIp(request);
    if (!rateLimit(ip, 3, 5 * 60_000)) {
        return NextResponse.json(
            { error: 'Too many submissions. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        await dbConnect();

        const body = await request.json();
        const parsed = CreateFeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const entry = await FeedbackModel.create(parsed.data);
        return NextResponse.json({ ...entry.toObject(), id: entry._id.toString() }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
