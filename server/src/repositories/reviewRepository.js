import crypto from 'crypto';
import { getDb } from '../database/db.js';

export class ReviewRepository {
  constructor(db = null) {
    this.db = db || getDb();
  }

  /**
   * Retrieves all generated statements for a release with their review history.
   * @param {string} releaseId
   */
  getStatementsByReleaseId(releaseId) {
    const statements = this.db.prepare(`
      SELECT * FROM generated_statements
      WHERE release_id = ?
      ORDER BY created_at ASC
    `).all(releaseId);

    const history = this.db.prepare(`
      SELECT rh.* FROM review_history rh
      JOIN generated_statements gs ON rh.statement_id = gs.id
      WHERE gs.release_id = ?
      ORDER BY rh.created_at DESC
    `).all(releaseId);

    const historyByStatement = new Map();
    for (const h of history) {
      if (!historyByStatement.has(h.statement_id)) {
        historyByStatement.set(h.statement_id, []);
      }
      historyByStatement.get(h.statement_id).push({
        id: h.id,
        statementId: h.statement_id,
        previousState: h.previous_state,
        newState: h.new_state,
        previousContent: h.previous_content,
        newContent: h.new_content,
        reviewerNotes: h.reviewer_notes,
        createdAt: h.created_at
      });
    }

    return statements.map(st => ({
      id: st.id,
      releaseId: st.release_id,
      analysisId: st.analysis_id,
      statementType: st.statement_type,
      originalContent: st.original_content,
      currentContent: st.current_content,
      sourceIdentifiers: JSON.parse(st.source_identifiers || '[]'),
      isStale: Boolean(st.is_stale),
      staleReason: st.stale_reason,
      reviewState: st.review_state,
      createdAt: st.created_at,
      updatedAt: st.updated_at,
      history: historyByStatement.get(st.id) || []
    }));
  }

  /**
   * Updates review state and optional edited content for a statement.
   * @param {string} statementId
   * @param {Object} update
   */
  updateStatementReview(statementId, { reviewState, currentContent, notes }) {
    const existing = this.db.prepare('SELECT * FROM generated_statements WHERE id = ?').get(statementId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const historyId = `rh_${crypto.randomUUID()}`;
    const newContent = currentContent !== undefined ? currentContent.trim() : existing.current_content;
    const newState = reviewState || (currentContent !== undefined && currentContent !== existing.current_content ? 'edited' : existing.review_state);

    const tx = this.db.transaction(() => {
      this.db.prepare(`
        UPDATE generated_statements
        SET review_state = ?,
            current_content = ?,
            is_stale = CASE WHEN ? = 'accepted' OR ? = 'edited' THEN 0 ELSE is_stale END,
            stale_reason = CASE WHEN ? = 'accepted' OR ? = 'edited' THEN NULL ELSE stale_reason END,
            updated_at = ?
        WHERE id = ?
      `).run(
        newState,
        newContent,
        newState,
        newState,
        newState,
        newState,
        now,
        statementId
      );

      this.db.prepare(`
        INSERT INTO review_history (id, statement_id, previous_state, new_state, previous_content, new_content, reviewer_notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        historyId,
        statementId,
        existing.review_state,
        newState,
        existing.current_content,
        newContent,
        notes || '',
        now
      );
    });

    tx();

    const updated = this.db.prepare('SELECT * FROM generated_statements WHERE id = ?').get(statementId);
    return {
      id: updated.id,
      releaseId: updated.release_id,
      analysisId: updated.analysis_id,
      statementType: updated.statement_type,
      originalContent: updated.original_content,
      currentContent: updated.current_content,
      sourceIdentifiers: JSON.parse(updated.source_identifiers || '[]'),
      isStale: Boolean(updated.is_stale),
      staleReason: updated.stale_reason,
      reviewState: updated.review_state,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at
    };
  }

  /**
   * Saves newly generated statements for a release.
   * If existing accepted/edited human statements exist, preserves their content and marks stale if necessary.
   * @param {string} releaseId
   * @param {string} analysisId
   * @param {Array} statements
   */
  saveGeneratedStatements(releaseId, analysisId, statements) {
    const existingStatements = this.db.prepare(
      'SELECT * FROM generated_statements WHERE release_id = ?'
    ).all(releaseId);

    const now = new Date().toISOString();
    let stmtCounter = 1;

    let validAnalysisId = null;
    if (analysisId) {
      const exists = this.db.prepare('SELECT id FROM ai_analyses WHERE id = ?').get(analysisId);
      if (exists) {
        validAnalysisId = analysisId;
      }
    }

    const tx = this.db.transaction(() => {
      // For any previously accepted statement that is being replaced, archive or preserve
      for (const stmt of statements) {
        const stmtId = `STMT-${crypto.randomUUID().slice(0, 8)}`;
        this.db.prepare(`
          INSERT INTO generated_statements (
            id, release_id, analysis_id, statement_type, original_content, current_content, 
            source_identifiers, is_stale, stale_reason, review_state, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, 'generated', ?, ?)
        `).run(
          stmtId,
          releaseId,
          validAnalysisId,
          stmt.statementType,
          stmt.content.trim(),
          stmt.content.trim(),
          JSON.stringify(stmt.sourceIdentifiers || []),
          now,
          now
        );
      }
    });

    tx();
    return this.getStatementsByReleaseId(releaseId);
  }

  /**
   * Marks specific statements as stale with an explanation.
   * @param {Array<string>} statementIds
   * @param {string} reason
   */
  markStatementsStale(statementIds, reason) {
    if (!statementIds || statementIds.length === 0) return;

    const now = new Date().toISOString();
    const updateStmt = this.db.prepare(`
      UPDATE generated_statements
      SET is_stale = 1,
          stale_reason = ?,
          review_state = CASE WHEN review_state = 'accepted' THEN 'needs_review' ELSE review_state END,
          updated_at = ?
      WHERE id = ?
    `);

    const tx = this.db.transaction(() => {
      for (const id of statementIds) {
        updateStmt.run(reason, now, id);
      }
    });

    tx();
  }
}
