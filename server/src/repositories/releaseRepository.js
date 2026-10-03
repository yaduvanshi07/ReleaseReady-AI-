import crypto from 'crypto';
import { getDb } from '../database/db.js';

export class ReleaseRepository {
  constructor(db = null) {
    this.db = db || getDb();
  }

  /**
   * Retrieves all release packages with aggregate summary statistics.
   */
  getAll() {
    const releases = this.db.prepare(`
      SELECT 
        r.*,
        (SELECT COUNT(*) FROM release_items WHERE release_id = r.id) as item_count,
        (SELECT COUNT(*) FROM qa_evidence WHERE release_id = r.id) as evidence_count,
        (SELECT COUNT(*) FROM release_snapshots WHERE release_id = r.id) as snapshot_count,
        (SELECT COUNT(*) FROM generated_statements WHERE release_id = r.id) as statement_count,
        (SELECT COUNT(*) FROM generated_statements WHERE release_id = r.id AND review_state = 'accepted') as accepted_statements_count,
        (SELECT COUNT(*) FROM generated_statements WHERE release_id = r.id AND is_stale = 1) as stale_statements_count
      FROM releases r
      ORDER BY r.updated_at DESC
    `).all();

    return releases.map(r => ({
      id: r.id,
      name: r.name,
      version: r.version,
      description: r.description || '',
      releaseDate: r.release_date || '',
      owner: r.owner || '',
      qaSummary: r.qa_summary || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      itemCount: r.item_count,
      evidenceCount: r.evidence_count,
      snapshotCount: r.snapshot_count,
      statementCount: r.statement_count,
      acceptedStatementsCount: r.accepted_statements_count,
      staleStatementsCount: r.stale_statements_count
    }));
  }

