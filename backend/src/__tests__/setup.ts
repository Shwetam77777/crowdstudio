// Runs before every test file. Sets the env vars that src/config.ts
// requires at import time (it throws if they're missing), so tests don't
// need a real .env file.
process.env.JWT_SECRET = "test-secret-do-not-use-in-prod";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = "http://localhost:5173";
