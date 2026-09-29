import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/database';
import { RegisterSchema, LoginSchema } from '../schemas';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// ── Types ─────────────────────────────────────────────────────────────────────

type UserRow = {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  hostel: string;
  batch: string;
  created_at: string;
};

function safeUser(u: UserRow) {
  return { id: u.id, name: u.name, email: u.email, hostel: u.hostel, batch: u.batch, created_at: u.created_at };
}

function signToken(userId: number | bigint): string {
  return jwt.sign(
    { userId: Number(userId) },
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', (req, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({ error: messages[0], errors: messages });
  }

  const { name, email, password, hostel, batch } = result.data;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const password_hash = bcrypt.hashSync(password, 10);

  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, hostel, batch) VALUES (?, ?, ?, ?, ?)')
    .run(name, email, password_hash, hostel, batch);

  const token = signToken(info.lastInsertRowid);

  return res.status(201).json({
    token,
    user: { id: Number(info.lastInsertRowid), name, email, hostel, batch },
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', (req, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return res.status(400).json({ error: messages[0], errors: messages });
  }

  const { email, password } = result.data;

  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    // Intentionally vague — don't reveal which field is wrong
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = signToken(user.id);

  return res.json({ token, user: safeUser(user) });
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db
    .prepare('SELECT id, name, email, hostel, batch, created_at FROM users WHERE id = ?')
    .get(req.userId!) as UserRow | undefined;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user: safeUser(user) });
});

export default router;
