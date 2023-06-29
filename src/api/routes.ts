import { Router } from 'express';
import CustomersRoutes from './customers/customers.routes';
import RestaurantsRoutes from './restaurants/restaurants.routes';
import { reset } from './reset/reset.controller';

const router: Router = Router();
router.get('/reset', reset);
router.use('/customers', CustomersRoutes);
router.use('/restaurants', RestaurantsRoutes);

export default router;