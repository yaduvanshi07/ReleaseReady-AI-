import { Router } from 'express';
import { createReleaseRoutes } from './releaseRoutes.js';
import { createVersionRoutes } from './versionRoutes.js';
import { createAnalysisRoutes } from './analysisRoutes.js';
import { createReviewRoutes } from './reviewRoutes.js';
import { createBriefRoutes } from './briefRoutes.js';
import { createAuthRouter } from './authRoutes.js';
import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { VersionRepository } from '../repositories/versionRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { AiService } from '../services/aiService.js';

export function createApiRouter(db = null, customAiService = null) {
  const router = Router();

  const releaseRepo = new ReleaseRepository(db);
  const versionRepo = new VersionRepository(db);
  const reviewRepo = new ReviewRepository(db);
  const aiService = customAiService || new AiService(null, db);

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      service: 'ReleaseReady AI Backend',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0)
    });
  });

  // Mount Authentication (Passport)
  router.use('/auth', createAuthRouter(db));

  // Mount release CRUD & validation
  router.use('/releases', createReleaseRoutes(releaseRepo));

  // Mount version snapshots & comparisons
  router.use('/releases/:releaseId/versions', createVersionRoutes(versionRepo, releaseRepo, reviewRepo));

  // Mount AI analysis
  router.use('/releases/:releaseId', createAnalysisRoutes(releaseRepo, aiService));

  // Mount review & statement edits
  router.use('/', createReviewRoutes(reviewRepo, releaseRepo));

  // Mount final release brief
  router.use('/', createBriefRoutes(releaseRepo, reviewRepo, versionRepo));

  return router;
}
