import express from 'express';
import { pool } from '../database/db.js';

const router = express.Router();


router.get('/', async (req, res) => {
	  try {
		const result = await pool.query('SELECT id, email FROM users');
		res.json(result.rows);
	  } catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database test error' })
	  }
});

router.post('/', async (req, res) => {
	const { name }  = req.body;
	res.json({ message: `Hello ${name}, POST route works.` })
});

export default router;