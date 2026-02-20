import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Blog from '@/models/Blog';

export async function GET() {
    try {
        await dbConnect();
        const posts = await Blog.find({}).sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { title, category, excerpt, content, image, author } = body;

        const newPost = await Blog.create({
            title,
            category,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            excerpt,
            content,
            image,
            author
        });

        return NextResponse.json(newPost);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
