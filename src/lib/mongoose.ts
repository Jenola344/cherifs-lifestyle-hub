import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!MONGODB_URI) {
        // If we're on the server during a build, don't throw.
        // This allows the build to complete even if DB secrets are missing.
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ Skipping DB connection: MONGODB_URI is not defined.');
            return null;
        }
        throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
            return m;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
