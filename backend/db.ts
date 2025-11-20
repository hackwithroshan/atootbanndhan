
import mongoose from 'mongoose';
// dotenv config is now handled in index.ts to ensure correct path resolution
// import 'dotenv/config'; 

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = { conn: null, promise: null };
}

/**
 * A robust, serverless-friendly function to connect to MongoDB.
 */
const connectDB = async () => {
  // If a cached connection exists, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no connection promise in progress, create one.
  if (!cached.promise) {
    const mongoURI = process.env.MONGO_URI;
    
    // Gracefully handle missing MONGO_URI environment variable.
    if (!mongoURI) {
      const errorMsg = "MONGO_URI is not defined. Check your backend/.env file (Local) or Vercel Environment Variables (Production).";
      console.error("❌ FATAL ERROR:", errorMsg);
      // We intentionally throw here so the calling middleware in index.ts can catch it 
      // and send a 500 JSON response instead of a hard crash.
      throw new Error(errorMsg);
    }

    // Diagnostic check for placeholder password
    if (mongoURI.includes('<db_password>') || mongoURI.includes('YOUR_PASSWORD')) {
        throw new Error('Invalid MongoDB URI: Found placeholder password. Check your .env or Vercel vars.');
    }
    
    // Create the connection promise.
    cached.promise = mongoose.connect(mongoURI, {
        // CRITICAL for Vercel: Fail fast (5s) if IP is not whitelisted or DB is unreachable.
        // Otherwise, the Vercel function times out (10s) and returns a 500/504 HTML error.
        serverSelectionTimeoutMS: 5000 
    }).then(mongooseInstance => {
        return mongooseInstance;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
};

export default connectDB;
