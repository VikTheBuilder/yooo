// Shared response helpers — keeps all routes consistent
import { Response } from 'express';

export const ok = (res: Response, data: object, status = 200) =>
  res.status(status).json(data);

export const created = (res: Response, data: object) =>
  res.status(201).json(data);

export const badRequest = (res: Response, error: string, errors?: string[]) =>
  res.status(400).json(errors ? { error, errors } : { error });

export const unauthorized = (res: Response, error = 'Authentication required') =>
  res.status(401).json({ error });

export const forbidden = (res: Response, error = 'Not authorised') =>
  res.status(403).json({ error });

export const notFound = (res: Response, error = 'Not found') =>
  res.status(404).json({ error });

export const conflict = (res: Response, error: string) =>
  res.status(409).json({ error });

export const parseZodError = (err: import('zod').ZodError): { error: string; errors: string[] } => {
  const errors = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
  return { error: errors[0], errors };
};
