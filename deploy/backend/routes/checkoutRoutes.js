import express from 'express';
import Stripe from 'stripe';
import { pool } from '../database/db.js';
import requireAuth from '../middleware/requireAuth.js';
import { ensurePurchaseTables, recordOrderFromCheckoutSession } from '../utils/purchaseStore.js';

const router = express.Router();

function normalizeProductIds(rawProductIds) {
  if (!Array.isArray(rawProductIds)) return [];
  return rawProductIds
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);
}

router.post('/create-session', requireAuth, async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const productIds = normalizeProductIds(req.body?.productIds);

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover'
  });

  if (productIds.length === 0) {
    return res.status(400).json({ error: 'At least one product is required' });
  }

  const quantityByProductId = new Map();
  for (const productId of productIds) {
    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + 1);
  }

  try {
    await ensurePurchaseTables();

    const productsResult = await pool.query(
      `
        SELECT id, title, price
        FROM products
        WHERE id = ANY($1::int[])
      `,
      [[...quantityByProductId.keys()]]
    );

    if (productsResult.rowCount !== quantityByProductId.size) {
      return res.status(400).json({ error: 'One or more products are invalid' });
    }

    const purchasedResult = await pool.query(
      `
        SELECT DISTINCT oi.product_id
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
          AND o.status = 'paid'
          AND oi.product_id = ANY($2::int[])
      `,
      [req.user.sub, [...quantityByProductId.keys()]]
    );

    if (purchasedResult.rowCount > 0) {
      return res.status(409).json({
        error: 'One or more items in your cart were already purchased. Remove them before checkout.'
      });
    }

    const lineItems = productsResult.rows.map((product) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: product.title },
        unit_amount: Math.round(Number(product.price) * 100)
      },
      quantity: quantityByProductId.get(Number(product.id)) || 1
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${frontendUrl}/my-purchases?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/cart?checkout=canceled`,
      metadata: {
        user_id: String(req.user.sub),
        product_ids: JSON.stringify(productIds)
      }
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/complete-session', requireAuth, async (req, res) => {
  const sessionId = String(req.body?.sessionId || '').trim();

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'STRIPE_SECRET_KEY is not configured' });
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover'
  });

  try {
    await ensurePurchaseTables();

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const sessionUserId = Number(session?.metadata?.user_id);

    if (!Number.isInteger(sessionUserId) || sessionUserId !== Number(req.user.sub)) {
      return res.status(403).json({ error: 'Session does not belong to current user' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(409).json({ error: 'Payment is not completed yet' });
    }

    await recordOrderFromCheckoutSession(session);
    return res.json({ message: 'Checkout session finalized' });
  } catch (error) {
    console.error('Error finalizing checkout session:', error);
    return res.status(500).json({ error: 'Failed to finalize checkout session' });
  }
});

export default router;
