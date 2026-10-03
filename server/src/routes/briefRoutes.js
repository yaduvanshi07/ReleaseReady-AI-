import { Router } from 'express';
import { BriefController } from '../controllers/briefController.js';

export function createBriefRoutes(releaseRepo = null, reviewRepo = null, versionRepo = null) {
  const router = Router();
  const controller = new BriefController(releaseRepo, reviewRepo, versionRepo);

  router.get('/releases/:releaseId/brief', controller.getBrief);

  return router;
}
