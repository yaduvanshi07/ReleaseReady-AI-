import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { getDb } from '../src/database/db.js';
import { initializeSchema } from '../src/database/schema.js';
import { seedDatabase } from '../src/database/seed.js';

describe('Authentication API (Passport.js Local & JWT)', () => {
  let app;
  let db;

  beforeEach(() => {
    db = getDb(':memory:');
    initializeSchema(db);
    seedDatabase(db);
    app = createApp({ db });
  });

  it('allows logging in with pre-seeded demo credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@releaseready.ai',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('demo@releaseready.ai');
    expect(res.body.user.role).toBe('engineer');
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@releaseready.ai',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('registers a new user and returns JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Smith',
        email: 'jordan.smith@company.io',
        password: 'SecurePassword123!',
        role: 'release_manager'
      });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('jordan.smith@company.io');
    expect(res.body.user.name).toBe('Jordan Smith');
  });

  it('supports one-click demo login endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/demo')
      .send({ role: 'qa_lead' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('reviewer@releaseready.ai');
  });

  it('authenticates protected /api/auth/me endpoint via Bearer token', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@releaseready.ai',
        password: 'Password123!'
      });

    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('demo@releaseready.ai');
  });
});
