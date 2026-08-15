import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { sendSuccess } from '../../utils/response';
import { TransactionType } from '@prisma/client';

export class SearchController {
  static async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = {
        query: req.query.query as string,
        city: req.query.city as string,
        areaName: req.query.area as string,
        propertyType: req.query.type as string,
        transactionType: req.query.transaction as TransactionType,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
        bathrooms: req.query.bathrooms ? Number(req.query.bathrooms) : undefined,
        sortBy: req.query.sortBy as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
      };

      const result = await SearchService.searchProperties(dto);
      sendSuccess(res, result.properties, 'Search results retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
