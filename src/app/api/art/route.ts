import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';
import { artCollection } from '@/lib/data';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
    let art = await readData('art.json');
    if (art.length === 0) {
        art = artCollection; // Use static fallback if empty
    }
    return NextResponse.json(art);
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const sizes = formData.get('sizes') as string;
        const status = formData.get('status') as string || 'available';
        const imageFile = formData.get('image') as File | null;

        let imageUrl = '';

        if (imageFile && typeof imageFile !== 'string') {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sanitize filename
            const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${safeName}`;

            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);
            imageUrl = `/uploads/${fileName}`;
        } else {
            imageUrl = formData.get('imageUrl') as string || '';
        }

        const art = await readData('art.json');
        const newItem = {
            id: uuidv4(),
            title,
            artist,
            price: Number(price),
            category,
            description,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            image: imageUrl,
            status // 'available' or 'sold out'
        };

        art.push(newItem);
        await writeData('art.json', art);

        // Notify Everyone about New Art
        try {
            await fetch(`${request.url.split('/api')[0]}/api/notifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'all',
                    type: 'new_art',
                    title: 'New Masterpiece Acquired',
                    message: `"${title}" by ${artist} has just been added to the collection.`,
                    link: '/shop'
                })
            });
        } catch (e) { console.error('Notify error', e); }

        return NextResponse.json(newItem);
    } catch (error) {
        console.error('Error saving art:', error);
        return NextResponse.json({ error: 'Failed to save art' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const formData = await request.formData();
        const id = formData.get('id') as string;

        const art = await readData('art.json');
        const index = art.findIndex((item: any) => item.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Art not found' }, { status: 404 });
        }

        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const sizes = formData.get('sizes') as string;
        const status = formData.get('status') as string;
        const imageFile = formData.get('image') as File | null;

        if (imageFile && typeof imageFile !== 'string') {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Sanitize filename
            const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}-${safeName}`;

            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);
            art[index].image = `/uploads/${fileName}`;
        }

        if (title) art[index].title = title;
        if (artist) art[index].artist = artist;
        if (price) art[index].price = Number(price);
        if (category) art[index].category = category;
        if (description) art[index].description = description;
        if (sizes) art[index].sizes = sizes.split(',').map(s => s.trim());
        if (status) art[index].status = status;

        await writeData('art.json', art);

        // Notify if Sold Out
        if (status === 'sold out') {
            try {
                await fetch(`${request.url.split('/api')[0]}/api/notifications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: 'all',
                        type: 'sold_out',
                        title: 'Collection Update',
                        message: `"${art[index].title}" is now officially sold out. Better luck with the next release!`,
                        link: '/shop'
                    })
                });
            } catch (e) { console.error('Notify error', e); }
        }

        return NextResponse.json(art[index]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update art' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const art = await readData('art.json');
    const filtered = art.filter((item: any) => item.id !== id);
    await writeData('art.json', filtered);

    return NextResponse.json({ success: true });
}
