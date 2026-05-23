import { MongoClient, type Db } from "mongodb";

declare global {
    var __mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const clientPromise = uri ? globalThis.__mongoClientPromise ?? new MongoClient(uri).connect() : undefined;

if (process.env.NODE_ENV !== "production" && clientPromise) {
    globalThis.__mongoClientPromise = clientPromise;
}

export async function getDatabase(): Promise<Db> {
    if (!uri) {
        throw new Error("MONGODB_URI is not configured");
    }

    if (!dbName) {
        throw new Error("MONGODB_DB is not configured");
    }

    if (!clientPromise) {
        throw new Error("MongoDB client could not be initialized");
    }

    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
}