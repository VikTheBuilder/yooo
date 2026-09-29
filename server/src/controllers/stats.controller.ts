import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { ok } from '../lib/response';

// ── GET /api/stats ────────────────────────────────────────────────────────────

export function getStats(_req: AuthRequest, res: Response): void {
  const totalListings = (db.prepare(
    "SELECT COUNT(*) AS n FROM listings WHERE status = 'available'",
  ).get() as { n: number }).n;

  const openRequests = (db.prepare(
    "SELECT COUNT(*) AS n FROM requests WHERE status = 'open'",
  ).get() as { n: number }).n;

  const completedTransactions = (db.prepare(
    "SELECT COUNT(*) AS n FROM transactions WHERE status = 'completed'",
  ).get() as { n: number }).n;

  ok(res, { stats: { totalListings, openRequests, completedTransactions } });
}
