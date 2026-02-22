import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../.env', import.meta.url).pathname });

const DEFAULT_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

function base64UrlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlEncodeJson(value) {
  return base64UrlEncode(JSON.stringify(value));
}

function base64UrlDecode(input) {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(padLength), 'base64').toString('utf8');
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

function createSignature(headerBase64, payloadBase64, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${headerBase64}.${payloadBase64}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function signJwt(payload, options = {}) {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = options.expiresIn ?? DEFAULT_EXPIRY_SECONDS;

  const headerBase64 = base64UrlEncodeJson({ alg: 'HS256', typ: 'JWT' });
  const payloadBase64 = base64UrlEncodeJson({
    ...payload,
    iat: now,
    exp: now + expiresIn
  });

  const signature = createSignature(headerBase64, payloadBase64, getJwtSecret());
  return `${headerBase64}.${payloadBase64}.${signature}`;
}

export function verifyJwt(token) {
  if (!token || typeof token !== 'string') {
    throw new Error('Missing token');
  }

  const [headerBase64, payloadBase64, signature] = token.split('.');
  if (!headerBase64 || !payloadBase64 || !signature) {
    throw new Error('Invalid token format');
  }

  const expectedSignature = createSignature(headerBase64, payloadBase64, getJwtSecret());
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (providedBuffer.length !== expectedBuffer.length) {
    throw new Error('Invalid token signature');
  }
  const valid = crypto.timingSafeEqual(providedBuffer, expectedBuffer);
  if (!valid) {
    throw new Error('Invalid token signature');
  }

  const payload = JSON.parse(base64UrlDecode(payloadBase64));
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