  /**
   * Retrieves a full release package with all items, evidence, statements, and latest analysis.
   * @param {string} id Release ID
   */
  getById(id) {
    const release = this.db.prepare('SELECT * FROM releases WHERE id = ?').get(id);
    if (!release) return null;

    const items = this.db.prepare(`
      SELECT * FROM release_items 
      WHERE release_id = ? 
      ORDER BY display_order ASC, created_at ASC
    `).all(id);

    const evidence = this.db.prepare(`
      SELECT * FROM qa_evidence 
      WHERE release_id = ? 
      ORDER BY created_at ASC
    `).all(id);

    const statements = this.db.prepare(`
      SELECT * FROM generated_statements 
      WHERE release_id = ? 
      ORDER BY created_at ASC
    `).all(id);

    const latestAnalysis = this.db.prepare(`
      SELECT * FROM ai_analyses 
      WHERE release_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `).get(id);

    const snapshots = this.db.prepare(`
      SELECT id, version_label, changelog_summary, created_at 
      FROM release_snapshots 
      WHERE release_id = ? 
      ORDER BY created_at DESC
    `).all(id);

    return {
      id: release.id,
      name: release.name,
      version: release.version,
      description: release.description || '',
      releaseDate: release.release_date || '',
      owner: release.owner || '',
      qaSummary: release.qa_summary || '',
      createdAt: release.created_at,
      updatedAt: release.updated_at,
      items: items.map(item => ({
        id: item.id,
        code: item.code,
        category: item.category,
        title: item.title,
        description: item.description || '',
        displayOrder: item.display_order,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      evidence: evidence.map(ev => ({
        id: ev.id,
        code: ev.code,
        type: ev.type,
        title: ev.title,
        details: ev.details,
        status: ev.status,
        createdAt: ev.created_at,
        updatedAt: ev.updated_at
      })),
      statements: statements.map(st => ({
        id: st.id,
        analysisId: st.analysis_id,
        statementType: st.statement_type,
        originalContent: st.original_content,
        currentContent: st.current_content,
        sourceIdentifiers: JSON.parse(st.source_identifiers || '[]'),
        isStale: Boolean(st.is_stale),
        staleReason: st.stale_reason,
        reviewState: st.review_state,
        createdAt: st.created_at,
        updatedAt: st.updated_at
      })),
      latestAnalysis: latestAnalysis ? {
        id: latestAnalysis.id,
        technicalSummary: latestAnalysis.technical_summary,
        stakeholderSummary: latestAnalysis.stakeholder_summary,
        impactClassifications: JSON.parse(latestAnalysis.impact_classifications || '[]'),
        missingInformation: JSON.parse(latestAnalysis.missing_information || '[]'),
        qaEvidenceAnalysis: JSON.parse(latestAnalysis.qa_evidence_analysis || '[]'),
        risksAndLimitations: JSON.parse(latestAnalysis.risks_and_limitations || '[]'),
        modelUsed: latestAnalysis.model_used,
        status: latestAnalysis.status,
        createdAt: latestAnalysis.created_at
      } : null,
      snapshots: snapshots.map(s => ({
        id: s.id,
        versionLabel: s.version_label,
        changelogSummary: s.changelog_summary,
        createdAt: s.created_at
      }))
    };
  }

  /**
   * Creates a new release package with associated items and evidence in a single transaction.
   * @param {Object} data Release payload
   */
  create(data) {
    const releaseId = data.id || `rel_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const insertRelease = this.db.prepare(`
      INSERT INTO releases (id, name, version, description, release_date, owner, qa_summary, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = this.db.prepare(`
      INSERT INTO release_items (id, release_id, code, category, title, description, display_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEvidence = this.db.prepare(`
      INSERT INTO qa_evidence (id, release_id, code, type, title, details, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let itemCounter = 1;
    let evidenceCounter = 1;

    const tx = this.db.transaction(() => {
      insertRelease.run(
        releaseId,
        data.name.trim(),
        data.version.trim(),
        data.description || '',
        data.releaseDate || '',
        data.owner || '',
        data.qaSummary || '',
        now,
        now
      );

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const code = item.code || `REL-${String(itemCounter++).padStart(3, '0')}`;
          const itemId = item.id || crypto.randomUUID();
          insertItem.run(
            itemId,
            releaseId,
            code,
            item.category,
            item.title.trim(),
            item.description || '',
            item.displayOrder || (itemCounter - 1),
            now,
            now
          );
        }
      }

      if (Array.isArray(data.evidence)) {
        for (const ev of data.evidence) {
          const code = ev.code || `QA-${String(evidenceCounter++).padStart(3, '0')}`;
          const evId = ev.id || crypto.randomUUID();
          insertEvidence.run(
            evId,
            releaseId,
            code,
            ev.type,
            ev.title.trim(),
            ev.details.trim(),
            ev.status,
            now,
            now
          );
        }
      }
    });

    tx();
    return this.getById(releaseId);
  }

  /**
   * Updates an existing release package, synchronizing items and evidence.
   * Also returns details of modified/removed source item codes to support stale detection.
   * @param {string} id Release ID
   * @param {Object} data Update payload
   */
  update(id, data) {
    const existing = this.getById(id);
    if (!existing) return null;

    const now = new Date().toISOString();

    const updateReleaseStmt = this.db.prepare(`
      UPDATE releases 
      SET name = COALESCE(?, name),
          version = COALESCE(?, version),
          description = COALESCE(?, description),
          release_date = COALESCE(?, release_date),
          owner = COALESCE(?, owner),
          qa_summary = COALESCE(?, qa_summary),
          updated_at = ?
      WHERE id = ?
    `);

    const changedSourceCodes = new Set();

    // Check if QA summary changed
    if (data.qaSummary !== undefined && data.qaSummary !== existing.qaSummary) {
      changedSourceCodes.add('QA-SUMMARY');
    }

    const tx = this.db.transaction(() => {
      updateReleaseStmt.run(
        data.name !== undefined ? data.name.trim() : null,
        data.version !== undefined ? data.version.trim() : null,
        data.description !== undefined ? data.description : null,
        data.releaseDate !== undefined ? data.releaseDate : null,
        data.owner !== undefined ? data.owner : null,
        data.qaSummary !== undefined ? data.qaSummary : null,
        now,
        id
      );

      // Handle items synchronization if provided
      if (Array.isArray(data.items)) {
        const existingItemsMap = new Map(existing.items.map(i => [i.id || i.code, i]));
        const incomingIds = new Set();
        let maxRelNum = existing.items.reduce((max, i) => {
          const match = (i.code || '').match(/REL-(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);

        for (const item of data.items) {
          const existingItem = (item.id && existingItemsMap.get(item.id)) || (item.code && existingItemsMap.get(item.code));
          if (existingItem) {
            incomingIds.add(existingItem.id);
            // Check if item content changed
            const isChanged = existingItem.title !== item.title || 
                              existingItem.description !== (item.description || '') ||
                              existingItem.category !== item.category;
            if (isChanged) {
              changedSourceCodes.add(existingItem.code);
              this.db.prepare(`
                UPDATE release_items 
                SET category = ?, title = ?, description = ?, display_order = ?, updated_at = ?
                WHERE id = ?
              `).run(
                item.category,
                item.title.trim(),
                item.description || '',
                item.displayOrder || existingItem.displayOrder,
                now,
                existingItem.id
              );
            }
          } else {
            // New item
            maxRelNum++;
            const code = item.code || `REL-${String(maxRelNum).padStart(3, '0')}`;
            const itemId = item.id || crypto.randomUUID();
            this.db.prepare(`
              INSERT INTO release_items (id, release_id, code, category, title, description, display_order, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              itemId,
              id,
              code,
              item.category,
              item.title.trim(),
              item.description || '',
              item.displayOrder || maxRelNum,
              now,
              now
            );
          }
        }

        // Delete items not in incoming list
        for (const existingItem of existing.items) {
          if (!incomingIds.has(existingItem.id)) {
            changedSourceCodes.add(existingItem.code);
            this.db.prepare('DELETE FROM release_items WHERE id = ?').run(existingItem.id);
          }
        }
      }

      // Handle QA evidence synchronization if provided
      if (Array.isArray(data.evidence)) {
        const existingEvidenceMap = new Map(existing.evidence.map(e => [e.id || e.code, e]));
        const incomingEvIds = new Set();
        let maxQaNum = existing.evidence.reduce((max, e) => {
          const match = (e.code || '').match(/QA-(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);

        for (const ev of data.evidence) {
          const existingEv = (ev.id && existingEvidenceMap.get(ev.id)) || (ev.code && existingEvidenceMap.get(ev.code));
          if (existingEv) {
            incomingEvIds.add(existingEv.id);
            const isChanged = existingEv.title !== ev.title || 
                              existingEv.details !== ev.details || 
                              existingEv.status !== ev.status ||
                              existingEv.type !== ev.type;
            if (isChanged) {
              changedSourceCodes.add(existingEv.code);
              this.db.prepare(`
                UPDATE qa_evidence 
                SET type = ?, title = ?, details = ?, status = ?, updated_at = ?
                WHERE id = ?
              `).run(
                ev.type,
                ev.title.trim(),
                ev.details.trim(),
                ev.status,
                now,
                existingEv.id
              );
            }
          } else {
            maxQaNum++;
            const code = ev.code || `QA-${String(maxQaNum).padStart(3, '0')}`;
            const evId = ev.id || crypto.randomUUID();
            this.db.prepare(`
              INSERT INTO qa_evidence (id, release_id, code, type, title, details, status, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              evId,
              id,
              code,
              ev.type,
              ev.title.trim(),
              ev.details.trim(),
              ev.status,
              now,
              now
            );
          }
        }

        // Delete evidence not in incoming list
        for (const existingEv of existing.evidence) {
          if (!incomingEvIds.has(existingEv.id)) {
            changedSourceCodes.add(existingEv.code);
            this.db.prepare('DELETE FROM qa_evidence WHERE id = ?').run(existingEv.id);
          }
        }
      }
    });

    tx();

    return {
      release: this.getById(id),
      changedSourceCodes: Array.from(changedSourceCodes)
    };
  }

  /**
   * Deletes a release package. Cascades to all items, evidence, statements, and snapshots.
   * @param {string} id Release ID
   */
  delete(id) {
    const res = this.db.prepare('DELETE FROM releases WHERE id = ?').run(id);
    return res.changes > 0;
  }
}
