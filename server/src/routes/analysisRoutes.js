import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController.js';

export function createAnalysisRoutes(releaseRepo = null, aiService = null) {
  const router = Router({ mergeParams: true });
  const controller = new AnalysisController(releaseRepo, aiService);

  router.post('/analyze', controller.analyze);
  router.get('/status', controller.getStatus);

  return router;
}
