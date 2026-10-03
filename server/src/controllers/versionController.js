import { VersionRepository } from '../repositories/versionRepository.js';
import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { ValidationService } from '../services/validationService.js';
import { ComparisonService } from '../services/comparisonService.js';
import { createSnapshotSchema } from '../validators/releaseSchema.js';

export class VersionController {
  constructor(versionRepo = null, releaseRepo = null, reviewRepo = null) {
    this.versionRepo = versionRepo || new VersionRepository();
    this.releaseRepo = releaseRepo || new ReleaseRepository();
    this.reviewRepo = reviewRepo || new ReviewRepository();
  }

  getSnapshots = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const snapshots = this.versionRepo.getSnapshotsByReleaseId(releaseId);
      res.json({ snapshots });
    } catch (err) {
      next(err);
    }
  };

  getSnapshotById = (req, res, next) => {
    try {
      const { versionId } = req.params;
      const snapshot = this.versionRepo.getSnapshotById(versionId);
      if (!snapshot) {
        return res.status(404).json({ error: { message: `Snapshot "${versionId}" not found.`, code: 'NOT_FOUND' } });
      }
      res.json({ snapshot });
    } catch (err) {
      next(err);
    }
  };

  createSnapshot = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const parsed = createSnapshotSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: {
            message: 'Invalid snapshot payload.',
            code: 'VALIDATION_ERROR',
            details: parsed.error.format()
          }
        });
      }

      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      const statements = this.reviewRepo.getStatementsByReleaseId(releaseId);
      const validation = ValidationService.validate(release);

      // Construct immutable snapshot bundle
      const snapshotPayload = {
        release: {
          id: release.id,
          name: release.name,
          version: release.version,
          description: release.description,
          releaseDate: release.releaseDate,
          owner: release.owner,
          qaSummary: release.qaSummary
        },
        items: release.items,
        evidence: release.evidence,
        statements,
        latestAnalysis: release.latestAnalysis,
        validationResults: validation,
        snapshotCreatedAt: new Date().toISOString()
      };

      const snapshot = this.versionRepo.createSnapshot(
        releaseId,
        parsed.data.versionLabel,
        parsed.data.changelogSummary,
        snapshotPayload
      );

      res.status(201).json({ snapshot });
    } catch (err) {
      next(err);
    }
  };

  compareSnapshots = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const { baseVersionId, targetVersionId } = req.body;

      if (!baseVersionId || !targetVersionId) {
        return res.status(400).json({
          error: {
            message: 'Both baseVersionId and targetVersionId are required for comparison.',
            code: 'INVALID_ARGUMENTS'
          }
        });
      }

      const release = this.releaseRepo.getById(releaseId);
      if (!release) {
        return res.status(404).json({ error: { message: `Release "${releaseId}" not found.`, code: 'NOT_FOUND' } });
      }

      // Fetch base snapshot or "current"
      let baseData = null;
      if (baseVersionId === 'current') {
        const statements = this.reviewRepo.getStatementsByReleaseId(releaseId);
        baseData = { snapshotData: { release, items: release.items, evidence: release.evidence, statements } };
      } else {
        baseData = this.versionRepo.getSnapshotById(baseVersionId);
        if (!baseData) {
          return res.status(404).json({ error: { message: `Base snapshot "${baseVersionId}" not found.`, code: 'NOT_FOUND' } });
        }
      }

      // Fetch target snapshot or "current"
      let targetData = null;
      if (targetVersionId === 'current') {
        const statements = this.reviewRepo.getStatementsByReleaseId(releaseId);
        targetData = { snapshotData: { release, items: release.items, evidence: release.evidence, statements } };
      } else {
        targetData = this.versionRepo.getSnapshotById(targetVersionId);
        if (!targetData) {
          return res.status(404).json({ error: { message: `Target snapshot "${targetVersionId}" not found.`, code: 'NOT_FOUND' } });
        }
      }

      const comparison = ComparisonService.compare(baseData, targetData);

      res.json({ comparison });
    } catch (err) {
      next(err);
    }
  };
}
