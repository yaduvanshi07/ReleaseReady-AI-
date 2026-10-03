import { Router } from 'express';
import { VersionController } from '../controllers/versionController.js';

export function createVersionRoutes(versionRepo = null, releaseRepo = null, reviewRepo = null) {
  const router = Router({ mergeParams: true });
  const controller = new VersionController(versionRepo, releaseRepo, reviewRepo);

  router.get('/', controller.getSnapshots);
  router.post('/', controller.createSnapshot);
  router.get('/:versionId', controller.getSnapshotById);
  router.post('/compare', controller.compareSnapshots);

  return router;
}
