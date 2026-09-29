import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { createTransaction, getMyTransactions } from '../controllers/transactions.controller';

const router = Router();

router.post('/',         authenticate, createTransaction);
router.get('/mine',      authenticate, getMyTransactions);

export default router;
