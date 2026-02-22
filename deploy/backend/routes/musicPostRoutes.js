import express from 'express';
import { pool } from '../database/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';
import { execFile } from 'child_process';
import { promisify } from 'util';
import requireAdmin from '../middleware/requireAdmin.js';

const execFileAsync = promisify(execFile);
const router = express.Router();

/* =========================
   Directory setup
========================= */

const uploadDir = path.resolve('uploads');
const pdfDir = path.join(uploadDir, 'pdf');
const mp3Dir = path.join(uploadDir, 'mp3');
const thumbnailDir = path.join(uploadDir, 'thumbnails');

const PUBLIC_UPLOADS = 'uploads';


for (const dir of [uploadDir, pdfDir, mp3Dir, thumbnailDir]) {
	await fs.mkdir(dir, { recursive: true });
}

/* =========================
   PDF → Thumbnail helper
========================= */

async function createPdfThumbnail(pdfPath) {
	const baseName = path.basename(pdfPath, path.extname(pdfPath));
	const outputBase = path.join(thumbnailDir, baseName);
	const generatedImage = `${outputBase}.jpg`;
	const finalImagePath = `${outputBase}_watermarked.jpg`;

	//Convert PDF → JPG
	await execFileAsync('pdftoppm', [
		'-jpeg',
		'-f', '1',
		'-singlefile',
		pdfPath,
		outputBase
	]);

	//Read image dimensions
	const { width, height } = await sharp(generatedImage).metadata();

	//SVG watermark (same size as image)
	// Use semi-transparent neutral color and scale font to better fit small thumbnails
	const computedFontSize = Math.max(18, Math.floor(Math.min(width, height) * 0.28));
	const svgWatermark = `
	<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
		<g transform="translate(${width / 2}, ${height / 2}) rotate(-45)">
			<text
				text-anchor="middle"
				dominant-baseline="middle"
				fill="rgba(0, 0, 0, 0.5)"
				font-size="${computedFontSize}"
				font-weight="700"
				font-family="Arial, sans-serif"
				style="letter-spacing: 2px"
			>
				SAMPLE
			</text>
		</g>
	</svg>
	`;

	//Composite watermark
	await sharp(generatedImage)
		.composite([{ input: Buffer.from(svgWatermark) }])
		.jpeg({ quality: 85 })
		.toFile(finalImagePath);

	await fs.unlink(generatedImage);

	return path.join(
		PUBLIC_UPLOADS,
		'thumbnails',
		path.basename(finalImagePath)
	);
}


/* =========================
   Multer config
========================= */

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (file.mimetype === 'application/pdf') {
			cb(null, pdfDir);
		} else if (
			file.mimetype === 'audio/mpeg' ||
			file.mimetype === 'audio/mp3'
		) {
			cb(null, mp3Dir);
		} else {
			cb(new Error('Invalid file type'));
		}
	},
	filename: (req, file, cb) => {
		cb(null, `${Date.now()}-${file.originalname}`);
	}
});

const upload = multer({
	storage,
	limits: { fileSize: 25 * 1024 * 1024 }
});

/* =========================
   Route
========================= */

router.post(
	'/',
	requireAdmin,
	upload.fields([
		{ name: 'pdf', maxCount: 1 },
		{ name: 'mp3', maxCount: 1 }
	]),
	async (req, res) => {
		const { title, composer, arranger, price } = req.body;

		const pdfFile = req.files?.pdf?.[0] ?? null;
		const mp3File = req.files?.mp3?.[0] ?? null;

		const pdfFilePath = pdfFile
			? path.join(PUBLIC_UPLOADS, 'pdf', path.basename(pdfFile.path))
			: null;

		const mp3FilePath = mp3File
			? path.join(PUBLIC_UPLOADS, 'mp3', path.basename(mp3File.path))
			: null;


		if (!title || !composer || !pdfFilePath) {
			return res.status(400).json({
				error: 'Title, composer, and PDF file are required'
			});
		}

		let thumbnailPath = null;

		try {
			thumbnailPath = await createPdfThumbnail(pdfFilePath);
		} catch (err) {
			console.error('Thumbnail generation failed:', err);
			return res
				.status(500)
				.json({ error: 'Failed to generate PDF thumbnail' });
		}

		try {
			const productResult = await pool.query(
				`INSERT INTO products
				 (title, composer, arranger, price, thumbnail_path)
				 VALUES ($1, $2, $3, $4, $5)
				 RETURNING *`,
				[title, composer, arranger, price, thumbnailPath]
			);

			await pool.query(
				`INSERT INTO product_files
				 (product_id, pdf_path, mp3_path)
				 VALUES ($1, $2, $3)`,
				[
					productResult.rows[0].id,
					pdfFilePath,
					mp3FilePath
				]
			);

			res.status(201).json(productResult.rows[0]);
		} catch (err) {
			console.error(err);
			res.status(500).json({
				error: 'Failed to create music post'
			});
		}
	}
);

export default router;
