"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalController = void 0;
const rental_service_1 = require("./rental.service");
const response_1 = require("../../utils/response");
class RentalController {
    static async submit(req, res, next) {
        try {
            const renterId = req.user.userId;
            const request = await rental_service_1.RentalService.submitRequest(renterId, req.body);
            (0, response_1.sendSuccess)(res, request, 'Rental request submitted successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyRequests(req, res, next) {
        try {
            const renterId = req.user.userId;
            const requests = await rental_service_1.RentalService.getRenterRequests(renterId);
            (0, response_1.sendSuccess)(res, requests, 'Rental requests retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getOwnerRequests(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const requests = await rental_service_1.RentalService.getOwnerRequests(ownerId);
            (0, response_1.sendSuccess)(res, requests, 'Received rental requests retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async respond(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const requestId = req.params.id;
            const updated = await rental_service_1.RentalService.respondToRequest(ownerId, requestId, req.body);
            (0, response_1.sendSuccess)(res, updated, `Rental request ${req.body.status.toLowerCase()} successfully`);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.RentalController = RentalController;
