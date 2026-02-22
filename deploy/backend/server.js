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
import path from 'path';


dotenv.config();

const app = express();

app.use(express.json());

app.use('/uploads', express.static(path.resolve('uploads')));

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

app.listen(PORT, () => {
	console.log(`backend running on port ${PORT}`);
});

