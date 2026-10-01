import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { initDb } from './db/database';
import { seedIfEmpty } from './db/seed';

// Routes
import authRoutes         from './routes/auth';
import listingsRoutes     from './routes/listings';
import requestsRoutes     from './routes/requests';
import transactionsRoutes from './routes/transactions';

// Controllers used directly on /api/my/* and /api/stats
import { authenticate }      from './middleware/auth';
import { getMyListings }     from './controllers/listings.controller';
import { getMyRequests }     from './controllers/requests.controller';
import { getMyTransactions } from './controllers/transactions.controller';
import { getStats }          from './controllers/stats.controller';

const app = express();
const PORT = process.env.PORT ?? 5000;
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set before starting the server');
}

// ── Global middleware ─────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '100kb' }));

// ── Route mounts ──────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/listings',     listingsRoutes);
app.use('/api/requests',     requestsRoutes);
app.use('/api/transactions', transactionsRoutes);

// /api/my/* — aggregated "my" endpoints
app.get('/api/my/listings',     authenticate, getMyListings);
app.get('/api/my/requests',     authenticate, getMyRequests);
app.get('/api/my/transactions', authenticate, getMyTransactions);

// /api/stats — public aggregate
app.get('/api/stats', getStats);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 fallthrough
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) return next(err);
  console.error('Unhandled request error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
initDb();
seedIfEmpty();
app.listen(PORT, () => {
  console.log(`🚀 CampusSwap server running on http://localhost:${PORT}`);
  console.log(`   Listings     → /api/listings`);
  console.log(`   Requests     → /api/requests`);
  console.log(`   Transactions → /api/transactions`);
  console.log(`   My*          → /api/my/{listings,requests,transactions}`);
  console.log(`   Stats        → /api/stats`);
});

export default app;
