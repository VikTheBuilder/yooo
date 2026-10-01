import { z } from 'zod';

// ── Auth ──────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name:     z.string().min(2,  'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6,  'Password must be at least 6 characters'),
  hostel:   z.string().min(1,  'Hostel is required'),
  batch:    z.string().min(1,  'Batch is required'),
});

export const LoginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1,  'Password is required'),
});

// ── Listings ──────────────────────────────────────────────────────────────────

export const ListingSchema = z.object({
  title:               z.string().min(3,  'Title must be at least 3 characters').max(120),
  description:         z.string().min(10, 'Description must be at least 10 characters').max(1000),
  category:            z.enum(['book', 'notes', 'calculator', 'lab-equipment', 'other']),
  course:              z.string().max(60).optional().nullable(),
  semester:            z.string().max(20).optional().nullable(),
  condition:           z.enum(['new', 'good', 'fair']),
  mode:                z.enum(['sell', 'rent', 'swap']),
  price:               z.number().nonnegative('Price must be ≥ 0').optional().nullable(),
  rent_price_per_week: z.number().nonnegative('Rent price must be ≥ 0').optional().nullable(),
  swap_wanted:         z.string().max(200).optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.mode === 'sell' && data.price == null) {
    ctx.addIssue({ code: 'custom', path: ['price'], message: 'Price is required for sell listings' });
  }
  if (data.mode === 'rent' && data.rent_price_per_week == null) {
    ctx.addIssue({ code: 'custom', path: ['rent_price_per_week'], message: 'Rent price per week is required for rent listings' });
  }
  if (data.mode === 'swap' && !data.swap_wanted) {
    ctx.addIssue({ code: 'custom', path: ['swap_wanted'], message: 'swap_wanted is required for swap listings' });
  }
});

export const ListingUpdateSchema = z.object({
  title:               z.string().min(3).max(120).optional(),
  description:         z.string().min(10).max(1000).optional(),
  category:            z.enum(['book', 'notes', 'calculator', 'lab-equipment', 'other']).optional(),
  course:              z.string().max(60).optional().nullable(),
  semester:            z.string().max(20).optional().nullable(),
  condition:           z.enum(['new', 'good', 'fair']).optional(),
  mode:                z.enum(['sell', 'rent', 'swap']).optional(),
  price:               z.number().nonnegative().optional().nullable(),
  rent_price_per_week: z.number().nonnegative().optional().nullable(),
  swap_wanted:         z.string().max(200).optional().nullable(),
});

// ── Requests ──────────────────────────────────────────────────────────────────

export const RequestSchema = z.object({
  title:    z.string().min(3, 'Title must be at least 3 characters').max(120),
  course:   z.string().max(60).optional().nullable(),
  semester: z.string().max(20).optional().nullable(),
  note:     z.string().max(500).optional().nullable(),
});

// ── Transactions ──────────────────────────────────────────────────────────────
// type and due_date are derived server-side from the listing's mode.

export const TransactionSchema = z.object({
  listingId: z.number({ required_error: 'listingId is required' }).int().positive('listingId must be a positive integer'),
});
