import { Response } from 'express';
import db from '../db/database';
import { RequestSchema } from '../schemas';
import { AuthRequest } from '../middleware/auth';
import { ok, created, badRequest, forbidden, notFound, parseZodError } from '../lib/response';

type RequestRow = {
  id: number;
  user_id: number;
  title: string;
  course: string | null;
  semester: string | null;
  note: string | null;
  status: string;
  created_at: string;
  user_name?: string;
  hostel?: string;
  user_email?: string;
};

const SELECT_WITH_USER = `
  SELECT r.*, u.name AS user_name, u.hostel AS hostel, u.email AS user_email
  FROM requests r
  JOIN users u ON u.id = r.user_id
`;
const SELECT_PUBLIC_WITH_USER = `
  SELECT r.*, u.name AS user_name, u.hostel AS hostel
  FROM requests r
  JOIN users u ON u.id = r.user_id
`;

// ── GET /api/requests ─────────────────────────────────────────────────────────

export function getRequests(req: AuthRequest, res: Response): void {
  const select = req.userId ? SELECT_WITH_USER : SELECT_PUBLIC_WITH_USER;
  const requests = db.prepare(
    `${select} WHERE r.status = 'open' ORDER BY r.created_at DESC`,
  ).all() as RequestRow[];
  ok(res, { requests });
}

// ── POST /api/requests ────────────────────────────────────────────────────────

export function createRequest(req: AuthRequest, res: Response): void {
  const parsed = RequestSchema.safeParse(req.body);
  if (!parsed.success) { badRequest(res, ...Object.values(parseZodError(parsed.error)) as [string, string[]]); return; }

  const { title, course = null, semester = null, note = null } = parsed.data;

  const info = db.prepare(
    'INSERT INTO requests (user_id, title, course, semester, note) VALUES (?, ?, ?, ?, ?)',
  ).run(req.userId!, title, course, semester, note);

  const request = db.prepare('SELECT * FROM requests WHERE id = ?').get(info.lastInsertRowid) as RequestRow;
  created(res, { request });
}

// ── PATCH /api/requests/:id/fulfill ──────────────────────────────────────────

export function fulfillRequest(req: AuthRequest, res: Response): void {
  const existing = db.prepare('SELECT * FROM requests WHERE id = ?')
    .get(req.params.id) as RequestRow | undefined;

  if (!existing) { notFound(res, 'Request not found'); return; }
  if (existing.user_id !== req.userId) { forbidden(res); return; }
  if (existing.status !== 'open') {
    badRequest(res, `Request is already ${existing.status}`); return;
  }

  db.prepare("UPDATE requests SET status = 'fulfilled' WHERE id = ?").run(req.params.id);
  ok(res, { request: { ...existing, status: 'fulfilled' } });
}

// ── GET /api/my/requests ──────────────────────────────────────────────────────

export function getMyRequests(req: AuthRequest, res: Response): void {
  const requests = db.prepare(
    `${SELECT_WITH_USER} WHERE r.user_id = ? ORDER BY r.created_at DESC`,
  ).all(req.userId!) as RequestRow[];
  ok(res, { requests });
}
