import express from 'express';
import { pool } from '../database/db.js';
import fs from 'fs/promises';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// DELETE /api/music/:id
router.delete('/:id', requireAdmin, async (req, res) => {
	const { id } = req.params;

	try {
		console.log(`Attempting to delete music post with ID: ${id}`);

		//Get file paths BEFORE deleting DB rows
		const filesResult = await pool.query(
			`
			SELECT 
				pf.pdf_path,
				pf.mp3_path,
				p.thumbnail_path
			FROM products p
			LEFT JOIN product_files pf ON pf.product_id = p.id
			WHERE p.id = $1
			`,
			[id]
		);

		if (filesResult.rowCount === 0) {
			return res.status(404).json({ error: 'Music post not found' });
		}

		const { pdf_path, mp3_path, thumbnail_path } = filesResult.rows[0];

		//Delete files from disk
		const filesToDelete = [
			pdf_path,
			mp3_path,
			thumbnail_path
		].filter(Boolean);

		await Promise.all(
			filesToDelete.map(filePath =>
				fs.unlink(filePath).catch(err => {
					if (err.code !== 'ENOENT') throw err;
				})
			)
		);

		// Delete DB rows
		await pool.query('DELETE FROM product_files WHERE product_id = $1', [id]);

		const deleteResult = await pool.query(
			'DELETE FROM products WHERE id = $1 RETURNING *',
			[id]
		);

		res.status(200).json({
			message: 'Music post deleted successfully',
			deletedPost: deleteResult.rows[0]
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Failed to delete music post' });
	}
});

export default router;
