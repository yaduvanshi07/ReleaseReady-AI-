import { createApp } from './app.js';
import { getDb } from './database/db.js';
import { initializeSchema } from './database/schema.js';
import { seedDatabase } from './database/seed.js';

const PORT = process.env.PORT || 5000;

// Initialize SQLite schema and seed sample data
try {
  const db = getDb();
  initializeSchema(db);
  seedDatabase(db);
  console.log('✅ SQLite database initialized and verified successfully.');
} catch (err) {
  console.error('❌ Database initialization error:', err);
  process.exit(1);
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 ReleaseReady AI server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Gemini AI status: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing API Key (offline mode active)'}`);
});
