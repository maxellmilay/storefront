import { Router } from 'express';
import { listCategoriesHandler } from '../controllers/products.controller.js';

const router = Router();

router.get('/', listCategoriesHandler);

export default router;
