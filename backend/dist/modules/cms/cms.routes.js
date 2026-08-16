"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_service_1 = require("./cms.service");
const router = (0, express_1.Router)();
// GET /api/v1/cms (Public CMS Configuration for Web & Mobile)
router.get('/', async (_req, res) => {
    try {
        const config = await cms_service_1.cmsService.getCmsConfig();
        return res.json({ config });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to load CMS configuration' });
    }
});
// PUT /api/v1/cms/:key (Update CMS Section)
router.put('/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'CMS key and value are required' });
        }
        const updated = await cms_service_1.cmsService.updateCmsConfig(key, value);
        return res.json({ success: true, updated });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to update CMS config' });
    }
});
// POST /api/v1/cms (Update CMS Section)
router.post('/', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || value === undefined) {
            return res.status(400).json({ error: 'CMS key and value are required' });
        }
        const updated = await cms_service_1.cmsService.updateCmsConfig(key, value);
        return res.json({ success: true, updated });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to update CMS config' });
    }
});
exports.default = router;
