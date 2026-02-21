import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Blog from '@/models/Blog';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
    try {
        await dbConnect();
        const posts = await Blog.find({}).sort({ createdAt: -1 });
        // Map _id to id for frontend consistency
        const formattedPosts = posts.map(post => ({
            ...post._doc,
            id: post._id.toString()
        }));
        return NextResponse.json(formattedPosts);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const excerpt = formData.get('excerpt') as string;
        const content = formData.get('content') as string;
        const author = formData.get('author') as string;
        const imageFile = formData.get('image') as File;

        let imageUrl = '';
        if (imageFile) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const uploadRes = await uploadToCloudinary(base64Image, 'journal');
            imageUrl = uploadRes.secure_url;
        }

        const newPost = await Blog.create({
            title,
            category,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            excerpt,
            content,
            image: imageUrl,
            author: author || "Cherif's Editorial"
        });

        return NextResponse.json({ ...newPost._doc, id: newPost._id.toString() });
    } catch (error) {
        console.error('Blog creation error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const formData = await request.formData();
        const id = formData.get('id') as string;

        const updateData: any = {};
        const fields = ['title', 'category', 'excerpt', 'content', 'author'];
        fields.forEach(field => {
            const val = formData.get(field);
            if (val) updateData[field] = val;
        });

        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 0) {
            const buffer = Buffer.from(await imageFile.arrayBuffer());
            const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;
            const uploadRes = await uploadToCloudinary(base64Image, 'journal');
            updateData.image = uploadRes.secure_url;
        }

        const updatedPost = await Blog.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json({ ...updatedPost._doc, id: updatedPost._id.toString() });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await Blog.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
