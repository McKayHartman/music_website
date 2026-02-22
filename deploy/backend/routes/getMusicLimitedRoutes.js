import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		// Support pagination via query params: page & pageSize
		// If pageSize is not provided, keep legacy behavior (limit 3)
		const page = parseInt(req.query.page) || 1;
		const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : null;

		if (!pageSize) {
			const musicPosts = await pool.query(
				`SELECT * FROM products
				WHERE is_active=true
				ORDER BY id DESC
				LIMIT 3`
			);
			return res.status(200).json(musicPosts.rows);
		}

		const offset = (page - 1) * pageSize;

		// Get total count
		const countRes = await pool.query(`SELECT COUNT(*) FROM products WHERE is_active=true`);
		const total = parseInt(countRes.rows[0].count, 10);

		const musicPosts = await pool.query(
			`SELECT * FROM products
			WHERE is_active=true
			ORDER BY id DESC
			LIMIT $1 OFFSET $2`,
			[pageSize, offset]
		);

		return res.status(200).json({ items: musicPosts.rows, total });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to retrieve music posts' });
	}
});

// GET individual music piece by ID
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const musicPost = await pool.query(
			`SELECT * FROM products
			WHERE id = $1 AND is_active = true`,
			[id]
		);

		if (musicPost.rows.length === 0) {
			return res.status(404).json({ error: 'Music piece not found' });
		}

		res.status(200).json(musicPost.rows[0]);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to retrieve music piece' });
	}
});

export default router;