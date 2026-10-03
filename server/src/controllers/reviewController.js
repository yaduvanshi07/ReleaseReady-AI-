import { ReviewRepository } from '../repositories/reviewRepository.js';
import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { reviewStatementSchema } from '../validators/releaseSchema.js';

export class ReviewController {
  constructor(reviewRepo = null, releaseRepo = null) {
    this.reviewRepo = reviewRepo || new ReviewRepository();
    this.releaseRepo = releaseRepo || new ReleaseRepository();
  }

  getStatements = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      const statements = this.reviewRepo.getStatementsByReleaseId(releaseId);
      res.json({ statements });
    } catch (err) {
      next(err);
    }
  };

  updateStatement = (req, res, next) => {
    try {
      const { statementId } = req.params;
      const parsed = reviewStatementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            message: 'Invalid statement review update.',
            code: 'VALIDATION_ERROR',
            details: parsed.error.format()
          }
        });
      }

      const updated = this.reviewRepo.updateStatementReview(statementId, {
        reviewState: parsed.data.reviewState,
        currentContent: parsed.data.currentContent,
        notes: parsed.data.notes
      });

      if (!updated) {
        return res.status(404).json({ error: { message: `Statement "${statementId}" not found.`, code: 'NOT_FOUND' } });
      }

      res.json({ statement: updated });
    } catch (err) {
      next(err);
    }
  };
}
