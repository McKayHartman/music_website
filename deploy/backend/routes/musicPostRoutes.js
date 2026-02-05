import express from 'express';
import { pool } from '../database/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();



// Directory constants
const uploadDir = '../uploads';
const pdfDir = `${uploadDir}/pdf`;
const mp3Dir = `${uploadDir}/mp3`;

// Ensure upload directories exist
[pdfDir, mp3Dir].forEach(dir => {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
});

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') {
			cb(null, pdfDir);
		} else if (file.mimetype === 'audio/mpeg') {
			cb(null, mp3Dir);
		} else {
			cb(new Error('Invalid file type'), null);
		}
	},
	filename: (req, file, cb) => {
		const uniqueName = `${Date.now()}-${file.originalname}`;
		cb(null, uniqueName);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});



router.post('/',
	upload.fields([
		{ name: 'pdf', maxCount: 1 },
		{ name: 'mp3', maxCount: 1 }
	]),

	async (req, res) => {
		const { title, composer, arranger, price } = req.body;

		const pdfFilePath = req.files?.pdf?.[0]?.path || null;
		const mp3FilePath = req.files?.mp3?.[0]?.path || null;

		console.log('Received data:', { title, composer, arranger, price, pdfFilePath, mp3FilePath });

		if (!title || !composer || !pdfFilePath) {
			return res.status(400).json({ error: 'Title, composer, and PDF file are required' });
		}	

		try {
			const info = await pool.query(
				`INSERT INTO products (title, composer, arranger, price)
				VALUES ($1, $2, $3, $4) RETURNING *`,
				[title, composer, arranger, price]
			);

			const files = await pool.query(
				`INSERT INTO product_files (product_id, pdf_path, mp3_path)
				VALUES ($1, $2, $3) RETURNING *`,
				[info.rows[0].id, pdfFilePath, mp3FilePath]
			);
			res.status(201).json(info.rows[0]);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: 'Failed to create music post' });
		}
	}
)





export default router;
