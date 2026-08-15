"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleController = void 0;
const sale_service_1 = require("./sale.service");
const response_1 = require("../../utils/response");
class SaleController {
    static async submit(req, res, next) {
        try {
            const buyerId = req.user.userId;
            const request = await sale_service_1.SaleService.submitRequest(buyerId, req.body);
            (0, response_1.sendSuccess)(res, request, 'Purchase request submitted successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyRequests(req, res, next) {
        try {
            const buyerId = req.user.userId;
            const requests = await sale_service_1.SaleService.getBuyerRequests(buyerId);
            (0, response_1.sendSuccess)(res, requests, 'Purchase requests retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOwnerRequests(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const requests = await sale_service_1.SaleService.getOwnerRequests(ownerId);
            (0, response_1.sendSuccess)(res, requests, 'Received purchase offers retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async respond(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const requestId = req.params.id;
            const updated = await sale_service_1.SaleService.respondToRequest(ownerId, requestId, req.body);
            (0, response_1.sendSuccess)(res, updated, `Purchase request status set to ${req.body.status}`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SaleController = SaleController;
