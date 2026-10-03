import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * Seeds the database with rich example release packages and demo users if empty.
 * @param {import('better-sqlite3').Database} db
 */
export function seedDatabase(db) {
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, role, avatar, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();
  const demoSalt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('Password123!', demoSalt);

  // Seed default demo user accounts
  insertUser.run(
    'usr_seed_demo_lead',
    'Alex Rivera (Engineering Lead)',
    'demo@releaseready.ai',
    defaultPasswordHash,
    'engineer',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    now,
    now
  );

  insertUser.run(
    'usr_seed_demo_qa',
    'Sarah Connor (QA Lead)',
    'reviewer@releaseready.ai',
    defaultPasswordHash,
    'qa_lead',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    now,
    now
  );

  const count = db.prepare('SELECT COUNT(*) as c FROM releases').get().c;
  if (count > 0) {
    return;
  }

  const releaseId = 'rel_seed_001';

  const insertRelease = db.prepare(`
    INSERT INTO releases (id, name, version, description, release_date, owner, qa_summary, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO release_items (id, release_id, code, category, title, description, display_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEvidence = db.prepare(`
    INSERT INTO qa_evidence (id, release_id, code, type, title, details, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertStatement = db.prepare(`
    INSERT INTO generated_statements (id, release_id, analysis_id, statement_type, original_content, current_content, source_identifiers, is_stale, stale_reason, review_state, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSnapshot = db.prepare(`
    INSERT INTO release_snapshots (id, release_id, version_label, changelog_summary, snapshot_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertRelease.run(
      releaseId,
      'Payment Gateway Modernization & Audit Stream',
      'v2.4.0',
      'Major update adding 3DS2 Stripe integration, real-time audit logging export, and deprecating v1 webhook payload.',
      '2026-10-15',
      'Release Lead <alex.chen@company.internal>',
      'Comprehensive regression testing executed on staging. 142 automated tests passed. Performance load testing verified 2,500 req/sec throughput. Webhook v2 integration completed.',
      now,
      now
    );

    const items = [
      { code: 'REL-001', category: 'feature', title: 'Stripe Elements 3DS2 Integration', description: 'Updated checkout checkout flow to enforce SCA and 3D Secure 2 authentication for EU/UK cards.', order: 1 },
      { code: 'REL-002', category: 'feature', title: 'Immutable Audit Log Exporter', description: 'Export audit trails directly to encrypted S3 buckets with SHA-256 validation signatures.', order: 2 },
      { code: 'REL-003', category: 'bug_fix', title: 'Token Refresh Race Condition Fix', description: 'Resolved 401 Unauthorized errors caused by simultaneous parallel requests on expiring JWT tokens.', order: 3 },
      { code: 'REL-004', category: 'changed_behavior', title: 'Webhook Payload v1 Schema Deprecation', description: 'Legacy webhook v1 endpoints return deprecation warnings. Webhook consumer headers now require `X-Webhook-Version: 2026-10`.', order: 4 },
      { code: 'REL-005', category: 'known_limitation', title: 'Audit Export Batch Limit', description: 'Single export batches are capped at 50,000 rows. Larger datasets must be streamed via pagination API.', order: 5 },
      { code: 'REL-006', category: 'migration_note', title: 'Database Idempotency Migration', description: 'Execute `20261001_add_idempotency_keys.sql` before running new application instances.', order: 6 },
      { code: 'REL-007', category: 'affected_user_group', title: 'Enterprise Billing Admins & API Partners', description: 'Billing teams utilizing automated invoice sync and integration developers using webhooks.', order: 7 }
    ];

    for (const item of items) {
      insertItem.run(
        crypto.randomUUID(),
        releaseId,
        item.code,
        item.category,
        item.title,
        item.description,
        item.order,
        now,
        now
      );
    }

    const evidenceList = [
      { code: 'QA-001', type: 'test_suite', title: 'Stripe 3DS2 Automated Test Suite', details: 'Passed 48/48 test scenarios covering challenged, frictionless, and declined SCA flows.', status: 'passed' },
      { code: 'QA-002', type: 'performance_metric', title: 'Audit Exporter Throughput & Concurrency Benchmark', details: 'Verified 2,500 records/sec throughput under 50 concurrent tenant export requests.', status: 'passed' },
      { code: 'QA-003', type: 'manual_test', title: 'Webhook v2 Retries & Fallback Verification', details: 'Validated exponential backoff on HTTP 500 receiver responses. Verified deprecation warning headers.', status: 'passed' }
    ];

    for (const ev of evidenceList) {
      insertEvidence.run(
        crypto.randomUUID(),
        releaseId,
        ev.code,
        ev.type,
        ev.title,
        ev.details,
        ev.status,
        now,
        now
      );
    }

    // Seed sample generated statements with citations and review status
    const statements = [
      {
        id: 'STMT-001',
        type: 'technical_summary',
        content: 'Release v2.4.0 upgrades the payment checkout pipeline to support Stripe 3D Secure 2 (SCA compliant) [REL-001] and resolves token expiration race conditions [REL-003]. Database schema migration for idempotency keys must be applied prior to deployment [REL-006].',
        sources: JSON.stringify(['REL-001', 'REL-003', 'REL-006']),
        state: 'accepted'
      },
      {
        id: 'STMT-002',
        type: 'stakeholder_summary',
        content: 'This update introduces improved payment security for European transactions and enhances system audit export capabilities for enterprise billing teams [REL-007]. Webhook integrators should note header updates [REL-004].',
        sources: JSON.stringify(['REL-001', 'REL-007', 'REL-004']),
        state: 'generated'
      },
      {
        id: 'STMT-003',
        type: 'qa_claim',
        content: 'Payment processing with 3DS2 was verified across all friction and challenge scenarios with 100% pass rate [QA-001]. Concurrency stress tests confirmed throughput targets [QA-002].',
        sources: JSON.stringify(['QA-001', 'QA-002']),
        state: 'accepted'
      }
    ];

    for (const stmt of statements) {
      insertStatement.run(
        stmt.id,
        releaseId,
        null,
        stmt.type,
        stmt.content,
        stmt.content,
        stmt.sources,
        0,
        null,
        stmt.state,
        now,
        now
      );
    }

    // Create an initial v2.3.9 snapshot for comparison demonstration
    const snapshotV1 = {
      release: {
        id: releaseId,
        name: 'Payment Gateway Modernization & Audit Stream',
        version: 'v2.3.9',
        description: 'Initial release with baseline payment processing.',
        release_date: '2026-09-15',
        owner: 'Release Lead <alex.chen@company.internal>',
        qa_summary: 'Baseline regression passed with 120 tests.'
      },
      items: [
        { code: 'REL-001', category: 'feature', title: 'Stripe Elements Integration (Baseline)', description: 'Baseline payment integration.' },
        { code: 'REL-004', category: 'changed_behavior', title: 'Webhook Payload v1 Schema', description: 'Standard v1 webhooks.' },
        { code: 'REL-007', category: 'affected_user_group', title: 'Billing Administrators', description: 'Billing teams.' }
      ],
      evidence: [
        { code: 'QA-001', type: 'test_suite', title: 'Stripe Baseline Tests', details: 'Passed 30/30 baseline tests.', status: 'passed' }
      ],
      validationResults: { isComplete: true, missingRequired: [], optionalSuggestions: [], risks: [] },
      generatedStatements: [],
      timestamp: '2026-09-15T10:00:00.000Z'
    };

    insertSnapshot.run(
      'snap_seed_v239',
      releaseId,
      'v2.3.9',
      'Initial baseline release snapshot before 3DS2 upgrade and audit log export addition.',
      JSON.stringify(snapshotV1),
      '2026-09-15T10:00:00.000Z'
    );
  });

  tx();
}
