import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { createReleaseSchema, updateReleaseSchema } from '../validators/releaseSchema.js';
import { ValidationService } from '../services/validationService.js';
import { StaleDetectionService } from '../services/staleDetectionService.js';

export class ReleaseController {
  constructor(releaseRepo = null) {
    this.releaseRepo = releaseRepo || new ReleaseRepository();
    this.reviewRepo = new ReviewRepository(this.releaseRepo.db);
  }

  getAll = (req, res, next) => {
    try {
      const releases = this.releaseRepo.getAll();
      res.json({ releases });
    } catch (err) {
      next(err);
    }
  };

  getById = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release with ID "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      // Include deterministic validation
      const validation = ValidationService.validate(release);

      res.json({ release, validation });
    } catch (err) {
      next(err);
    }
  };

  create = (req, res, next) => {
    try {
      const parsed = createReleaseSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join('.') || 'root'}: ${i.message}`).join('; ');
        return res.status(400).json({
          error: {
            message: `Invalid release payload: ${issues}`,
            code: 'VALIDATION_ERROR',
            details: parsed.error.format()
          }
        });
      }

      const release = this.releaseRepo.create(parsed.data);
      const validation = ValidationService.validate(release);

      res.status(201).json({ release, validation });
    } catch (err) {
      next(err);
    }
  };

  update = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const parsed = updateReleaseSchema.safeParse(req.body);
      if (!parsed.success) {
        const issues = parsed.error.issues.map(i => `${i.path.join('.') || 'root'}: ${i.message}`).join('; ');
        return res.status(400).json({
          error: {
            message: `Invalid release update payload: ${issues}`,
            code: 'VALIDATION_ERROR',
            details: parsed.error.format()
          }
        });
      }

      const result = this.releaseRepo.update(releaseId, parsed.data);
      if (!result) {
        return res.status(404).json({ error: { message: `Release with ID "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      // Check if any source items were modified and trigger stale detection
      if (result.changedSourceCodes && result.changedSourceCodes.length > 0) {
        StaleDetectionService.evaluateStaleness(releaseId, result.changedSourceCodes, this.reviewRepo);
      }

      const updatedRelease = this.releaseRepo.getById(releaseId);
      const validation = ValidationService.validate(updatedRelease);

      res.json({
        release: updatedRelease,
        validation,
        staleCheck: {
          changedSourceCodes: result.changedSourceCodes
        }
      });
    } catch (err) {
      next(err);
    }
  };

  delete = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const deleted = this.releaseRepo.delete(releaseId);
      if (!deleted) {
        return res.status(404).json({ error: { message: `Release with ID "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }
      res.json({ message: 'Release deleted successfully.', releaseId });
    } catch (err) {
      next(err);
    }
  };

  validate = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release with ID "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      const validation = ValidationService.validate(release);
      res.json({ releaseId, validation });
    } catch (err) {
      next(err);
    }
  };
}
