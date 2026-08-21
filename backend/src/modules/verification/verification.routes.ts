import { Router } from 'express';
import { verificationService } from './verification.service';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { prisma } from '../../prisma';

const router = Router();

// GET /api/v1/verification/my-status (Fetch authenticated user verification status)
router.get('/my-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const status = await verificationService.getUserVerificationStatus(userId);
    return res.json(status);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch verification status' });
  }
});

// POST /api/v1/verification/identity (Upload National ID / Passport)
router.post('/identity', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { idType, idNumber, documentUrl, selfieUrl } = req.body;
    if (!idType || !idNumber) {
      return res.status(400).json({ error: 'ID Type and ID Number are required' });
    }

    const doc = await verificationService.submitIdentityDocument({
      userId,
      idType,
      idNumber,
      documentUrl: documentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
      selfieUrl,
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit identity verification' });
  }
});

// POST /api/v1/verification/property-license (Upload House Deed / Site Plan)
router.post('/property-license', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, docType, docUrl } = req.body;
    if (!propertyId || !docType) {
      return res.status(400).json({ error: 'Property ID and Document Type are required' });
    }

    const doc = await verificationService.submitPropertyDocument({
      propertyId,
      ownerId,
      docType,
      docUrl: docUrl || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
    });

    return res.status(201).json({ success: true, document: doc });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit property document' });
  }
});

// GET /api/v1/verification/admin/pending (Admin review queue)
router.get('/admin/pending', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'agent') {
      return res.status(403).json({ error: 'Admin or Agent access required' });
    }

    const data = await verificationService.getPendingVerifications();
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch verification queue' });
  }
});

// PATCH /api/v1/verification/identity/:id/review (Accept/reject ID document - Admin/Agent)
router.patch('/identity/:id/review', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'agent') {
      return res.status(403).json({ error: 'Admin or Agent access required' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: 'VERIFIED' or 'REJECTED'

    if (!status || (status !== 'VERIFIED' && status !== 'REJECTED' && status !== 'UNDER_REVIEW')) {
      return res.status(400).json({ error: 'Invalid or missing status. Must be VERIFIED, REJECTED, or UNDER_REVIEW.' });
    }

    const updatedDoc = await verificationService.reviewIdentityDocument(id, status, adminNotes);
    return res.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    console.error('Identity review error:', error);
    return res.status(500).json({ error: error.message || 'Failed to review identity document' });
  }
});

// PATCH /api/v1/verification/property-license/:id/review (Accept/reject property deeds - Admin/Agent)
router.patch('/property-license/:id/review', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'agent') {
      return res.status(403).json({ error: 'Admin or Agent access required' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: 'VERIFIED' or 'REJECTED'

    if (!status || (status !== 'VERIFIED' && status !== 'REJECTED')) {
      return res.status(400).json({ error: 'Invalid or missing status. Must be VERIFIED or REJECTED.' });
    }

    const updatedDoc = await verificationService.reviewPropertyDocument(id, status, adminNotes);
    return res.json({ success: true, document: updatedDoc });
  } catch (error: any) {
    console.error('Property document review error:', error);
    return res.status(500).json({ error: error.message || 'Failed to review property document' });
  }
});

export default router;
