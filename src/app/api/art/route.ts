import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Art from '@/models/Art';

export async function GET() {
    try {
        await dbConnect();
        const art = await Art.find({}).sort({ createdAt: -1 });
        return NextResponse.json(art);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch art' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
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
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            const result: any = await uploadToCloudinary(base64Image, 'art-collection');
            imageUrl = result.secure_url;
        } else {
            imageUrl = formData.get('imageUrl') as string || '';
        }

        const newItem = await Art.create({
            title,
            artist,
            price: Number(price),
            category,
            description,
            sizes: sizes ? sizes.split(',').map(s => s.trim()) : [],
            image: imageUrl,
            status
        });

        // Trigger Notification
        try {
            const Notification = (await import('@/models/Notification')).default;
            await Notification.create({
                userId: 'all',
                type: 'new_art',
                title: 'New Masterpiece Acquired',
                message: `"${title}" by ${artist} has just been added to the collection.`,
                link: '/shop'
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
        await dbConnect();
        const formData = await request.formData();
        const id = formData.get('id') as string;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const sizes = formData.get('sizes') as string;
        const status = formData.get('status') as string;
        const imageFile = formData.get('image') as File | null;

        const updateData: any = {};
        if (title) updateData.title = title;
        if (artist) updateData.artist = artist;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (description) updateData.description = description;
        if (sizes) updateData.sizes = sizes.split(',').map(s => s.trim());
        if (status) updateData.status = status;

        if (imageFile && typeof imageFile !== 'string') {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

            const { uploadToCloudinary } = await import('@/lib/cloudinary');
            const result: any = await uploadToCloudinary(base64Image, 'art-collection');
            updateData.image = result.secure_url;
        }

        const updatedItem = await Art.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) return NextResponse.json({ error: 'Art not found' }, { status: 404 });

        return NextResponse.json(updatedItem);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update art' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Art.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete art' }, { status: 500 });
    }
}
