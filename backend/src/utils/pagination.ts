export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(options: PaginationOptions): PaginationResult {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function formatPaginatedMeta(total: number, page: number, limit: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
