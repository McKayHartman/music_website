// GET all music posts regardless of active status

import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		const musicPosts = await pool.query(
			`SELECT p.id, p.title, p.composer, p.arranger, p.price,
					pf.pdf_path, pf.mp3_path
			FROM products p
			LEFT JOIN product_files pf ON p.id = pf.product_id`
		);
		res.status(200).json(musicPosts.rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to retrieve music posts' });
	}
});

export default router;