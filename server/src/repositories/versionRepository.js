import crypto from 'crypto';
import { getDb } from '../database/db.js';

export class VersionRepository {
  constructor(db = null) {
    this.db = db || getDb();
  }

  /**
   * Creates an immutable snapshot for a release.
   * @param {string} releaseId
   * @param {string} versionLabel
   * @param {string} changelogSummary
   * @param {Object} fullSnapshotData
   */
  createSnapshot(releaseId, versionLabel, changelogSummary, fullSnapshotData) {
    const existing = this.db.prepare(
      'SELECT id FROM release_snapshots WHERE release_id = ? AND version_label = ?'
    ).get(releaseId, versionLabel);

    if (existing) {
      throw new Error(`A snapshot with version label "${versionLabel}" already exists for this release.`);
    }

    const snapshotId = `snap_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO release_snapshots (id, release_id, version_label, changelog_summary, snapshot_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      snapshotId,
      releaseId,
      versionLabel.trim(),
      changelogSummary || '',
      JSON.stringify(fullSnapshotData),
      now
    );

    return this.getSnapshotById(snapshotId);
  }

  /**
   * Retrieves all snapshots for a given release.
   * @param {string} releaseId
   */
  getSnapshotsByReleaseId(releaseId) {
    const snapshots = this.db.prepare(`
      SELECT id, release_id, version_label, changelog_summary, created_at
      FROM release_snapshots
      WHERE release_id = ?
      ORDER BY created_at DESC
    `).all(releaseId);

    return snapshots.map(s => ({
      id: s.id,
      releaseId: s.release_id,
      versionLabel: s.version_label,
      changelogSummary: s.changelog_summary,
      createdAt: s.created_at
    }));
  }

  /**
   * Retrieves a full snapshot by ID, including its stored immutable payload.
   * @param {string} snapshotId
   */
  getSnapshotById(snapshotId) {
    const snapshot = this.db.prepare('SELECT * FROM release_snapshots WHERE id = ?').get(snapshotId);
    if (!snapshot) return null;

    return {
      id: snapshot.id,
      releaseId: snapshot.release_id,
      versionLabel: snapshot.version_label,
      changelogSummary: snapshot.changelog_summary,
      snapshotData: JSON.parse(snapshot.snapshot_data),
      createdAt: snapshot.created_at
    };
  }
}
