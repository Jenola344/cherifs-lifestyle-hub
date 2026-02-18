import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readData, writeData } from '@/lib/db';

export async function POST(request: Request) {
    const body = await request.json();
    const { action, email, password, name, userId, favoriteId } = body;

    const users = await readData('users.json');

    if (action === 'register') {
        if (users.find((u: any) => u.email === email)) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser = {
            id: uuidv4(),
            name,
            email,
            password,
            favorites: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeData('users.json', users);

        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword);
    }

    if (action === 'login') {
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    }

    if (action === 'toggle-favorite') {
        const userIndex = users.findIndex((u: any) => u.id === userId);
        if (userIndex === -1) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const user = users[userIndex];
        if (!user.favorites) user.favorites = [];

        const favIndex = user.favorites.indexOf(favoriteId);
        if (favIndex === -1) {
            user.favorites.push(favoriteId);
        } else {
            user.favorites.splice(favIndex, 1);
        }

        await writeData('users.json', users);
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET() {
    const users = await readData('users.json');
    const safeUsers = users.map(({ password: _, ...u }: any) => u);
    return NextResponse.json(safeUsers);
}
