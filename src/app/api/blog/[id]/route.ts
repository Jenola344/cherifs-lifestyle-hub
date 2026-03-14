import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Blog from '@/models/Blog';

/**
 * GET /api/blog/[id] — Public. Fetches a single blog post by its MongoDB _id.
 * This avoids fetching ALL posts just to render one, which was the old approach.
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const post = await Blog.findById(id).lean() as any;

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ ...post, id: post._id.toString() });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}
