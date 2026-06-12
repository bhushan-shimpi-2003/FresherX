import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Set default timezone for Node.js process (useful for local development and Vercel base)
process.env.TZ = 'Asia/Kolkata';

import { formatToIST } from './utils/timezone';

// Create express app
const app = express();
app.set('trust proxy', 1); // Trust first proxy (e.g. Vercel)
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${formatToIST(new Date())}] ${req.method} ${req.url}`);
  next();
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Import and use routes
import jobRoutes from './routes/jobs';
import adminRoutes from './routes/admin';
import recruiterRoutes from './routes/recruiter';
import profileRoutes from './routes/profile';
import savedRoutes from './routes/saved';
import notificationRoutes from './routes/notifications';
import authRoutes from './routes/auth';
import shareRoutes from './routes/share';
import fcmRoutes from './routes/fcm';
import cronRoutes from './routes/cron';

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/fcm', fcmRoutes);
app.use('/api/cron', cronRoutes);
app.use('/s', shareRoutes);

// Sentry Error Handler must be before any other error middleware
Sentry.setupExpressErrorHandler(app);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

import { startJobAlertsCron } from './cron/jobAlerts';

// Start server if not in production (Vercel uses the exported app)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    
    // Start background jobs (local only)
    startJobAlertsCron();
  });
}

// Export the Express API for Vercel
export default app;
