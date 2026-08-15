"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginationParams = getPaginationParams;
exports.formatPaginatedResponse = formatPaginatedResponse;
function getPaginationParams(reqQuery) {
    const page = Math.max(1, parseInt(reqQuery.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(reqQuery.limit, 10) || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
}
function formatPaginatedResponse(items, totalCount, params) {
    const totalPages = Math.ceil(totalCount / params.limit);
    return {
        items,
        pagination: {
            totalItems: totalCount,
            totalPages,
            currentPage: params.page,
            pageSize: params.limit,
            hasNextPage: params.page < totalPages,
            hasPrevPage: params.page > 1,
        },
    };
}
