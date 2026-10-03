import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.js';

export function createReviewRoutes(reviewRepo = null, releaseRepo = null) {
  const router = Router();
  const controller = new ReviewController(reviewRepo, releaseRepo);

  router.get('/releases/:releaseId/review', controller.getStatements);
  router.patch('/statements/:statementId/review', controller.updateStatement);

  return router;
}
