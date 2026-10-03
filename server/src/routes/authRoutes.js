import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { UserRepository } from '../repositories/userRepository.js';
import { requireAuth } from '../auth/passport.js';

export function createAuthRouter(db = null) {
  const router = Router();
  const userRepo = new UserRepository(db);
  const controller = new AuthController(userRepo);

  router.post('/register', controller.register);
  router.post('/login', controller.login);
  router.post('/demo', controller.demoLogin);
  router.get('/me', requireAuth, controller.me);

  return router;
}
