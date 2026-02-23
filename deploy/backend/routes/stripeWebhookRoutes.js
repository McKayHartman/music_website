import express from 'express';
import Stripe from 'stripe';
import { recordOrderFromCheckoutSession } from '../utils/purchaseStore.js';

const router = express.Router();

router.post('/', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(500).json({ error: 'Stripe webhook is not fully configured' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover'
  });

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ error: 'Missing Stripe signature header' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Stripe webhook signature validation failed:', error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await recordOrderFromCheckoutSession(event.data.object);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    return res.status(500).json({ error: 'Failed to process Stripe webhook event' });
  }
});

export default router;
