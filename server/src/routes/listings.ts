import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  patchListingStatus,
  deleteListing,
} from '../controllers/listings.controller';

const router = Router();

// Public
router.get('/',    getListings);
router.get('/:id', getListingById);

// Protected
router.post('/',            authenticate, createListing);
router.put('/:id',          authenticate, updateListing);
router.patch('/:id/status', authenticate, patchListingStatus);
router.delete('/:id',       authenticate, deleteListing);

export default router;
