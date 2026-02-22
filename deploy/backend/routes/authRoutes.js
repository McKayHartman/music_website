import crypto from 'crypto';
import express from 'express';
import { pool } from '../database/db.js';
import requireAuth from '../middleware/requireAuth.js';
import { signJwt } from '../utils/jwt.js';

const router = express.Router();
const SALT_BYTES = 16;
const SCRYPT_KEYLEN = 64;
let tableInitPromise = null;

async function ensureUsersTable() {
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password_hash TEXT;
      `);

      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
      `);

      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
      `);

      await pool.query(`
        UPDATE users
        SET role = 'customer'
        WHERE role IS NULL;
      `);
    })();
  }

  return tableInitPromise;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const hash = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash || '').split(':');
  if (!salt || !storedHash) return false;

  const calculated = crypto.scryptSync(password, salt, SCRYPT_KEYLEN).toString('hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  const calculatedBuffer = Buffer.from(calculated, 'hex');
  if (storedBuffer.length !== calculatedBuffer.length) return false;
  return crypto.timingSafeEqual(storedBuffer, calculatedBuffer);
}

function tokenResponse(user) {
  const token = signJwt({ sub: user.id, email: user.email, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  };
}

router.post('/register', async (req, res) => {
  await ensureUsersTable();

  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const passwordHash = hashPassword(password);

  try {
    const result = await pool.query(
      `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, 'customer')
        RETURNING id, email, role
      `,
      [email, passwordHash]
    );

    return res.status(201).json(tokenResponse(result.rows[0]));
  } catch (error) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

router.post('/login', async (req, res) => {
  await ensureUsersTable();

  const email = normalizeEmail(req.body?.email);
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query(
      `
        SELECT id, email, password_hash, role
        FROM users
        WHERE email = $1
      `,
      [email]
    );

    if (result.rowCount === 0 || !verifyPassword(password, result.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    return res.json(tokenResponse(result.rows[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  await ensureUsersTable();

  try {
    const result = await pool.query(
      `
        SELECT id, email, created_at
             , role
        FROM users
        WHERE id = $1
      `,
      [req.user.sub]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to load user profile' });
  }
});

export default router;
