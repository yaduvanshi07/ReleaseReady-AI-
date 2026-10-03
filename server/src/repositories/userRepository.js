import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../database/db.js';

export class UserRepository {
  constructor(db = null) {
    this.db = db || getDb();
  }

  create({ name, email, password, role = 'engineer', avatar = null }) {
    const id = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();
    const cleanEmail = email.trim().toLowerCase();

    const stmt = this.db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, avatar, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, name.trim(), cleanEmail, passwordHash, role, avatar, now, now);

    return this.findById(id);
  }

  findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const stmt = this.db.prepare(`
      SELECT id, name, email, password_hash, role, avatar, created_at, updated_at
      FROM users
      WHERE email = ?
    `);
    const row = stmt.get(cleanEmail);
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  findById(id) {
    if (!id) return null;
    const stmt = this.db.prepare(`
      SELECT id, name, email, role, avatar, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      avatar: row.avatar,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  validatePassword(user, password) {
    if (!user || !user.passwordHash || !password) return false;
    return bcrypt.compareSync(password, user.passwordHash);
  }

  getAll() {
    const stmt = this.db.prepare(`
      SELECT id, name, email, role, avatar, created_at, updated_at
      FROM users
      ORDER BY created_at ASC
    `);
    return stmt.all();
  }
}
