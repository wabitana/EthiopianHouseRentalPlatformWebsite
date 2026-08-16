import { Router } from 'express';
import { rentalService } from './rental.service';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/v1/rentals (Create Rental Request)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const renterId = req.user?.id;
    if (!renterId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, proposedStartDate, notes } = req.body;
    if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });

    const rentalReq = await rentalService.createRentalRequest({
      propertyId,
      renterId,
      proposedStartDate,
      notes,
    });

    return res.status(201).json(rentalReq);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to create rental request' });
  }
});

// GET /api/v1/rentals (Get User Rental Requests)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || 'seeker';
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const requests = await rentalService.getUserRentalRequests(userId, role);
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch rental requests' });
  }
});

// PATCH /api/v1/rentals/:id/status (Accept / Reject / Activate Rental)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await rentalService.updateRentalStatus(id, userId, status);
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update rental status' });
  }
});

export default router;
