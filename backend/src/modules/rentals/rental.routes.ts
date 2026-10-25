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

// POST /api/v1/rentals/visit (Schedule Tour Visit)
router.post('/visit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const renterId = req.user?.id;
    if (!renterId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, visitDate, timeSlot, tourType, notes, seekerPhone, seekerName } = req.body;
    if (!propertyId || !visitDate || !timeSlot) {
      return res.status(400).json({ error: 'propertyId, visitDate, and timeSlot are required' });
    }

    const result = await rentalService.scheduleTourVisit({
      propertyId,
      renterId,
      visitDate,
      timeSlot,
      tourType: tourType || 'In-Person Physical Visit',
      notes,
      seekerPhone,
      seekerName,
    });

    return res.status(201).json({
      success: true,
      message: 'Property tour visit scheduled successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Schedule visit error:', error);
    return res.status(400).json({ error: error.message || 'Failed to schedule visit' });
  }
});

// POST /api/v1/rentals/contract (Propose Digital Lease Agreement)
router.post('/contract', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const renterId = req.user?.id;
    if (!renterId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      propertyId,
      durationMonths,
      advanceMonths,
      depositAmount,
      monthlyRent,
      startDate,
      tenantName,
      tenantPhone,
      language,
      notes,
    } = req.body;

    if (!propertyId || !monthlyRent || !startDate) {
      return res.status(400).json({ error: 'propertyId, monthlyRent, and startDate are required' });
    }

    const result = await rentalService.createLeaseAgreementProposal({
      propertyId,
      renterId,
      durationMonths: durationMonths || 12,
      advanceMonths: advanceMonths || 3,
      depositAmount: depositAmount || 0,
      monthlyRent: Number(monthlyRent),
      startDate,
      tenantName: tenantName || 'Tenant',
      tenantPhone: tenantPhone || '',
      language: language || 'am',
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Digital lease agreement proposal created and sent to landlord',
      data: result,
    });
  } catch (error: any) {
    console.error('Create contract error:', error);
    return res.status(400).json({ error: error.message || 'Failed to create lease contract proposal' });
  }
});

// GET /api/v1/rentals/visits (Get User Visits)
router.get('/visits', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const visits = await rentalService.getUserVisits(userId);
    return res.json(visits);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch visits' });
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

    const updated = await rentalService.updateRentalStatus(id, userId, status, req.user?.role);
    return res.json(updated);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Failed to update rental status' });
  }
});

export default router;
