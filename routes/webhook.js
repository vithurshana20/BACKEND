

// routes/webhookRoutes.js
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Stripe requires raw body parser for webhook
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;

