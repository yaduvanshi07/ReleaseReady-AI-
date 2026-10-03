import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { initializeSchema } from '../src/database/schema.js';
import { ReleaseRepository } from '../src/repositories/releaseRepository.js';

describe('ReleaseReady AI API Integration Tests', () => {
  let db;
  let app;
  let testReleaseId;

  beforeAll(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    const releaseRepo = new ReleaseRepository(db);
    app = createApp({ db });
  });

  it('GET /api/health returns healthy status and AI config status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(typeof res.body.aiConfigured).toBe('boolean');
  });

  it('POST /api/releases creates a new release package', async () => {
    const payload = {
      name: 'E-Commerce Checkout Revamp',
      version: 'v3.0.0',
      description: 'Major checkout UX upgrade with Apple Pay integration.',
      releaseDate: '2026-11-01',
      owner: 'Product Team',
      qaSummary: 'Passed all 85 regression suites on staging.',
      items: [
        { category: 'feature', title: 'Apple Pay Checkout', description: 'One-click pay for iOS devices' },
        { category: 'bug_fix', title: 'Tax calculation rounding fix', description: 'Corrected sub-cent tax rounding' },
        { category: 'affected_user_group', title: 'iOS Safari shoppers', description: 'Users checking out on Apple devices' }
      ],
      evidence: [
        { type: 'test_suite', title: 'Apple Pay E2E Test Suite', details: 'All 20 test cases passed', status: 'passed' }
      ]
    };

    const res = await request(app).post('/api/releases').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.release).toBeDefined();
    expect(res.body.release.name).toBe('E-Commerce Checkout Revamp');
    expect(res.body.release.items.length).toBe(3);
    expect(res.body.release.items[0].code).toBe('REL-001');
    expect(res.body.validation.isReady).toBe(true);

    testReleaseId = res.body.release.id;
  });

  it('POST /api/releases returns 400 on invalid body payload', async () => {
    const invalidPayload = {
      name: '', // too short
      version: ''
    };

    const res = await request(app).post('/api/releases').send(invalidPayload);
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/releases/:id returns full release details', async () => {
    const res = await request(app).get(`/api/releases/${testReleaseId}`);
    expect(res.status).toBe(200);
    expect(res.body.release.id).toBe(testReleaseId);
    expect(res.body.validation.score).toBeGreaterThan(0);
  });

  it('GET /api/releases/:id returns 404 for unknown release ID', async () => {
    const res = await request(app).get('/api/releases/non_existent_id');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('PATCH /api/releases/:id updates release items and tracks changes', async () => {
    const updatePayload = {
      items: [
        { code: 'REL-001', category: 'feature', title: 'Apple Pay & Google Pay Checkout', description: 'Updated one-click pay' }, // modified
        { code: 'REL-002', category: 'bug_fix', title: 'Tax calculation rounding fix', description: 'Corrected sub-cent tax rounding' },
        { code: 'REL-003', category: 'affected_user_group', title: 'iOS and Android shoppers', description: 'All mobile shoppers' }
      ]
    };

    const res = await request(app).patch(`/api/releases/${testReleaseId}`).send(updatePayload);
    expect(res.status).toBe(200);
    expect(res.body.release.items[0].title).toBe('Apple Pay & Google Pay Checkout');
    expect(res.body.staleCheck.changedSourceCodes).toContain('REL-001');
  });

  it('POST /api/releases/:id/versions creates an immutable version snapshot', async () => {
    const res = await request(app)
      .post(`/api/releases/${testReleaseId}/versions`)
      .send({
        versionLabel: 'v3.0.0-rc1',
        changelogSummary: 'First release candidate with mobile pay additions.'
      });

    expect(res.status).toBe(201);
    expect(res.body.snapshot.versionLabel).toBe('v3.0.0-rc1');
  });

  it('POST /api/releases/:id/versions/compare compares two versions', async () => {
    // Create second snapshot
    await request(app)
      .post(`/api/releases/${testReleaseId}/versions`)
      .send({
        versionLabel: 'v3.0.0-rc2',
        changelogSummary: 'Second candidate.'
      });

    const res = await request(app)
      .post(`/api/releases/${testReleaseId}/versions/compare`)
      .send({
        baseVersionId: 'current',
        targetVersionId: 'current'
      });

    expect(res.status).toBe(200);
    expect(res.body.comparison).toBeDefined();
  });

  it('GET /api/releases/:id/brief compiles structured final brief', async () => {
    const res = await request(app).get(`/api/releases/${testReleaseId}/brief`);
    expect(res.status).toBe(200);
    expect(res.body.brief).toBeDefined();
    expect(res.body.markdown).toContain('Release Brief: E-Commerce Checkout Revamp');
  });
});
