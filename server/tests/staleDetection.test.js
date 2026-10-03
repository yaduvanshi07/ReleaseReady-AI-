import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../src/database/schema.js';
import { ReviewRepository } from '../src/repositories/reviewRepository.js';
import { StaleDetectionService } from '../src/services/staleDetectionService.js';

describe('StaleDetectionService (Statement Freshness Tracking)', () => {
  let db;
  let reviewRepo;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    reviewRepo = new ReviewRepository(db);

    // Insert dummy release and statements
    db.prepare(`
      INSERT INTO releases (id, name, version, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run('rel_test', 'Test Release', 'v1.0.0');

    // Statement 1 depends on REL-001 and QA-001
    db.prepare(`
      INSERT INTO generated_statements (
        id, release_id, statement_type, original_content, current_content,
        source_identifiers, is_stale, review_state, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run('stmt_1', 'rel_test', 'technical_summary', 'Content 1', 'Content 1', '["REL-001", "QA-001"]', 0, 'accepted');

    // Statement 2 depends ONLY on REL-002
    db.prepare(`
      INSERT INTO generated_statements (
        id, release_id, statement_type, original_content, current_content,
        source_identifiers, is_stale, review_state, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run('stmt_2', 'rel_test', 'stakeholder_summary', 'Content 2', 'Content 2', '["REL-002"]', 0, 'accepted');
  });

  it('marks statements as stale when their supporting source item is modified', () => {
    // Modify REL-001
    const result = StaleDetectionService.evaluateStaleness('rel_test', ['REL-001'], reviewRepo);

    expect(result.affectedCount).toBe(1);
    expect(result.staleStatementIds).toContain('stmt_1');

    const stmt1 = db.prepare('SELECT * FROM generated_statements WHERE id = ?').get('stmt_1');
    expect(stmt1.is_stale).toBe(1);
    expect(stmt1.review_state).toBe('needs_review'); // Accepted state gets flagged for renewed review
    expect(stmt1.stale_reason).toContain('REL-001');

    // Statement 2 must remain fresh!
    const stmt2 = db.prepare('SELECT * FROM generated_statements WHERE id = ?').get('stmt_2');
    expect(stmt2.is_stale).toBe(0);
    expect(stmt2.review_state).toBe('accepted');
  });
});
