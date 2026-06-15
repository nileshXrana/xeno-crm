import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Cached connection interface for global reuse
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend NodeJS global to cache mongoose connection across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Reuses an existing connection if available (important for Next.js hot reloading).
 */
async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("[DB] Reusing existing MongoDB connection.");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[DB] Creating new MongoDB connection...");
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log("[DB] MongoDB connected successfully.");
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
