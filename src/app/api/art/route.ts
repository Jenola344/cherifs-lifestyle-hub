import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Art from '@/models/Art';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { requireAdmin } from '@/lib/auth-helpers';
import { logger } from '@/lib/logger';

/**
 * GET /api/art — Public. Returns all artworks.
 */
export async function GET() {
    try {
        await dbConnect();
        const art = await Art.find({}).sort({ createdAt: -1 });
        return NextResponse.json(art);
    } catch (error) {
        logger.error('Failed to fetch art', error);
        return NextResponse.json({ error: 'Failed to fetch art' }, { status: 500 });
    }
}

/**
 * POST /api/art — Admin only. Adds a new artwork.
 */
export async function POST(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const artist = formData.get('artist') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const sizes = formData.get('sizes') as string;
        const status = (formData.get('status') as string) || 'available';
        const imageFile = formData.get('image') as File | null;

        if (!title || !artist || !price || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let imageUrl = '';
        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const result = await uploadToCloudinary(base64Image, 'art-collection');
            imageUrl = result.secure_url;
        } else {
            imageUrl = (formData.get('imageUrl') as string) || '';
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

        // Broadcast notification to all users
        try {
            const Notification = (await import('@/models/Notification')).default;
            await Notification.create({
                userId: 'all',
                type: 'new_art',
                title: 'New Masterpiece Acquired',
                message: `"${title}" by ${artist} has just been added to the collection.`,
                link: '/shop'
            });
        } catch (e) {
            logger.error('[Art POST] Notification failed', e);
        }

        return NextResponse.json(newItem);
    } catch (error) {
        logger.error('[Art POST] Error saving art', error);
        return NextResponse.json({ error: 'Failed to save art' }, { status: 500 });
    }
}

/**
 * PUT /api/art — Admin only. Updates an existing artwork.
 */
export async function PUT(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

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

        const updateData: Record<string, unknown> = {};
        if (title) updateData.title = title;
        if (artist) updateData.artist = artist;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (description) updateData.description = description;
        if (sizes) updateData.sizes = sizes.split(',').map(s => s.trim());
        if (status) updateData.status = status;

        if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
            const bytes = await imageFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const result = await uploadToCloudinary(base64Image, 'art-collection');
            updateData.image = result.secure_url;
        }

        const updatedItem = await Art.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedItem) return NextResponse.json({ error: 'Art not found' }, { status: 404 });

        return NextResponse.json(updatedItem);
    } catch (error) {
        logger.error('Failed to update art', error);
        return NextResponse.json({ error: 'Failed to update art' }, { status: 500 });
    }
}

/**
 * DELETE /api/art — Admin only. Removes an artwork by ID.
 */
export async function DELETE(request: Request) {
    const { error } = await requireAdmin();
    if (error) return error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Art.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        logger.error('Failed to delete art', error);
        return NextResponse.json({ error: 'Failed to delete art' }, { status: 500 });
    }
}
