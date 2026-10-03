import { Router } from 'express';
import { ReleaseController } from '../controllers/releaseController.js';

export function createReleaseRoutes(releaseRepo = null) {
  const router = Router();
  const controller = new ReleaseController(releaseRepo);

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.get('/:releaseId', controller.getById);
  router.patch('/:releaseId', controller.update);
  router.delete('/:releaseId', controller.delete);
  router.post('/:releaseId/validate', controller.validate);

  return router;
}
