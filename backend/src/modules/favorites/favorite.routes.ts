import { Router } from 'express';
import { FavoriteController } from './favorite.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', FavoriteController.getMyFavorites);
router.post('/:propertyId', FavoriteController.add);
router.delete('/:propertyId', FavoriteController.remove);

export default router;
