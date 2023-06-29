import { Router } from 'express';
import { login, profile, register, verify } from './restaurants.controller';
import { authorize } from '../auth/auth.middleware';

const router: Router = Router();

router
  .route('/register')
  .post(
    register
  );

router
  .route('/verify')
  .get(
    verify
  );

router
  .route('/login')
  .post(
    login
  );

router
  .route('/profile')
  .get(
    authorize(['getProfile']),
    profile
  );

export default router;