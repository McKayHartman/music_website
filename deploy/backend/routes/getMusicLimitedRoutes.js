import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {

		const musicPosts = await pool.query(
			`SELECT * FROM products
			WHERE is_active=true`
		);
		res.status(200).json(musicPosts.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to retrieve music posts' });
	}
});

export default router;