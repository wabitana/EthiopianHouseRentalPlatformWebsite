"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchController = void 0;
const search_service_1 = require("./search.service");
const response_1 = require("../../utils/response");
class SearchController {
    static async search(req, res, next) {
        try {
            const dto = {
                query: req.query.query,
                city: req.query.city,
                areaName: req.query.area,
                propertyType: req.query.type,
                transactionType: req.query.transaction,
                minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
                bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
                sortBy: req.query.sortBy,
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            };
            const result = await search_service_1.SearchService.searchProperties(dto);
            (0, response_1.sendSuccess)(res, result.properties, 'Search results retrieved', 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SearchController = SearchController;
