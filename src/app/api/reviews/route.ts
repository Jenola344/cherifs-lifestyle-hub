import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const artId = searchParams.get('artId');

    const reviews = await readData('reviews.json');

    if (artId) {
        return NextResponse.json(reviews.filter((r: any) => r.artId === artId));
    }

    return NextResponse.json(reviews);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { artId, userName, rating, comment } = body;

    if (!artId || !userName || !rating) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const reviews = await readData('reviews.json');
    const newReview = {
        id: uuidv4(),
        artId,
        userName,
        rating: Number(rating),
        comment,
        createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    await writeData('reviews.json', reviews);

    return NextResponse.json(newReview);
}
