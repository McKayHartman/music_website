import { pool } from '../database/db.js';

let tableInitPromise = null;

function parseProductIds(metadataValue) {
  if (!metadataValue) return [];

  try {
    const parsed = JSON.parse(metadataValue);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id) && id > 0);
  } catch {
    return [];
  }
}

function toDollars(cents) {
  const value = Number(cents || 0) / 100;
  return Number(value.toFixed(2));
}

export async function ensurePurchaseTables() {
  if (!tableInitPromise) {
    tableInitPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          stripe_session_id TEXT UNIQUE NOT NULL,
          stripe_payment_intent_id TEXT,
          total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
          currency TEXT NOT NULL DEFAULT 'usd',
          status TEXT NOT NULL DEFAULT 'pending',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
          unit_price NUMERIC(10, 2) NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
    })();
  }

  return tableInitPromise;
}

export async function recordOrderFromCheckoutSession(session) {
  await ensurePurchaseTables();

  const userId = Number(session?.metadata?.user_id);
  const productIds = parseProductIds(session?.metadata?.product_ids);
  const sessionId = String(session?.id || '');
  const paymentIntentId = session?.payment_intent
    ? String(session.payment_intent)
    : null;
  const currency = String(session?.currency || 'usd');
  const status = session?.payment_status === 'paid' ? 'paid' : 'pending';
  const totalAmount = toDollars(session?.amount_total);

  if (!Number.isInteger(userId) || userId <= 0 || !sessionId || productIds.length === 0) {
    throw new Error('Invalid checkout session metadata');
  }

  const quantityByProductId = new Map();
  for (const productId of productIds) {
    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + 1);
  }

  const productResult = await pool.query(
    `
      SELECT id, price
      FROM products
      WHERE id = ANY($1::int[])
    `,
    [[...quantityByProductId.keys()]]
  );

  const unitPriceByProductId = new Map(
    productResult.rows.map((row) => [Number(row.id), Number(row.price)])
  );

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderInsertResult = await client.query(
      `
        INSERT INTO orders
          (user_id, stripe_session_id, stripe_payment_intent_id, total_amount, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (stripe_session_id) DO NOTHING
        RETURNING id
      `,
      [userId, sessionId, paymentIntentId, totalAmount, currency, status]
    );

    if (orderInsertResult.rowCount === 0) {
      await client.query('COMMIT');
      return;
    }

    const orderId = orderInsertResult.rows[0].id;

    for (const [productId, quantity] of quantityByProductId.entries()) {
      const unitPrice = unitPriceByProductId.get(productId);
      if (unitPrice === undefined) {
        continue;
      }

      await client.query(
        `
          INSERT INTO order_items
            (order_id, product_id, unit_price, quantity)
          VALUES ($1, $2, $3, $4)
        `,
        [orderId, productId, unitPrice, quantity]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
