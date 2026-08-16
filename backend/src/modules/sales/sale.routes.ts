import { Router } from 'express';
import { saleService } from './sale.service';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/v1/sales (Submit Purchase Request)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, offeredPriceETB, notes } = req.body;
    if (!propertyId || !offeredPriceETB) {
      return res.status(400).json({ error: 'propertyId and offeredPriceETB are required' });
    }

    const saleReq = await saleService.createSaleRequest({
      propertyId,
      buyerId,
      offeredPriceETB,
      notes,
    });

    return res.status(201).json(saleReq);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to submit sale request' });
  }
});

// GET /api/v1/sales (Get User Sale Requests)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role || 'seeker';
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const requests = await saleService.getUserSaleRequests(userId, role);
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch sale requests' });
  }
});

// PATCH /api/v1/sales/:id/status (Accept / Legal Process / Complete Sale)
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const updated = await saleService.updateSaleStatus(id, userId, status);
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update sale status' });
  }
});

export default router;
