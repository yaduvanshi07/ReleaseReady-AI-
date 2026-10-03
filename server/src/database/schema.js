/**
 * Creates all required database tables and indices for ReleaseReady AI.
 * @param {import('better-sqlite3').Database} db
 */
export function initializeSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS releases (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      description TEXT,
      release_date TEXT,
      owner TEXT,
      qa_summary TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS release_items (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      code TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS qa_evidence (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS release_snapshots (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      version_label TEXT NOT NULL,
      changelog_summary TEXT,
      snapshot_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_analyses (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      raw_response TEXT,
      technical_summary TEXT,
      stakeholder_summary TEXT,
      impact_classifications TEXT,
      missing_information TEXT,
      qa_evidence_analysis TEXT,
      risks_and_limitations TEXT,
      model_used TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS generated_statements (
      id TEXT PRIMARY KEY,
      release_id TEXT NOT NULL,
      analysis_id TEXT,
      statement_type TEXT NOT NULL,
      original_content TEXT NOT NULL,
      current_content TEXT NOT NULL,
      source_identifiers TEXT NOT NULL,
      is_stale INTEGER NOT NULL DEFAULT 0,
      stale_reason TEXT,
      review_state TEXT NOT NULL DEFAULT 'generated',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
      FOREIGN KEY (analysis_id) REFERENCES ai_analyses(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS review_history (
      id TEXT PRIMARY KEY,
      statement_id TEXT NOT NULL,
      previous_state TEXT NOT NULL,
      new_state TEXT NOT NULL,
      previous_content TEXT,
      new_content TEXT,
      reviewer_notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (statement_id) REFERENCES generated_statements(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_release_id ON release_items(release_id);
    CREATE INDEX IF NOT EXISTS idx_evidence_release_id ON qa_evidence(release_id);
    CREATE INDEX IF NOT EXISTS idx_snapshots_release_id ON release_snapshots(release_id);
    CREATE INDEX IF NOT EXISTS idx_analyses_release_id ON ai_analyses(release_id);
    CREATE INDEX IF NOT EXISTS idx_statements_release_id ON generated_statements(release_id);
  `);
}
