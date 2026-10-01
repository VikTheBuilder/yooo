import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import {
  getRequests,
  createRequest,
  fulfillRequest,
} from '../controllers/requests.controller';

const router = Router();

router.get('/',                   optionalAuthenticate, getRequests);
router.post('/',                  authenticate, createRequest);
router.patch('/:id/fulfill',      authenticate, fulfillRequest);

export default router;
