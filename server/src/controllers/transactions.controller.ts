import { Response } from 'express';
import db from '../db/database';
import { TransactionSchema } from '../schemas';
import { AuthRequest } from '../middleware/auth';
import { ok, created, badRequest, forbidden, notFound, conflict, parseZodError } from '../lib/response';
import type { ListingRow } from './listings.controller';

type TransactionRow = {
  id: number;
  listing_id: number;
  buyer_id: number;
  seller_id: number;
  type: string;
  status: string;
  due_date: string | null;
  created_at: string;
  // joined
  listing_title?: string;
  seller_email?: string;
};

// ── POST /api/transactions ────────────────────────────────────────────────────
// Atomic: checks availability, inserts transaction, updates listing status
// in a single SQLite transaction to prevent double-booking.

export function createTransaction(req: AuthRequest, res: Response): void {
  const parsed = TransactionSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, ...Object.values(parseZodError(parsed.error)) as [string, string[]]); return; }

  const { listingId } = parsed.data;
  const buyerId = req.userId!;

  // Run everything inside an immediate transaction for atomicity
  db.exec('BEGIN IMMEDIATE');
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?')
      .get(listingId) as ListingRow | undefined;

    if (!listing) {
      db.exec('ROLLBACK');
      notFound(res, 'Listing not found');
      return;
    }
    if (listing.seller_id === buyerId) {
      db.exec('ROLLBACK');
      forbidden(res, "You can't buy your own listing");
      return;
    }
    if (listing.status !== 'available') {
      db.exec('ROLLBACK');
      conflict(res, `Listing is already ${listing.status}`);
      return;
    }

    // Derive type and new status from the listing mode
    const typeMap: Record<string, string> = { sell: 'sale', rent: 'rent', swap: 'swap' };
    const statusMap: Record<string, string> = { sell: 'sold', rent: 'rented', swap: 'swapped' };
    const type = typeMap[listing.mode] ?? 'sale';
    const newListingStatus = statusMap[listing.mode] ?? 'sold';

    // due_date = now + 7 days for rentals
    const due_date = listing.mode === 'rent'
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      : null;

    // Mark listing unavailable first (prevents double-booking)
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run(newListingStatus, listingId);

    // Insert transaction
    const info = db.prepare(`
      INSERT INTO transactions (listing_id, buyer_id, seller_id, type, status, due_date)
      VALUES (?, ?, ?, ?, 'pending', ?)
    `).run(listingId, buyerId, listing.seller_id, type, due_date);

    const transaction = db.prepare(`
      SELECT t.*, u.email AS seller_email, u.name AS seller_name
      FROM transactions t
      JOIN users u ON u.id = t.seller_id
      WHERE t.id = ?
    `).get(info.lastInsertRowid) as TransactionRow;

    db.exec('COMMIT');
    created(res, { transaction });
  } catch (err: unknown) {
    try { db.exec('ROLLBACK'); } catch { /* ignore rollback errors */ }
    console.error('Failed to create transaction:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ── GET /api/my/transactions ──────────────────────────────────────────────────
// Buyer's history: listing title + seller's contact email

export function getMyTransactions(req: AuthRequest, res: Response): void {
  const transactions = db.prepare(`
    SELECT t.*, l.title AS listing_title, u.email AS seller_email, u.name AS seller_name
    FROM transactions t
    JOIN listings l ON l.id = t.listing_id
    JOIN users   u ON u.id = t.seller_id
    WHERE t.buyer_id = ?
    ORDER BY t.created_at DESC
  `).all(req.userId!) as TransactionRow[];

  ok(res, { transactions });
}
