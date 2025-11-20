
import express, { Request as ExpressRequest, Response as ExpressResponse, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './db';
import { setupDatabase } from './setup';

// Import route files
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import matchesRoutes from './routes/matches';
import interestsRoutes from './routes/interests';
import messagesRoutes from './routes/messages';
import ticketsRoutes from './routes/tickets';
import dashboardRoutes from './routes/dashboard';
import contentRoutes from './routes/content';
import adminRoutes from './routes/admin';

const app = express();

let dbSetupPromise: Promise<void> | null = null;

// Middleware to ensure DB is connected and setup is complete
const ensureDbConnection = async (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    try {
        await connectDB();
        // Run setup once per instance lifecycle
        if (!dbSetupPromise) {
            dbSetupPromise = setupDatabase();
        }
        await dbSetupPromise;
        next();
    } catch (err: any) {
        console.error("Middleware DB/Setup Error:", err);
        if (!res.headersSent) {
           res.status(500).json({ msg: 'Database Connection or Setup Failed', error: err.message });
        }
    }
};

// Init Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-auth-token'],
}));
app.options('*', cors());
app.use(express.json());

// Add the DB connection middleware to all /api routes
app.use('/api', ensureDbConnection);

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/admin', adminRoutes);

// Global 404 handler for API routes
app.use('/api', (req: ExpressRequest, res: ExpressResponse) => {
    res.status(404).json({ msg: 'API route not found' });
});

// For local development, this will run a standalone server.
if (!process.env.VERCEL_ENV) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Backend server for local dev started on port ${PORT}`));
}

// Export the app for Vercel
export default app;
