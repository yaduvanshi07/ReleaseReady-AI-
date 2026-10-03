import { ReleaseRepository } from '../repositories/releaseRepository.js';
import { ReviewRepository } from '../repositories/reviewRepository.js';
import { VersionRepository } from '../repositories/versionRepository.js';
import { BriefService } from '../services/briefService.js';

export class BriefController {
  constructor(releaseRepo = null, reviewRepo = null, versionRepo = null) {
    this.releaseRepo = releaseRepo || new ReleaseRepository();
    this.reviewRepo = reviewRepo || new ReviewRepository();
    this.versionRepo = versionRepo || new VersionRepository();
  }

  getBrief = (req, res, next) => {
    try {
      const { releaseId } = req.params;
      const { versionId } = req.query;

      let release = null;
      let statements = [];
      let snapshotMeta = null;

      if (versionId) {
        // Generate brief from specific snapshot
        const snapshot = this.versionRepo.getSnapshotById(versionId);
        if (!snapshot) {
          return res.status(404).json({ error: { message: `Snapshot "${versionId}" not found.`, code: 'NOT_FOUND' } });
        }
        release = snapshot.snapshotData.release;
        release.items = snapshot.snapshotData.items;
        release.evidence = snapshot.snapshotData.evidence;
        statements = snapshot.snapshotData.statements || [];
        snapshotMeta = { versionLabel: snapshot.versionLabel, createdAt: snapshot.createdAt };
      } else {
        // Generate brief from current mutable release
        release = this.releaseRepo.getById(releaseId);
        if (!release) {
          return res.status(404).json({ error: { message: `Release "${releaseId}" not found.`, code: 'NOT_FOUND' } });
        }
        statements = this.reviewRepo.getStatementsByReleaseId(releaseId);
      }

      const { briefData, markdown } = BriefService.generateBrief(release, statements, snapshotMeta);

      res.json({ brief: briefData, markdown });
    } catch (err) {
      next(err);
    }
  };
}
