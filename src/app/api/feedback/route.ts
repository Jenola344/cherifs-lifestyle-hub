import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';

export async function GET() {
    const feedback = await readData('feedback.json');
    return NextResponse.json(feedback);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { userName, email, rating, message } = body;

    if (!userName || !rating || !message) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const feedback = await readData('feedback.json');
    const newFeedback = {
        id: uuidv4(),
        userName,
        email,
        rating: Number(rating),
        message,
        createdAt: new Date().toISOString()
    };

    feedback.push(newFeedback);
    await writeData('feedback.json', feedback);

    return NextResponse.json(newFeedback);
}
