import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../src/database/schema.js';
import { ReviewRepository } from '../src/repositories/reviewRepository.js';

describe('Human Review Workflow & Audit History', () => {
  let db;
  let reviewRepo;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    reviewRepo = new ReviewRepository(db);

    db.prepare(`
      INSERT INTO releases (id, name, version, created_at, updated_at)
      VALUES ('rel_rev_1', 'Review Test Release', 'v1.0.0', datetime('now'), datetime('now'))
    `).run();
  });

  it('preserves review transitions and history in review_history audit table', () => {
    reviewRepo.saveGeneratedStatements('rel_rev_1', 'ai_1', [
      {
        statementType: 'technical_summary',
        content: 'Original AI generated statement.',
        sourceIdentifiers: ['REL-001']
      }
    ]);

    const statements = reviewRepo.getStatementsByReleaseId('rel_rev_1');
    const stmt = statements[0];
    expect(stmt.reviewState).toBe('generated');
    expect(stmt.originalContent).toBe('Original AI generated statement.');

    // Step 1: Human Edits the statement
    reviewRepo.updateStatementReview(stmt.id, {
      reviewState: 'edited',
      currentContent: 'Edited statement by lead architect.',
      notes: 'Clarified backend architecture details.'
    });

    let updated = reviewRepo.getStatementsByReleaseId('rel_rev_1')[0];
    expect(updated.reviewState).toBe('edited');
    expect(updated.currentContent).toBe('Edited statement by lead architect.');
    expect(updated.originalContent).toBe('Original AI generated statement.');
    expect(updated.history.length).toBe(1);
    expect(updated.history[0].previousState).toBe('generated');
    expect(updated.history[0].newState).toBe('edited');
    expect(updated.history[0].previousContent).toBe('Original AI generated statement.');
    expect(updated.history[0].newContent).toBe('Edited statement by lead architect.');
    expect(updated.history[0].reviewerNotes).toBe('Clarified backend architecture details.');

    // Step 2: Release Manager Accepts the edited statement
    reviewRepo.updateStatementReview(stmt.id, {
      reviewState: 'accepted',
      notes: 'Approved for final stakeholder distribution.'
    });

    updated = reviewRepo.getStatementsByReleaseId('rel_rev_1')[0];
    expect(updated.reviewState).toBe('accepted');
    expect(updated.history.length).toBe(2);
    expect(updated.history[0].previousState).toBe('edited');
    expect(updated.history[0].newState).toBe('accepted');
  });

  it('handles statement rejection transition', () => {
    reviewRepo.saveGeneratedStatements('rel_rev_1', 'ai_1', [
      {
        statementType: 'risk_limitation',
        content: 'Dubious risk claim.',
        sourceIdentifiers: ['REL-002']
      }
    ]);

    const stmt = reviewRepo.getStatementsByReleaseId('rel_rev_1')[0];
    reviewRepo.updateStatementReview(stmt.id, {
      reviewState: 'rejected',
      notes: 'Claim does not match product reality.'
    });

    const updated = reviewRepo.getStatementsByReleaseId('rel_rev_1')[0];
    expect(updated.reviewState).toBe('rejected');
    expect(updated.history[0].newState).toBe('rejected');
    expect(updated.history[0].reviewerNotes).toBe('Claim does not match product reality.');
  });
});
