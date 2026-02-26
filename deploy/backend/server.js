// This is the main server component for the backend
// This files houses only the server setup and configs
// Keep route handlers in ./routes

// Backend is running on the specified .env PORT or 3000

import express from "express";
import dotenv from 'dotenv';
import testroutes from './routes/testroutes.js';
import musicPostRoutes from './routes/musicPostRoutes.js';
import getMusicRoutes from './routes/getMusicRoutes.js';
import getMusicLimitedRoutes from './routes/getMusicLimitedRoutes.js';
import deletionRoutes from './routes/deletionRoutes.js';
import authRoutes from './routes/authRoutes.js';
import checkoutRoutes from './routes/checkoutRoutes.js';
import stripeWebhookRoutes from './routes/stripeWebhookRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import path from 'path';


dotenv.config({ path: new URL('./.env', import.meta.url).pathname });

const app = express();

app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhookRoutes);
app.use(express.json());

app.use('/uploads/thumbnails', express.static(path.resolve('uploads/thumbnails')));

const PORT = process.env.PORT || 3000;

app.get('/ping', (req, res) => {
	res.json({ message: 'pong'});
});

app.use('/test', testroutes);
app.use('/api/auth', authRoutes);
app.use('/api/music-posts', musicPostRoutes);
app.use('/api/music', getMusicRoutes);
app.use('/api/music-limited', getMusicLimitedRoutes)
app.use('/api/music', deletionRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/purchases', purchaseRoutes);

app.listen(PORT, () => {
	console.log(`backend running on port ${PORT}`);
});
