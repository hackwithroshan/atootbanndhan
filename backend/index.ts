

// FIX: Switched to using explicit express types to avoid conflicts.
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Environment Configuration ---
// Only load .env if NOT running on Vercel. Vercel injects env vars automatically.
if (!process.env.VERCEL) {
    dotenv.config({ path: path.resolve(__dirname, '.env') });
}

// --- Process Safety (Prevent Hard Crashes on Vercel) ---
(process as any).on('uncaughtException', (err: any) => {
    console.error('🔥 Uncaught Exception:', err);
    // On Vercel, we don't want to exit the process, just log it so the request might fail gracefully
});

(process as any).on('unhandledRejection', (reason: any, promise: any) => {
    console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
});

import mongoose from 'mongoose';

import connectDB from './db';
import { seedDatabase } from './seed';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import matchRoutes from './routes/matches';
import interestRoutes from './routes/interests';
import messageRoutes from './routes/messages';
import ticketRoutes from './routes/tickets';
import dashboardRoutes from './routes/dashboard';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// --- Vercel Optimization: Force JSON Content-Type ---
// This ensures Vercel never returns HTML 404/500 pages which crash the frontend JSON parser
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});

// --- CORS Configuration ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000',
    'https://atut-bandhan.vercel.app'
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || process.env.VERCEL) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board

app.use(express.json());

// --- Debug Logging for Vercel ---
app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});

// --- Database Logic ---
let hasSeeded = false;
let hasCheckedIndexes = false;

const fixDatabaseIndexes = async () => {
    try {
        if (mongoose.connection.readyState !== 1) return;
        const collections = await mongoose.connection.db?.listCollections({ name: 'users' }).toArray();
        if (collections && collections.length > 0) {
            const usersCollection = mongoose.connection.collection('users');
            const indexes = await usersCollection.indexes();
            const mobileIndex = indexes.find(idx => idx.name === 'mobileNumber_1');
            if (mobileIndex && !mobileIndex.sparse) {
                console.log("🔧 [Auto-Fix] Dropping strict 'mobileNumber_1' index...");
                await usersCollection.dropIndex('mobileNumber_1');
            }
        }
    } catch (err) {
        console.error("⚠️ [Auto-Fix] Index check failed:", err);
    }
};

// --- API Router Setup ---
const apiRouter = express.Router();

// 1. Health Check & Root Route
apiRouter.get('/', (req: any, res: any) => {
    res.status(200).json({ status: 'ok', message: 'Atut Bandhan API is running' });
});

apiRouter.get('/health-check', (req: any, res: any) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Backend server is running', 
        timestamp: new Date().toISOString(),
        env: process.env.VERCEL ? 'vercel' : 'local'
    });
});

// 2. Database Connection Middleware
const dbMiddleware = async (req: any, res: any, next: any) => {
    try {
        await connectDB();
        
        // OPTIMIZATION: Skip heavy startup tasks on Vercel to prevent 10s timeout
        if (!process.env.VERCEL) {
            if (!hasCheckedIndexes) {
                await fixDatabaseIndexes();
                hasCheckedIndexes = true;
            }
            if (!hasSeeded) {
                await seedDatabase();
                hasSeeded = true;
            }
        }
        next();
    } catch (e: any) {
        console.error("Database connection failed:", e.message);
        // Return JSON error instead of crashing
        res.status(503).json({ 
            msg: "Service Unavailable: Database connection failed.",
            error: e.message,
            hint: "Check Vercel Environment Variables (MONGO_URI). Ensure IP Access is 0.0.0.0/0 in Atlas."
        });
    }
};

apiRouter.use(dbMiddleware);

// 3. Define all routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/matches', matchRoutes);
apiRouter.use('/interests', interestRoutes);
apiRouter.use('/messages', messageRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/content', contentRoutes);
apiRouter.use('/admin', adminRoutes);

// --- Mount Router ---
// Mount on BOTH '/api' and '/' to handle Vercel's path rewriting behavior reliably
app.use('/api', apiRouter);
app.use('/', apiRouter);

// --- Global Error Handling (Must be last) ---

// 404 Handler - Forces JSON response
app.use((req, res) => {
    console.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    if (!res.headersSent) {
        res.status(404).json({ 
            msg: 'Route not found', 
            path: req.originalUrl
        });
    }
});

// 500 Global Error Handler - Forces JSON response
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global Server Error:', err);
    if (!res.headersSent) {
        res.status(500).json({ 
            msg: 'Internal Server Error', 
            error: err.message || 'Unknown error' 
        });
    }
});

// --- Local Startup ---
// CRITICAL: Do NOT listen on Vercel. Vercel handles the server instance.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const startLocalServer = async () => {
        try {
            await connectDB();
            console.log("✅ MongoDB successfully connected for local development.");
            await fixDatabaseIndexes();
            await seedDatabase();
            app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
        } catch (error) {
            console.error("❌ Failed to start local server.", error);
        }
    };
    startLocalServer();
}

export default app;