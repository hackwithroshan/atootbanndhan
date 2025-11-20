
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './db';

// Import route files
import authRoutes from './routes/auth';

const app = express();

// Connect to Database
// This call is important for local development where the server is long-running.
// In serverless, the connection is cached by db.ts, so it's efficient.
connectDB().catch(err => {
    console.error("Initial DB connection failed:", err);
    // For local dev, we might want to exit.
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV) {
        process.exit(1);
    }
});

// Init Middleware
app.use(cors());
app.use(express.json());

// Define Routes
// The /api prefix is handled by the proxy/Vercel rewrites.
// A request to /api/auth/login will be routed here and handled by authRoutes.
app.use('/api/auth', authRoutes);

// For local development, this will run a standalone server.
// `vite.config.ts` proxies `/api` to `localhost:5000`.
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL_ENV) {
  app.listen(PORT, () => console.log(`Backend server for local dev started on port ${PORT}`));
}

// Export the app for Vercel
export default app;
