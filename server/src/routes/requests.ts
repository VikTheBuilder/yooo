import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getRequests,
  createRequest,
  fulfillRequest,
  getMyRequests,
} from '../controllers/requests.controller';

const router = Router();

router.get('/',                   getRequests);          // public
router.post('/',                  authenticate, createRequest);
router.patch('/:id/fulfill',      authenticate, fulfillRequest);
router.get('/user/mine',          authenticate, getMyRequests);  // before /:id if ever added

export default router;
