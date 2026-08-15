export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function getPaginationParams(reqQuery: any): PaginationParams {
  const page = Math.max(1, parseInt(reqQuery.page as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(reqQuery.limit as string, 10) || 20));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function formatPaginatedResponse<T>(items: T[], totalCount: number, params: PaginationParams) {
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
