import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    // During build time on Render/Vercel, we don't want to crash the build.
    // Instead of Promise.reject, we provide a promise that only throws when someone tries to use it.
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ MONGODB_URI is missing. Build will continue, but database features will fail at runtime.');
    }

    // This prevents the unhandled rejection crash during build module evaluation
    clientPromise = new Promise((_, reject) => {
        // We delay the rejection so it doesn't happen synchronously during build time
        if (typeof window === 'undefined') {
            // Only throw if actually invoked in a runtime context
        }
    });
} else {
    if (process.env.NODE_ENV === "development") {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
}

export default clientPromise;
