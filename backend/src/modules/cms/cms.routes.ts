import { Router, Request, Response } from 'express';
import { cmsService } from './cms.service';

const router = Router();

// GET /api/v1/cms (Public CMS Configuration for Web & Mobile)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const config = await cmsService.getCmsConfig();
    return res.json({ config });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load CMS configuration' });
  }
});

// PUT /api/v1/cms/:key (Update CMS Section)
router.put('/:key', async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'CMS key and value are required' });
    }

    const updated = await cmsService.updateCmsConfig(key, value);
    return res.json({ success: true, updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update CMS config' });
  }
});

// POST /api/v1/cms (Update CMS Section)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { key, value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'CMS key and value are required' });
    }

    const updated = await cmsService.updateCmsConfig(key, value);
    return res.json({ success: true, updated });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update CMS config' });
  }
});

export default router;
