import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../src/database/schema.js';
import { VersionRepository } from '../src/repositories/versionRepository.js';
import { ReleaseRepository } from '../src/repositories/releaseRepository.js';
import { ReviewRepository } from '../src/repositories/reviewRepository.js';

describe('Version Snapshots & Immutability', () => {
  let db;
  let versionRepo;
  let releaseRepo;
  let reviewRepo;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    versionRepo = new VersionRepository(db);
    releaseRepo = new ReleaseRepository(db);
    reviewRepo = new ReviewRepository(db);
  });

  it('creates an immutable snapshot that is preserved when the working release is modified', () => {
    const createdRelease = releaseRepo.create({
      name: 'Release 1.0',
      version: 'v1.0.0',
      description: 'Initial release',
      qaSummary: 'QA passed all tests',
      items: [
        { code: 'REL-001', category: 'feature', title: 'Feature Alpha', description: 'Original description' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'Suite 1', details: 'Passed', status: 'passed' }
      ]
    });

    // Save a statement and review decision
    reviewRepo.saveGeneratedStatements(createdRelease.id, 'ai_1', [
      { statementType: 'technical_summary', content: 'Original technical summary', sourceIdentifiers: ['REL-001'] }
    ]);
    const statements = reviewRepo.getStatementsByReleaseId(createdRelease.id);
    reviewRepo.updateStatementReview(statements[0].id, {
      reviewState: 'accepted',
      currentContent: 'Human accepted technical summary'
    });

    const reviewedStatements = reviewRepo.getStatementsByReleaseId(createdRelease.id);

    // Create snapshot v1.0.0-rc1
    const snapshot = versionRepo.createSnapshot(
      createdRelease.id,
      'v1.0.0-rc1',
      'First snapshot candidate',
      {
        release: createdRelease,
        items: createdRelease.items,
        evidence: createdRelease.evidence,
        statements: reviewedStatements
      }
    );

    expect(snapshot).toBeDefined();
    expect(snapshot.versionLabel).toBe('v1.0.0-rc1');

    // Mutate the live working release
    releaseRepo.update(createdRelease.id, {
      name: 'Release 1.0 Mutated Name',
      items: [
        { id: createdRelease.items[0].id, code: 'REL-001', category: 'feature', title: 'Feature Alpha MUTATED', description: 'Modified' }
      ]
    });

    // Verify working release has new data
    const updatedRelease = releaseRepo.getById(createdRelease.id);
    expect(updatedRelease.name).toBe('Release 1.0 Mutated Name');
    expect(updatedRelease.items[0].title).toBe('Feature Alpha MUTATED');

    // Verify snapshot retains the exact original data (IMMUTABILITY)
    const fetchedSnapshot = versionRepo.getSnapshotById(snapshot.id);
    expect(fetchedSnapshot.snapshotData.release.name).toBe('Release 1.0');
    expect(fetchedSnapshot.snapshotData.items[0].title).toBe('Feature Alpha');
    expect(fetchedSnapshot.snapshotData.statements[0].currentContent).toBe('Human accepted technical summary');
    expect(fetchedSnapshot.snapshotData.statements[0].reviewState).toBe('accepted');
  });

  it('rejects duplicate version labels for the same release', () => {
    const createdRelease = releaseRepo.create({
      name: 'Release Test',
      version: 'v1.0.0',
      items: [],
      evidence: []
    });

    versionRepo.createSnapshot(createdRelease.id, 'v1.0.0-gold', 'First gold release', { dummy: true });

    expect(() => {
      versionRepo.createSnapshot(createdRelease.id, 'v1.0.0-gold', 'Duplicate label attempt', { dummy: true });
    }).toThrow(/already exists/i);
  });
});
