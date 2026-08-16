"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsController = void 0;
const cms_service_1 = require("./cms.service");
const response_1 = require("../../utils/response");
class CmsController {
    static async getConfig(req, res, next) {
        try {
            const config = await cms_service_1.CmsService.getConfig();
            (0, response_1.sendSuccess)(res, { config }, 'CMS config retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateConfig(req, res, next) {
        try {
            const { key, value } = req.body;
            const updated = await cms_service_1.CmsService.updateConfig(key, value);
            (0, response_1.sendSuccess)(res, { config: updated }, 'CMS config updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CmsController = CmsController;
